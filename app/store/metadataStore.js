import Immutable from "immutable";

import * as most from 'most';

import {getTransformed} from "../api/audioMetadataGenerator";

import {dataStore} from "../api/db";


import actionStream from "../api/actionSubject";

import Subject from "../utils/Subject";
// var throttler=Subject();

import fs from "fs";
import log from "../utils/streamLog";




var createMetadataStore = (actionStream) => {

	

    // const getNextTransformed = Subject(true);
    // console.log("pushMethod",getNextTransformed.push);


    
    // getNextTransformed.skip(1).debounce(10000).constant("timeout").tap(log("metadata load timedOut")).observe(getNextTransformed.push);
    
    
    

        
//    actionStream.plug(loadPaths.map(path=> Immutable.Map({type:"metadataLoading",path})));

   
    const metadataStore = dataStore("audioMetaData",(saved) => { 
        console.log("loading paths paths",saved.toJS());
            const loadPaths = actionStream.filter(a => a.get("type") === "loadMetadata"
     || a.get("type") === "reloadMetadata" || a.get("type") === "livePathReceived")
        .loop((paths, f) => {
            if (f.get("type") === "reloadMetadata")
              return {value: f.get("path"), seed:paths};
            var path = f.get("path");
            if (paths.has(path))
                return { value: null, seed: paths };
            else
                return { value: path, seed: paths.add(path) };
        }, Immutable.Set(saved.keySeq())).filter(p => p !== null)
        .bufferedThrottle(100)
        // .zip(d => d, getNextTransformed)
        .tap(log("loadPaths"))
        .multicast();

    var metadata = getTransformed(["path", "pathStat", "id3Metadata", "audioMetadata", "warpMarkers", "waveform","waveformLPF"],//, "vampChord_HPA", "vampChord_QM"],
        loadPaths.tap(log("got path to load"))
            // .tap(log("actually requesting metadata load"))
            )
        // .skipRepeats()
        .tap(log("metadata loaded"))
        .flatMapError(e => { console.error("metadata load error",e); return (Immutable.fromJS({ error: e })); })
        // .tap(() => getNextTransformed.push(true))
        // .filter(m => )
        .multicast();
        
    actionStream.plug(metadata.map(m=>Immutable.Map({type:"metadataLoaded", metadata:m})));

    var pathsToBeWatched = metadata.merge(most.from(saved.valueSeq().toArray()))
            // .merge(preloadedMetadataToWatch.tap(log("metadata loading for problem")))
            .flatMap(m => most.from([m,m.get("warpMarkers")].filter(e => e.has && e.get("path")))
            // .tap(log("goingToWatch"))
            .map(e => Immutable.Map({ target: m, watchPath: e.get("path"), watchStat: e.get("pathStat") }))).multicast();



    pathsToBeWatched.map(p => p.toJS()).observe(log("pathsToBeWatched")).catch(e => console.error(e));


    var pathsChangedSinceStart = pathsToBeWatched
            .tap(p=> console.log("watchtimes", p.get("watchPath"), new Date(fs.statSync(p.get("watchPath")).mtime).getTime(), new Date(p.get("watchStat").get("mtime")).getTime()))
    .flatMap(p => most.fromPromise(new Promise(resolve => {
        let watcher = null;
        // console.log("trying to watch path", p);
        console.log("watching", p.get("watchPath"));
        watcher = fs.watch(p.get("watchPath"), () => { console.log("unwatching", p.get("watchPath")); watcher.close(); resolve(p); })
    })));
    // .observe(p => console.log("pathsChangedWatched",p.toJS()));
    var pathsChangedFile = pathsToBeWatched
        // .tap(log("pathsChangedFile22"))
    // .merge()
        .filter(p=> p.get("watchStat") !== undefined)

        .filter(p => new Date(fs.statSync(p.get("watchPath")).mtime).getTime() - new Date(p.get("watchStat").get("mtime")).getTime() > 0)
        .merge(pathsChangedSinceStart)
        .tap(log("watching pathChanged, sending reloadMetadata"));
    
    // pathsChangedFile.observe(log("pathsChangedFile")).catch(e => console.error(e));
    actionStream.plug(pathsChangedFile.tap(log("pathsChangedFile")).map(p => Immutable.Map({ type: "reloadMetadata", path: p.get("target").get("path") })));


        return metadata
            .merge(actionStream.filter(a => a.get("type")=== "mergeMetadata").map(a => a.get("data").set("path", a.get("path"))))
            .tap(log("sending to store"))
        })
        .flatMapError(e=> { console.error(e); return Immutable.fromJS({ error: e }); })
    
    // var preloadedMetadataToWatch=metadataStore.take(1).flatMap(m => most.from(m.toArray())).tap(log("preloadedMetadaToWatch"));
//observe(p => console.log("pathsChanged",p.toJS()));


    return metadataStore.tap(log("metadataStore"));
}


var store = createMetadataStore(actionStream).multicast();
export default store;

// dataStore("blaData", most.from([{ path: "bla", someData: [1, 2, 3] }, { path: "2as", someData: [3, 2, 3] }].map(Immutable.Map)))
//     .observe(log("dataTest"));