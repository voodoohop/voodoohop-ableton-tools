

require('babel-runtime/core-js/promise').default = require('bluebird');
global.Promise = require("bluebird");
// var njstrace = require('njstrace').inject();
Promise.onPossiblyUnhandledRejection(function(error){
    throw error;
});

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import './app.global.css';


// import "./utils/fixWhenErrorLog";

// import './app.css';
// import './photontom.global.css';

// import DevTools from "./containers/DevTools";
import {mapStackTrace} from "sourcemapped-stacktrace";

import KeyWheel from "./keyWheel";
// import logger from "./utils/streamLog";


import Immutable from "immutable";

// import Dock from "react-dock";
import ObjectInspector from 'react-json-tree';


import actionSubject from "./api/actionSubject";

// actionSubject.observe(a => console.log("actionSubject", (a.toJS && a.toJS()) || a)).catch(e => console.error(e));

import * as most from 'most';

import importMetadata from "./utils/importAudioMetadata.js";

// import "./utils/recursiveMetadataImporter";

import keysToColors from "./api/keysToColors";
	

import PlayingTracks from "./playingTracksView";

    
import transposedNote from "./utils/transposedNote";

import {livedataStore, metadataStore, uiStateStore, midiClipStore, remoteClipUpdater,globalHarmonyStore} from "./store";

import log from "./utils/streamLog";

import ProcessingStatus from "./processingStatus";
import CpuUsage from "./cpuUsage";

var installDevTools = require("immutable-devtools");

installDevTools(Immutable);
// RemoteDev Extension: Apply default options & start remotedev-server
//  require('remotedev-extension')({
//    port: 5678,
//    runserver: true
//  });
// import elasticsearch from 'elasticsearch';
// var client = new elasticsearch.Client({
//   host: 'http://localhost:9200'
// });


    
// var remote = require("remote");
// var BrowserWindow = remote.require("browser-window");
// var windows = BrowserWindow.getAllWindows();
// console.log("windows",windows);
// Look for the popup window and then...
// windows[1].openDevTools();


window.actionStream = actionSubject;
window.Imm = Immutable;
window.most = most;

// function unhandledRejectionsWithSourceMaps(Promise) {
// 	Promise.onPotentiallyUnhandledRejection = function(r) {
// 		// setTimeout(function() {
// 			if(!r.handled) {
// 				throw r.value;
// 			}
// 		// }, 0);
// 	};

// 	Promise.onPotentiallyUnhandledRejectionHandled = function(r) {
// 		setTimeout(function() {
// 			console.log('Handled previous rejection', String(r.value));
// 		}, 0);
// 	};
// }
// unhandledRejectionsWithSourceMaps(when.Promise);
// var storyboard = require("storyboard");
// var wsServer = require("storyboard/lib/listeners/wsServer");
// storyboard.addListener(wsServer,{port:8090});


var appState = most.combine((liveData, metaData, midiData, uiState,remoteClipUpdater) => 
	Immutable.Map({uiState, tracks: liveData
    .map((data, trackId) =>{
        // console.log("track combining",data.toJS(),metaData.toJS());
        
        return Immutable.Map({liveData: data, fileData: (data.get("file_path") ? 
        metaData.get(data.get("file_path")) : null),
        remoteClipUpdater:remoteClipUpdater.get(trackId),
         midiData: midiData.get(trackId) || null, trackId:trackId})
        .filter(v=> v !== null && v !== undefined) 
         })}	)
	,livedataStore, metadataStore, midiClipStore, uiStateStore, remoteClipUpdater)
    


var debouncedState =  appState.throttledDebounce(50);
var finalState = debouncedState

.scan((prevState,state) => state.set("tracks", state.get("tracks").map((v,trackId)=> {
    if (prevState === null)
        return v;
    var pv = prevState.getIn(["tracks",trackId])
    // console.log("pv",pv);
    if (!v.getIn(["fileData","id3Metadata","initialkey"]))
        return v;
    var pitch = v.getIn(["liveData","pitch"]);
     if (!pitch)
        pitch=0;
    // console.log("table",);
    // console.table([pv.get("liveData"),v.get("liveData")]);
    if (pv.getIn(["liveData","pitch"]) === pitch && pv.getIn(["liveData","file_path"]) === v.getIn(["liveData","file_path"]) && pv.getIn(["liveData","transposedChords"]))
        return v
            .setIn(["liveData","transposedChords"],pv.getIn(["liveData","transposedChords"]))
            .setIn(["liveData","transposedKey"],pv.getIn(["liveData","transposedKey"]));
    var chords=(
					(v.getIn(["fileData","vampChord_HPA"]) && !v.getIn(["fileData","vampChord_HPA","error"]) && v.getIn(["fileData","vampChord_HPA"]))
				|| 	(v.getIn(["fileData","vampChord_QM"]) && !v.getIn(["fileData","vampChord_QM","error"]) && v.getIn(["fileData","vampChord_QM"]))
           );

    var resTransposedKey =v
           .setIn(["liveData","transposedKey"], transposedNote(v.getIn(["fileData","id3Metadata","initialkey"]),pitch));

    if (chords)
        resTransposedKey = resTransposedKey
            .setIn(["liveData","transposedChords"], chords.map(chord => chord.set("chord",transposedNote(chord.get("chord"),pitch))));
	return resTransposedKey;			
  })),null).skip(1)
.tap(log("state")).multicast();

actionSubject.plug(
    finalState.flatMap(s => most.from(
    s.get("tracks").toArray()
    .filter(t => t.get("midiData") && t.get("fileData") && !t.getIn(["fileData","midiMetadata"]))
    .map(t => Immutable.Map({
        type:"mergeMetadata",   
        data:Immutable.Map({midiMetadata: t.get("midiData")}), 
        path: t.getIn(["fileData","path"])}))
)));

import {ipcRenderer}  from 'electron';
import {toJSON as immToJson, fromJSON as immFromJson} from "transit-immutable-js";

var sizeReducer=(v) => v && v.size ? v.remove("waveform").take(10).map(sizeReducer) : v;


finalState.observe(state => {
	// console.error("state",state);
//  console.table(state.toJS());
// ipcRenderer.send("stateUpdate",immToJson(sizeReducer(state)));    

render(
	<div>
    <div style={{position:"fixed",bottom:"0px",right:"0px",backgroundColor:"rgba(0,0,0,0.1)"}}>
    <CpuUsage usage={state.getIn(["uiState","cpuUsage"])} />
    </div>
    <PlayingTracks availableTracks={state.get("tracks")} uiState={state.get("uiState")} />
    <KeyWheel />
        { process.env["NODE_ENV"] !== "development" || true ? 
            <div /> : <div> <ObjectInspector style={{color:"white"}} data={state} initialExpandedPaths={["*","*","*"]} /> </div>
        }
    </div>,
  	document.getElementById('root')
)

}).catch(e => console.error(e));

    // <ProcessingStatus state={state} uiState={state.get("uiState")} />
    // <ObjectInspector style={{color:"white"}} data={ state.toJS() } initialExpandedPaths={["*","*","*"]} />
