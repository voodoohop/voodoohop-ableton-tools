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

var oscInput = 
	most.fromEvent("message", oscServer)
	.tap(console.log.bind(console))
		.map(f=> f[0])
		.filter(f => (dummy=f[0].split("/")).length>0 && dummy[1] === "FilePath")
	// .tap(f => console.log("fff",f));

var oscPathInput = oscInput.filter(f=> f[1] !== "-none-").map(f => f[1]);
var noneInput = oscInput.filter(f=> f[1] === "-none-");

// var testBuffer=importMetadata(oscPathInput, "audioBuffer");
// testBuffer.observe(res => console.log("testBuffer",res));


import {getTransformed} from "./api/audioMetadataGenerator";


var playingTracks = 	
	getTransformed(["path","id3Metadata","audioMetadata", "waveform"], oscPathInput)	
	.merge(noneInput.map(f => Immutable.Map({track:f[0].split("/")[2]})))
	.zip((transformed,track) => Immutable.Map({track}).merge(transformed), oscInput.map(f => f[0].split("/")[2]))
	.scan((tracks, d) => tracks.set(d.get("track"), d), Immutable.Map())
	.skip(1)
	.map(tracks => tracks.keySeq().map(k => tracks.get(k)))
	.tap(f => console.log("fff3",f.toJS()));

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
