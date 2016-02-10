import "./utils/fixWhenErrorLog";
import React from 'react';
import { render } from 'react-dom';

import './app.css';
import './photon_tom.css';
// import DevTools from "./containers/DevTools";
import {mapStackTrace} from "sourcemapped-stacktrace";


// import logger from "./utils/streamLog";


import Immutable from "immutable";

// import elasticsearch from 'elasticsearch';
// var client = new elasticsearch.Client({
//   host: 'http://localhost:9200'
// });


import actionSubject from "./api/actionSubject";

// actionSubject.observe(a => console.log("actionSubject", (a.toJS && a.toJS()) || a)).catch(e => console.error(e));

import most from "most";

import importMetadata from "./utils/importAudioMetadata.js";

// import "./utils/recursiveMetadataImporter";

import keysToColors from "./api/keysToColors";
	

import PlayingTracks from "./playingTracksView";

    
import transposedNote from "./utils/transposedNote";

import {livedataStore, metadataStore, uiStateStore, oscOutputStore, midiClipStore, remoteClipUpdater} from "./store";

import log from "./utils/streamLog";

import when from 'when';

import ProcessingStatus from "./processingStatus";
unhandledRejectionsWithSourceMaps(when.Promise);


window.actionStream = actionSubject;
window.Imm = Immutable;
window.most = most;

function unhandledRejectionsWithSourceMaps(Promise) {
	Promise.onPotentiallyUnhandledRejection = function(r) {
		// setTimeout(function() {
			if(!r.handled) {
				throw r.value;
			}
		// }, 0);
	};

	Promise.onPotentiallyUnhandledRejectionHandled = function(r) {
		setTimeout(function() {
			console.log('Handled previous rejection', String(r.value));
		}, 0);
	};
}



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
	,livedataStore.tap(ld => console.table(ld.map(v => v).toJS())), metadataStore, midiClipStore, uiStateStore, remoteClipUpdater)
    



import throttledDebounce from "./utils/throttledDebounce";
import ObjectInspector from 'react-object-inspector';

var debouncedState =  throttledDebounce(50,appState);
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
    console.table([pv.get("liveData").toJS(),v.get("liveData").toJS()]);
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

finalState.observe(state => {
	// console.error("state",state);
	// console.table(state.toJS());
render(
	<div><PlayingTracks availableTracks={state.get("tracks")} uiState={state.get("uiState")} />
    <center><img src="../open_key_notation_6000.png" width="60%" height="auto"/></center>
    <ProcessingStatus uiState={state.get("uiState")} />
    <ObjectInspector style={{color:"white"}} data={ state.toJS() } />
    </div>,
  	document.getElementById('root')
)

}).catch(e => console.error(e));

if (process.env.NODE_ENV !== 'production') {
}
