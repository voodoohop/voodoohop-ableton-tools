import Immutable from "immutable";

import most from "most";

import {getTransformed} from "../api/audioMetadataGenerator";

import {db, dataStore} from "../api/db";


import actionStream from "../api/actionSubject";

import Subject from "../utils/Subject";
// var throttler=Subject();

import fs from "fs";
import log from "../utils/streamLog";




var createMetadataStore = (actionStream) => {

    var loadPaths = actionStream.filter(a => a.get("type") === "loadMetadata"
     || a.get("type") === "reloadMetadata"
     )
        .loop((paths, f) => {
            if (f.get("type") === "reloadMetadata")
              return {value: f.get("path"), seed:paths};
            var path = f.get("path");
            if (paths.has(path))
                return { value: null, seed: paths };
            else
                return { value: path, seed: paths.add(path) };
        }, Immutable.Set()).filter(p => p !== null)
        .tap(log("loadPaths"));
	

    var getNextTransformed = Subject(true);
    var metadata = getTransformed(["path", "pathStat", "id3Metadata", "audioMetadata", "warpMarkers", "waveform", "vampChord_HPA", "vampChord_QM"],
        loadPaths.zip(d => d, getNextTransformed)
            .tap(log("actually requesting metadata load")))
        .tap(() => getNextTransformed.push(true))
        
        .flatMapError(e => { console.error(e); return (Immutable.Map({ error: e })); })
   
   
    var pathsToBeWatched = metadata.flatMap(m => most.from(m.toArray().filter(e => e.has && e.has("path") && e.get("path")).map(e =>
        Immutable.Map({ target: m, watchPath: e.get("path"), watchStat: e.get("pathStat") }))))



    pathsToBeWatched.observe(log("pathsToBeWatched")).catch(e => console.error(e));


    var pathsChangedSinceStart = pathsToBeWatched.flatMap(p => most.fromPromise(new Promise(resolve => {
        let watcher = null;
        console.log("trying to watch path", p);
        console.log("watching", p.get("watchPath"));
        watcher = fs.watch(p.get("watchPath"), () => { console.log("unwatching", p.get("watchPath")); watcher.close(); resolve(p); })
    })));
    // .observe(p => console.log("pathsChangedWatched",p.toJS()));
    var pathsChangedFile = pathsToBeWatched
        .tap(log("pathsChangedFile22"))
    // .merge()
        .filter(p=> p.get("watchStat") !== undefined)
        .filter(p => new Date(fs.statSync(p.get("watchPath")).mtime).getTime() - new Date(p.get("watchStat").get("mtime")).getTime() > 0)
        .merge(pathsChangedSinceStart)
        .tap(p => console.log("pathChanged, sending reloadMetadata", p.toJS()));
    pathsChangedFile.observe(log("pathsChangedFile")).catch(e => console.error(e));
    actionStream.plug(pathsChangedFile.map(p => Immutable.Map({ type: "reloadMetadata", path: p.get("target").get("path") })));//observe(p => console.log("pathsChanged",p.toJS()));


   
    var metadataStore = dataStore("audioMetaData",metadata
        .merge(actionStream.filter(a => a.get("type")=== "mergeMetadata").map(a => a.get("data").set("path", a.get("path"))))
        .tap(log("sending to store")))
        .flatMapError(e=> { console.error(e); return Immutable.Map({ error: e }); })

    return metadataStore.tap(log("metadataStore"));
}


export default createMetadataStore(actionStream).multicast();


// dataStore("blaData", most.from([{ path: "bla", someData: [1, 2, 3] }, { path: "2as", someData: [3, 2, 3] }].map(Immutable.Map)))
//     .observe(log("dataTest"));