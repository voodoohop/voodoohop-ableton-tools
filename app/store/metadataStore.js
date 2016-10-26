import { Map, Set, Record } from 'immutable';

import * as most from 'most';

import hold from '@most/hold';

import { getTransformed } from '../transforms/audioMetadataGenerator';

import { invalidateCache, cache as dbCache } from '../api/db';

import actionStream from '../api/actionSubject';

import Subject from '../utils/subject';
// var throttler=Subject();

import fs from 'fs';
import log from '../utils/streamLog';

import { livedataStore } from './';

export const getPathPromise = (path) => {
    // console.log("getting dbpath cache",path);
    return dbCache(path, () => new Promise((resolve, reject) => getTransformed([
        'path',
        'pathStat',
        'id3Metadata',
        'audioMetadata',
        'warpMarkers',
        'waveform',
        'waveformLPF'
    ], most.of(path)).tap(log('gotTransformed')).observe(resolve).catch(reject)));
};

import diff from 'immutablediff';

const ReloadablePath = Record({ path: null, reload: false });

const reloadPaths = actionStream.filter(a => a.get('type') === 'reloadMetadata')
    .map(a => a.get('path'))
    .tap(log("reloadPaths"));

const livePaths = livedataStore
    .map(ds => ds.map(d => d.get('file_path')))
    .map(ds => ds.filter(d => d).toSet())
    .skipImmRepeats()
    .tap(log('file_paths'))
    .multicast();

const loadedMetadata = livePaths.combinePrevious((prev, next) => next.subtract(prev))
    .flatMap(most.from)
    .skipImmRepeats()
    .merge(reloadPaths)
    // .skipImmRepeats()
    .map(getPathPromise)
    .await()
    // .flatMap(paths =>
    // most.from(paths.map(getPathPromise)).flatMap(most.fromPromise))
    .tap(log("file_path_new"))
    .multicast();

const metadataStore2Store = livePaths.combine((waitingForMetadata, loaded) => [
    waitingForMetadata, loaded
], loadedMetadata).scan((store, [waitingForMetadata, loaded]) => store.filter((value, path) => waitingForMetadata.contains(path)).set(loaded.get('path'), loaded), Map()).multicast();
// .observe(log("metadataStore2")).catch(log("metadataStore2Error"));

const store = hold(metadataStore2Store);

export default store;

// watching for change
// TODO incorporate removed paths and remove watch listener

const removedPaths = livePaths.combinePrevious((prev, next) => next.subtract(prev));

const pathsToBeWatched = loadedMetadata
    // .merge(preloadedMetadataToWatch.tap(log("metadata loading for problem")))
    .flatMap(m => most.from([
        m, m.get('warpMarkers')
    ].filter(e => e.has && e.get('path'))).map(e => Map({
        target: m,
        watchPath: e.get('path'),
        watchStat: e.get('pathStat')
    })))
    .tap(log('goingToWatch'))
    .multicast();

const pathsChangedSinceStart = pathsToBeWatched
    // .tap(p => console.log('watchtimes', p.get('watchPath'), new
    // Date(fs.statSync(p.get('watchPath')).mtime).getTime(), new
    // Date(p.get('watchStat').get('mtime')).getTime()))
    .flatMap(p => most.fromPromise(new Promise((resolve) => {
        console.log('watching', p.get('watchPath'));
        const watcher = fs.watch(p.get('watchPath'), () => {
            console.log('unwatching', p.get('watchPath'));
            watcher.close();
            resolve(p);
        });
    })));

const pathsChangedFile = pathsToBeWatched
    // .tap(log("pathsChangedFile22")) .merge()
    .filter(p => p.get("watchStat") !== undefined).filter(p => new Date(fs.statSync(p.get("watchPath")).mtime).getTime() - new Date(p.get("watchStat").get("mtime")).getTime() > 0).tap(log("watching pathChanged, sending reloadMetadata"));

actionStream.plug(most.merge(pathsChangedSinceStart, pathsChangedFile).tap(log('pathsChangedSinceStart1')).map(p => invalidateCache(p.getIn(['target', 'path']))).await().tap(log('pathsChangedSinceStart2')).map(path => Map({ type: 'reloadMetadata', path })));
