import React from 'react';
import { render } from 'react-dom';
// import configureStore from './store/configureStore';
import createStore from "./utils/createReactiveStore";
import thunkMiddleware from 'redux-thunk'
import promiseMiddleware from './middleware/promiseMiddleware'
import applyMiddleware from "./utils/applyReactiveMiddleware"
import combineReducers from "./utils/combineReactiveImmutableReducers"
import './app.css';
import './photon_tom.css';
import TomWaveTest from "./TomWaveTest"
import ipcStream from "electron-ipc-stream";
import { Provider,connect } from 'react-redux';
// import DevTools from "./containers/DevTools";


var osc = require("node-osc");
var emitStream = require('emit-stream');
var oscServer = new osc.Server(5555, '0.0.0.0');
oscServer.setMaxListeners(100);
console.log("oscSerrver in renderer", oscServer);
// oscServer.on("message",(d,r)=>console.log("dddoscmain",d,r));
var ipcs = ipcStream("thomash");

import Immutable from "immutable";

// import elasticsearch from 'elasticsearch';
// var client = new elasticsearch.Client({
//   host: 'http://localhost:9200'
// });


import most from "most";
console.log("importing metadata");
import importMetadata from "./utils/importAudioMetadata.js";




    import {reactive} from "react-most-reactive";


var fs = require("fs");
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var encoding = require("encoding");
var dummy;

var oscRawInput = 
	most.fromEvent("message", oscServer)
	// .tap(f=>console.log("rawOsc",f))
	.map(f => f[0])
var oscInput= oscRawInput	
		.filter(f => f[2] === "playingClip" && f[1]>=0)
		.map(f => Immutable.fromJS({trackId: f[1], data: f.slice(3)}))
	.scan((state, info)=> state.setIn([info.get("trackId"), info.get("data").get(0)], info.get("data").get(1)), Immutable.Map( ))
	// .tap(f => console.log("oscInput1",f.toJS()))
	.flatMap(info => most.from(info.keySeq().map(k => info.get(k).set("trackId", k))))
	.tap(f => console.log("oscInput",f.toJS()))
	.multicast();
	// .drain();	
	
var oscPlayingPosition = most.empty()//oscRawInput
	.filter(f => f[2] === "playingPosition" && f[1]>=0)
	.map(f => Immutable.Map({trackId: f[1], playingPosition: f[3]}))
		
		
	.tap(f => console.log("playingPos",f.toJS()));
	
	
var oscInputFileStatusOld = most.empty().filter(f => (dummy=f[0].split("/")).length>0 && dummy[1] === "FilePath");

var oscPathInput =oscInput.filter(f=> f.get("playing") === 1).skipRepeatsWith(f => f.get("file_path"));
var noneInput =oscInput.filter(f=> f.get("playing") === 0).map(f=> f.get("playing")).skipRepeats();

// var testBuffer=importMetadata(oscPathInput, "audioBuffer");
// testBuffer.observe(res => console.log("testBuffer",res));


import {getTransformed} from "./api/audioMetadataGenerator";
 
var playingTrackData = oscInput.filter(f=> f.get("playing")===1&&f.get("file_path"));

var playingTracksMetadata = 	
	getTransformed(["path","id3Metadata","audioMetadata", "waveform","vampChord_HPA"], playingTrackData.map(f => f.get("file_path")).skipRepeats())	
	// .merge(noneI nput.map(f => Immutable.Map({track:f[0].split("/")[2]})))
	// .zip((transformed,track) => Immutable.Map({trackId}).merge(transformed), oscInput.map(f => f[0].split("/")[2]))
	// .filter(t=> )
	.scan((tracks,track) => tracks.set(track.get("path"), track), Immutable.Map())
	.skip(1)

	// .scan((tracks, d) => tracks.set(d.get("track"), d), Immutable.Map())
	// .skip(1)
	
	.tap(f => console.log("playingData",f.toJS()));
	
	
var playingTracks = playingTrackData.combine((track,metadata) => Immutable.Map({trackId:track.get("trackId"),"fileData":metadata.get(track.get("file_path")), "liveData":track}), playingTracksMetadata)
	.filter(t=> t.get("fileData")!== undefined)
	.map(track => track.set("playingPosition", oscPlayingPosition.filter(pos => pos.get("trackId")===track.get("trackId")).map(pos => pos.get("playingPosition"))))
	.tap(f => console.log("fff3",f.toJS && f.toJS()))
	.scan((tracks, track) => tracks.set(track.get("trackId"),track),Immutable.Map()).skip(1)
	;

// playingTrack.sob

// reactiveWaveData.observe(v => console.log("rwave", v));


// info.observe(console.log.bind(console));


import PlayingTracks from "./playingTracksView";

import * as reducers from './reducers';


// const store = configureStore();
const newCreateStore = applyMiddleware(thunkMiddleware, promiseMiddleware)(createStore);
const reducer = combineReducers(reducers);
const store = newCreateStore(reducer);

// store.state$.subscribe(state => render(state));
// action$.subscribe(action => store.dispatcher$.onNext(action));


// var ConnectedPlayingTracks = connect((state) => ({tracks:state}))(PlayingTracks);


// var ConnectedDevTools = connect((state) => { 
// 	console.log("napStateToProps:",state.toJS());
// 	return state.toJS();
// })(DevTools);
// info.drain();
render(
	
	// <div>
	
	<PlayingTracks  tracks={playingTracks} />
	// <DevTools />

	// </div>
	
	,
	// <TomWaveTest waveData={ reactiveWaveData } /></div>,
  	document.getElementById('root')
);

if (process.env.NODE_ENV !== 'production') {
	// Use require because imports can't be conditional.
	// In production, you should ensure process.env.NODE_ENV
	// is envified so that Uglify can eliminate this
	// module and its dependencies as dead code.
	// require('./createDevToolsWindow')(store);
}
