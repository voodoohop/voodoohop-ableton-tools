import "./utils/fixWhenErrorLog";
import React from 'react';
import { render } from 'react-dom';
// import configureStore from './store/configureStore';
import './app.css';
import './photon_tom.css';
import TomWaveTest from "./TomWaveTest"
import { Provider,connect } from 'react-redux';
// import DevTools from "./containers/DevTools";
import {mapStackTrace} from "sourcemapped-stacktrace";
console.log("sourcemappedStacktrace",mapStackTrace);


// import logger from "./utils/streamLog";
import {oscOutput} from "./utils/oscInOut";

import oscStateDiff from "./utils/oscStateDiff";
// oscServer.on("message",(d,r)=>console.log("dddoscmain",d,r));

import Immutable from "immutable";

// import elasticsearch from 'elasticsearch';
// var client = new elasticsearch.Client({
//   host: 'http://localhost:9200'
// });


// import "./takeAction.js";

import actionSubject from "./api/actionSubject";

// actionSubject.observe(a => console.log("actionSubject", (a.toJS && a.toJS()) || a)).catch(e => console.error(e));

import most from "most";
console.log("importing metadata");
import importMetadata from "./utils/importAudioMetadata.js";


import keysToColors from "./api/keysToColors";
	
// var playingTracks = playingTrackData.combine((track,metadata) => Immutable.Map({trackId:track.get("trackId"),"fileData":metadata.get(track.get("file_path")), "liveData":track}), playingTracksMetadata)
// 	.filter(t=> t.get("fileData")!== undefined)
// 	.tap(f => console.log("fff3",f.toJS && f.toJS()))
// 	;
	
	
// var availableTracks = playingTracks.scan((ts,t) => 
// 		ts.set(t.get("trackId"),
// 		t
// 		)
// 		, Immutable.Map()).skip(1);


// playingTrack.sob

// availableTracks.observe(v => console.log("availtrack", v.toJS()));


// info.observe(console.log.bind(console));


import PlayingTracks from "./playingTracksView";


// const store = configureStore();

// store.state$.subscribe(state => render(state));
// action$.subscribe(action => store.dispatcher$.onNext(action));


// var ConnectedPlayingTracks = connect((state) => ({tracks:state}))(PlayingTracks);

	
// var ConnectedDevTools = connect((state) => { 
// 	console.log("napStateToProps:",state.toJS());
// 	return state.toJS();
// })(DevTools);
// info.drain();


import {livedataStore, metadataStore, uiStateStore, oscOutputStore, midiClipStore} from "./store";



import log from "./utils/streamLog";

oscOutput.plug(oscOutputStore);

var appState = most.combine((liveData, metaData, midiData, uiState) => 
	Immutable.Map({uiState, tracks: liveData.filter(data=>data.get("file_path") && data.get("file_path").length>0).map((data, trackId) => Immutable.Map({liveData:data, fileData: metaData.get(data.get("file_path")), midiData: midiData.get(trackId), trackId:trackId}))}	)
	,livedataStore.tap(ld => console.table(ld.map(v => v).toJS())), metadataStore, midiClipStore, uiStateStore
	)


// uiStateStore.observe(log("uiState")).catch(e => console.error(e));
// metadataStore.observe(log("metadataState")).catch(e => console.error(e));

// midiClipStore.observe(log("midiClipState")).catch(e => console.error(e));

// appState = appState.map(s => 
// 	Immutable.Map({
// 		tracks: s.get("liveData").keySeq().reduce((tracks,trackId) => 
// 	tracks.set(trackId, Immutable.Map({liveData: s.getIn(["liveData",trackId]), fileData: s.getIn(["fileData", s.getIn(["liveData",trackId,"file_path"])])}))
// 	,Immutable.Map()), 
// 		uiState: s.get("uiState")

// 	}) 
// s.keySeq().reduce((mapped,k) => mapped.merge(s.get(k).mapEntries(e=> [e[0], Immutable.Map().set(k,s.get(k).get(e[0]))],true)), Immutable.Map({}))
// )

import throttledDebounce from "./utils/throttledDebounce";

appState.tap(log("state")).observe(state => {
	// console.log("state",state);
	// console.table(state.toJS());
render(
<div>	

	<PlayingTracks availableTracks={state.get("tracks")} uiState={state.get("uiState")} />
</div>
	// </div>
	
	,
	// <TomWaveTest waveData={ reactiveWaveData } /></div>,
  	document.getElementById('root')
);

}).catch(e => console.error(e));

if (process.env.NODE_ENV !== 'production') {
	// Use require because imports can't be conditional.
	// In production, you should ensure process.env.NODE_ENV
	// is envified so that Uglify can eliminate this
	// module and its dependencies as dead code.
	// require('./createDevToolsWindow')(store);
}




  // <div className="toolbar-actions" style={{backgroundColor:"rgba(0,0,0,0)", border:"none"}}>
  //   <div className="btn-group">
  //     <button className={"btn btn-default "+state.getIn(["uiState","visibleView"]) === "trackView" ? "active":""}  onClick={()=>actionSubject.push(Immutable.Map({type:"showView", value:"trackView"}))}>
  //       <span className="icon icon-home"></span>
  //     </button>
  //     <button className="btn btn-default" onClick={()=>actionSubject.push(Immutable.Map({type:"showView", value:"gridView"}))}>
  //       <span className="icon icon-folder"></span>
  //     </button>
  //   </div>

  //   <button className="btn btn-default">
  //     <span className="icon icon-home icon-text"></span>
  //     Filters
  //   </button>

  //   <button className="btn btn-default btn-dropdown pull-right">
  //     <span className="icon icon-megaphone"></span>
  //   </button>
  // </div>
