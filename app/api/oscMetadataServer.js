import { oscInputStream, oscOutput } from '../utils/oscInOut';

import { getPathPromise } from '../store/metadataStore';
import combinedState from '../store/combinedState';

import { Map, fromJS } from 'immutable';

import actionStream from './actionSubject';

import { from, fromPromise } from 'most';

import log from '../utils/streamLog';

import { keyFormatter$, keysToCamelot, keysToOpenkey } from '../api/openKeySequence';

const loadingMetadata = oscInputStream
    .filter(([cmd, value]) => cmd == 'get_metadata')
    .map(([_, path, requestedTag]) => ({ path, requestedTag }))
    .tap(log('getMetadataRequested'))
    .multicast();


oscOutput.plug(loadingMetadata
    .map(({ path, requestedTag }) => ({ promise: getPathPromise(path), requestedTag }))
    .tap(log('pathPromise metadataServer'))
    // .await()
    .flatMap(({ promise, requestedTag }) => fromPromise(promise.then(metadata => ({ metadata, requestedTag }))))
    // .map(d => d.get("metadata"))
    .filter(({ metadata }) => metadata.get('id3Metadata'))
    .map(({ metadata, requestedTag }) => metadata
        .get('id3Metadata')
        .set('path', metadata.get('path'))
        .set('warpBpm', metadata.getIn(['warpMarkers', 'baseBpm']))
        .set('requestedTag', requestedTag)
    )
    .map(d => d.get('initialkey') ? d.set('camelotKey', keysToCamelot(d.get('initialkey'))) : d)
    .combine((d, keyFormatter) => d.set('formattedKey', keyFormatter(d.get('initialkey'))), keyFormatter$)
    .tap(log('beforeFlatMap'))
    .flatMap(d => from(d
        .filter((val, key) => val !== undefined && (!d.get('requestedTag') || d.get('requestedTag') === key))
        .toOrderedMap()
        .set('done', 'true')
        .map((val, key) => Map({ trackId: 'got_metadata', args: fromJS([d.get('path'), key, val]) }))
        .toArray()))
    .tap(log('sendingBack'))
);



const tracksRequested = oscInputStream
    // .tap(([cmd,data]) => console.log("cmd,data",cmd,data))
    .filter(([cmd, value]) => cmd == 'get_tracks')
    // .map(([_, path]) => path)
    // .tap(log("getMetadataPath"))
    // .flatMap(
    //     path => metadataStore.map(metadata => Map({path, metadata:metadata.getIn([path,"id3Metadata"])})).skipImmRepeats()
    // )
    .constant(true)
    .tap(log('getTracksRequested'))
    .multicast();

export const availableTracks$ = combinedState
    .map(s => s.get('tracks').keySeq())
    .map(trackNames => trackNames.filter(name => name !== 'selectedClip'))
    .startWith(fromJS([]))
    .skipImmRepeats()
    .multicast();

oscOutput.plug(
    availableTracks$
        .sampleWith(tracksRequested)
        .map(trackIds => Map({ trackId: 'got_tracks', args: trackIds }))
)
    // .combine(
    //     (path,metadata) => metadata.contains(path) ? 
    //         most.of(metadata.get(path))
    //         :

    //         , metadataStore)

    // ;