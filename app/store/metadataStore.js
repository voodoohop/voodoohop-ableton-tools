import {Map} from 'immutable';

import * as most from 'most';

import hold from '@most/hold';

import {
    getTransformed
} from '../transforms/audioMetadataGenerator';

import {
    invalidateCache,
    cache as dbCache
} from '../api/db';


import actionStream from '../api/actionSubject';

import Subject from '../utils/subject';
// var throttler=Subject();

import fs from 'fs';
import log from '../utils/streamLog';
// import _ from "lodash";

// const getNextTransformed = Subject();
// // console.log("pushMethod",getNextTransformed.push);


// // getNextTransformed.skip(1).debounce(10000).constant("timeout").tap(log("metadata load timedOut")).observe(getNextTransformed.push);
// const startEverything = _.once(() => getNextTransformed.push(true));


// //    actionStream.plug(loadPaths.map(path=> Map({type:"metadataLoading",path})));


// const metadataStore = dataStore("audioMetaData", (saved) => {
//     // console.log("loading paths paths", saved.toJS());
//     const loadPaths = actionStream.filter(a => a.get("type") === "loadMetadata"
//         || a.get("type") === "reloadMetadata" || a.get("type") === "livePathReceived")
//         .tap(log("beforeLoadMetadata"))
//         .loop((paths, f) => {
//             if (f.get("type") === "reloadMetadata")
//                 return { value: f.get("path"), seed: paths };
//             var path = f.get("path");
//             if (paths.has(path))
//                 return { value: null, seed: paths };
//             else
//                 return { value: path, seed: paths.add(path) };
//         }, Immutable.Set(saved.keySeq())).filter(p => p !== null)
//         // .bufferedThrottle(100)
//         .tap(startEverything)
//         // .zip(d => d, getNextTransformed)
//         .tap(log("loadPaths"))
//         .multicast();


//     var metadata = getTransformed(["path", "pathStat", "id3Metadata", "audioMetadata", "warpMarkers", "waveform", "waveformLPF"],//, "vampChord_HPA", "vampChord_QM"],
//         loadPaths
//         .zip(path=> path,
//             most.fromPromise(new Promise(resolve => setTimeout(() => resolve(metadata)))).flatMap(metadata => metadata.startWith(null))
//         // .tap(log("actually requesting metadata load"))
//         ).tap(log("got path to load")))
//         // .skipRepeats()
//         .tap(log("metadata loaded"))
//         .map(e => e.set("error",false))
//         .flatMapError(e => { console.error("metadata load error", e); return (Immutable.fromJS({ error: e })); })

//         // .tap(() => getNextTransformed.push(true))
//         // .filter(m => )
//         .multicast();

//     actionStream.plug(metadata.map(m => Map({ type: "metadataLoaded", path: m.get("path") })));

//     const eachReceivedPathOnce = receivedPaths => receivedPaths
//         .loop((readPaths, newPath) => readPaths.has(newPath) ? { seed: readPaths, value: most.empty() } : { seed: readPaths.add(newPath), value: most.of(newPath) }, Immutable.Set()).flatMap(f => f);

//     const savedMetadataToBeWatched$ = eachReceivedPathOnce(actionStream.filter(a => a.get("type") === "livePathReceived").map(a => a.get("path")))
//         // .tap(log("eachReceivedPathOnce"))
//         .map(k => saved.get(k)).filter(s => s)
//         // .tap(log("savedMetadataToBeWatched$"))
//         ;
//     var pathsToBeWatched = metadata.merge(savedMetadataToBeWatched$)
//         // .merge(preloadedMetadataToWatch.tap(log("metadata loading for problem")))
//         .flatMap(m => most.from([m, m.get("warpMarkers")].filter(e => e.has && e.get("path")))
//             .tap(log("goingToWatch"))
//             .map(e => Map({ target: m, watchPath: e.get("path"), watchStat: e.get("pathStat") }))).multicast();


//     // pathsToBeWatched.map(p => p.toJS()).observe(log("pathsToBeWatched")).catch(e => console.error(e));


//   const pathsChangedSinceStart = pathsToBeWatched
//         .tap(p => console.log("watchtimes", p.get("watchPath"), new Date(fs.statSync(p.get("watchPath")).mtime).getTime(), new Date(p.get("watchStat").get("mtime")).getTime()))
//         .flatMap(p => most.fromPromise(new Promise(resolve => {
//             console.log("watching", p.get("watchPath"));
//             const watcher = fs.watch(p.get("watchPath"), () => { console.log("unwatching", p.get("watchPath")); watcher.close(); resolve(p); })
//         })));
//     // .observe(p => console.log("pathsChangedWatched",p.toJS()));
//   const pathsChangedFile = pathsToBeWatched
//         // .tap(log("pathsChangedFile22"))
//         // .merge()
//         .filter(p => p.get("watchStat") !== undefined)

//         .filter(p => new Date(fs.statSync(p.get("watchPath")).mtime).getTime() - new Date(p.get("watchStat").get("mtime")).getTime() > 0)
//         .merge(pathsChangedSinceStart)
//         .tap(log("watching pathChanged, sending reloadMetadata"));

//     // pathsChangedFile.observe(log("pathsChangedFile")).catch(e => console.error(e));
//   actionStream.plug(pathsChangedFile.tap(log("pathsChangedFile")).map(p => Map({ type: "reloadMetadata", path: p.get("target").get("path") })));


//   return metadata
//         .merge(actionStream.filter(a => a.get("type") === "mergeMetadata").map(a => a.get("data").set("path", a.get("path"))))
//         .tap(log("sending to store"))
// })
//     .flatMapError(e => { console.error(e); return Immutable.fromJS({ error: e }); })

// var preloadedMetadataToWatch=metadataStore.take(1).flatMap(m => most.from(m.toArray())).tap(log("preloadedMetadaToWatch"));
// observe(p => console.log("pathsChanged",p.toJS()));

import {
    livedataStore
} from './';

const getPathPromise = (path) => {
    // console.log("getting dbpath cache",path);
  return dbCache(path, () =>
        new Promise((resolve, reject) =>
            getTransformed(['path', 'pathStat', 'id3Metadata', 'audioMetadata', 'warpMarkers', 'waveform', 'waveformLPF'], most.of(path))
            .tap(log('gotTransformed'))
            .observe(resolve).catch(reject)
        )
    );
};

const reloadPaths = actionStream
    .filter(a => a.get('type') === 'reloadMetadata')
    .map(a => a.get('path'));

const livePaths = livedataStore
    .map(ds => ds.map(d => d.get('file_path')))
    .map(ds => ds.filter(d => d))
    .skipImmRepeats()
    .tap(log('file_paths'));


const metadataStore2 = 
livePaths
    .map(paths => paths.toSetSeq())
    .combine((paths,reloadPath) => 
        paths.map(path=>({ path, reload: path==reloadPath }))
    , reloadPaths.startWith(null))
    .tap(log("metadataStoreBeforeScan"))
    .scan((promises, newPaths) =>
        newPaths.toMap().mapEntries(([_, path]) =>
            [path.path, (!path.reload && promises.get(path.path)) || getPathPromise(path.path)]
        )
    , Map())
    .skipImmRepeats()
    .multicast();


const loadedMetadata = metadataStore2.flatMap(promises =>
    most.from(promises.toArray())
).await();

const pathsToBeWatched = loadedMetadata
        // .merge(preloadedMetadataToWatch.tap(log("metadata loading for problem")))
        .flatMap(m => most.from([m, m.get('warpMarkers')].filter(e => e.has && e.get('path')))
            .map(e => Map({ target: m, watchPath: e.get('path'), watchStat: e.get('pathStat') })))
               .tap(log('goingToWatch'))
               .multicast();

const pathsChangedSinceStart = pathsToBeWatched
        .tap(p => console.log('watchtimes', p.get('watchPath'), new Date(fs.statSync(p.get('watchPath')).mtime).getTime(), new Date(p.get('watchStat').get('mtime')).getTime()))
        .flatMap(p => most.fromPromise(new Promise((resolve) => {
          console.log('watching', p.get('watchPath'));
          const watcher = fs.watch(p.get('watchPath'), () => { console.log('unwatching', p.get('watchPath')); watcher.close(); resolve(p); });
        })));

actionStream.plug(pathsChangedSinceStart
    .tap(log('pathsChangedSinceStart1'))
    .map(p => invalidateCache(p.getIn(['target', 'path'])))
    .await()
        .tap(log('pathsChangedSinceStart2'))
    .map(path => Map({ type: 'reloadMetadata', path })));


const metadataStore2Store = metadataStore2
    .combine((waitingForMetadata, loaded) => [waitingForMetadata, loaded], loadedMetadata)
    .scan((store, [waitingForMetadata, loaded]) =>
        store
        .filter((value, path) => waitingForMetadata.has(path))
        .set(loaded.get('path'), loaded), Map());
// .observe(log("metadataStore2")).catch(log("metadataStore2Error"));


const store = hold(metadataStore2Store);

export default store;

