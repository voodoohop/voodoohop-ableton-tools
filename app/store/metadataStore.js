import Immutable from "immutable";

import most from "most";

import {getTransformed} from "../api/audioMetadataGenerator";

import {db} from "../api/db";


import actionStream from "../api/actionSubject";

import Subject from "../utils/Subject";
// var throttler=Subject();

import fs from "fs";
import log from "../utils/streamLog";

var createMetadataStore = (actionStream) => {

var loadPaths = actionStream.filter(a => a.get("type") === "loadMetadata")
	.loop((paths,f) => {
		// if (f.get("type") === "reloadMetadata")
		//   return {value: f.get("path"), seed:paths};
		var path = f.get("path");
		if (paths.has(path))
			return {value:null, seed:paths};
		else
			return {value:path, seed:paths.add(path)};
	}, Immutable.Set()).filter(p => p!==null)
    .tap(log("loadPaths"))
    ;

	var checkedDb = loadPaths.map(path => new Promise((resolve, reject) => db.get(path).then(doc => resolve(Immutable.fromJS(doc))).catch(e => resolve({notInDb: path})))).await();
	// .tap(e => console.log("pathe2",e))
	
	var notInDborReload = checkedDb.filter(d => d.notInDb).map(d => d.notInDb)
	.merge(actionStream.filter(a => a.get("type") === "reloadMetadata").map(a=>a.get("path"))).skipRepeats()//.multicast();

	//.zip(d => d, throttler.startWith(null))
	var loadedMetadata = getTransformed(["path","id3Metadata","audioMetadata", "waveform","warpMarkers","vampChord_HPA","vampChord_QM"], 
    notInDborReload
    .tap(log("actually requesting metadata load")))
		.tap(f =>   db.upsert(f.get("path"), doc => {
				
                doc = Immutable.fromJS(doc).merge(f).toJS();
				
                console.log("upserting doc",doc);

                return doc;
              }))
			 .flatMapError(e =>{console.error(e); return(Immutable.Map({error:e}));})
	var cachedMetadata =  checkedDb.filter(d => !d.notInDb);


var metadata =
	// .flatMap(e => e)
	cachedMetadata.merge(loadedMetadata);

var pathsToBeWatched = metadata.flatMap(m => most.from(m.toArray().filter(e => e.has && e.has("path") && e.get("path")).map(e => 
	Immutable.Map({target: m, watchPath: e.get("path"), watchStat: e.get("pathStat")}))))
	
 
 	
	// pathsToBeWatched.observe(p => console.log("pathsToBeWatched",p.toJS()));
	
	
	var pathsChangedSinceStart = pathsToBeWatched.flatMap(p => most.fromPromise(new Promise(resolve => {
		let watcher=null;
		console.log("watching", p.get("watchPath"));
		watcher = fs.watch(p.get("watchPath"), () => {console.log("unwatching", p.get("watchPath")); watcher.close(); resolve(p);})
	})));
	// .observe(p => console.log("pathsChangedWatched",p.toJS()));
	 var pathsChangedFile = pathsToBeWatched
 		// .merge()
 		.filter(p => new Date(fs.statSync(p.get("watchPath")).mtime).getTime() - new Date(p.get("watchStat").get("mtime")).getTime()>0)
		.merge(pathsChangedSinceStart)
		.tap(p => console.log("pathChanged, sending reloadMetadata",p.toJS()));

	actionStream.plug(pathsChangedFile.map(p => Immutable.Map({type: "reloadMetadata", path: p.get("target").get("path")})));//observe(p => console.log("pathsChanged",p.toJS()));

var metadataStore= metadata
    //.tap(e => actionStream.push(Immutable.Map({type:"sendMeMore"})))
	// ,
	.flatMapError(e=>{console.error(e); return Immutable.Map({error:e});})
	.scan((tracks,track) => tracks.set(track.get("path"), track), Immutable.Map())
	// .skip(1)
	
	// .tap(f => console.log("loadedMetadata",f.toJS()));
	return metadataStore;
}


export default createMetadataStore(actionStream).startWith(Immutable.Map()).multicast();