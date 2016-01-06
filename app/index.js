import "./utils/fixWhenErrorLog";
import React from 'react';
import { render } from 'react-dom';

import './app.css';
import './photon_tom.css';
// import DevTools from "./containers/DevTools";
import {mapStackTrace} from "sourcemapped-stacktrace";


// import logger from "./utils/streamLog";
import {oscOutput} from "./utils/oscInOut";

import Immutable from "immutable";

// import elasticsearch from 'elasticsearch';
// var client = new elasticsearch.Client({
//   host: 'http://localhost:9200'
// });


import actionSubject from "./api/actionSubject";

// actionSubject.observe(a => console.log("actionSubject", (a.toJS && a.toJS()) || a)).catch(e => console.error(e));

import most from "most";

import importMetadata from "./utils/importAudioMetadata.js";


import keysToColors from "./api/keysToColors";
	

import PlayingTracks from "./playingTracksView";


import transposedNote from "./utils/transposedNote";

import {livedataStore, metadataStore, uiStateStore, oscOutputStore, midiClipStore} from "./store";



import log from "./utils/streamLog";

import when from 'when';
unhandledRejectionsWithSourceMaps(when.Promise);

function unhandledRejectionsWithSourceMaps(Promise) {
	Promise.onPotentiallyUnhandledRejection = function(r) {
		setTimeout(function() {
			if(!r.handled) {
				throw r.value;
			}
		}, 0);
	};

	Promise.onPotentiallyUnhandledRejectionHandled = function(r) {
		setTimeout(function() {
			console.log('Handled previous rejection', String(r.value));
		}, 0);
	};
}

oscOutput.plug(oscOutputStore.tap(log("plugged")));

var appState = most.combine((liveData, metaData, midiData, uiState) => 
	Immutable.Map({uiState, tracks: liveData//.filter(data=>data.get("file_path") && data.get("file_path").length>0
    
    // .filter(liveData => {
    //   console.log("filtering",liveData.get("file_path"), metaData.toJS());
    //   return  metaData.has(liveData.get("file_path"));
      
    //   })
    .map((data, trackId) => Immutable.Map({liveData:data, fileData: (data.get("file_path") ? 
        metaData.get(data.get("file_path")) : null), midiData: midiData.get(trackId), trackId:trackId}))}	)
	,livedataStore.tap(ld => console.table(ld.map(v => v).toJS())), metadataStore, midiClipStore, uiStateStore
	)



import throttledDebounce from "./utils/throttledDebounce";

throttledDebounce(50,appState)
.map(state => state.set("tracks", state.get("tracks").map((v,trackId)=> {
    if (!v.getIn(["fileData","id3Metadata","initialkey"]))
        return v;
    var pitch = v.getIn(["liveData","pitch"]);
    if (!pitch)
        pitch=0;
    return v.setIn(["liveData","transposedKey"], transposedNote(v.getIn(["fileData","id3Metadata","initialkey"]),v.getIn(["liveData","pitch"])));
  })))
.tap(log("state")).observe(state => {
	// console.error("state",state);
	// console.table(state.toJS());
render(
	<PlayingTracks availableTracks={state.get("tracks")} uiState={state.get("uiState")} />	,
  	document.getElementById('root')
);

}).catch(e => console.error(e));

if (process.env.NODE_ENV !== 'production') {
}
