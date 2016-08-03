import React from 'react';
import component from "omniscient";
// import { dom } from 'react-reactive-class';
import most from "most";
import create from '@most/create'
import Immutable from "immutable";

var installDevTools = require("immutable-devtools")
installDevTools.default(Immutable);
// import Waveform from "./waveform";

import log from "./utils/streamLog";
import actionStream from "./api/actionSubject";
// import log from "./utils/
import {VictoryPie} from "victory";


import TreeChart from './lib/TreeChart';
var usage = require('usage');

console.log("hey");
import { render } from 'react-dom';

import {remote,ipcRenderer} from "electron";

import {toJSON as immToJson, fromJSON as immFromJson} from "transit-immutable-js";

console.log("remote");
 
var getBounds = ()=>[window.innerWidth,window.innerHeight]
  
var windowSizeStream = most.fromEvent("resize",window).map(getBounds).startWith(getBounds())
.map(([x,y])=>[x, x/y]).tap(log("windowSize")).delay(100);

// windowSizeStream.drain();

var ipcIn = create((add) =>
ipcRenderer.on("stateUpdate",(e,data)=>add(data)))
.tap(log("stateIn"));
// const ipcRenderer = require('electron').ipcRenderer;



var stateUpdateStream=ipcIn
.map(immFromJson)
 .tap(log("stateUpdate"))
//  .drain();

// stateUpdateStream.drain();

most.combine((sizeAndRatio,state) => ({sizeAndRatio,state}),windowSizeStream,stateUpdateStream)



//  ({size:sizeAndRatio[0],aspectRatio:sizeAndRatio[1],state}),windowSizeStream,stateUpdateStream)
.observe(({sizeAndRatio,state}) => {
    console.log("state",state);
render( 
 <TreeChart
      state={state.toJS()}
      id='treeExample'
      
      size={sizeAndRatio[0]}
      aspectRatio={sizeAndRatio[1]}
      isSorted={false}
      select={function(state) {return state.tracks}}
      widthBetweenNodesCoeff={1}
      heightBetweenNodesCoeff={2} />, document.getElementById('root'))
});
