import React from 'react';
import component from "omniscient";
// import { dom } from 'react-reactive-class';
import most from "most";
import Immutable from "immutable";
// import Waveform from "./waveform";

import logger from "./utils/streamLog";

import {VictoryPie} from "victory";
import transposedNote from "./utils/transposedNote";
import keysToColors from "./api/keysToColors";
import openKeySequence from "./api/openKeySequence.js";

import tinyColor from "tinyColor2";


export default component(props => <VictoryPie innerRadius={60} width={250} data={
    openKeySequence.map(note => ({x:""+note+"/"+transposedNote(note,9)+"m",y:1,fill:tinyColor(keysToColors(transposedNote(note,0))).lighten(20).toHexString()}))
}
style={{labels:{fontWeight:"bold", padding:0}}}

// style={{
//     data: {
//         fill:  (data) => keysToColors(transposedNote("C",data.x)),
//         stroke: (data) => keysToColors(transposedNote("C",data.x))
//     }  
// }}
/>);


export var transposeWheel = component(({baseKey,transposed}) => <   VictoryPie innerRadius={60} width={250} data={
    openKeySequence.map(note => ({x:""+note+"/"+transposedNote(note,9)+"m",y:1,fill:tinyColor(keysToColors(transposedNote(note,0))).lighten(20).toHexString()}))
}
style={{labels:{fontWeight:"bold", padding:0},data:{stroke:"black"}}}

// style={{
//     data: {
//         fill:  (data) => keysToColors(transposedNote("C",data.x)),
//         stroke: (data) => keysToColors(transposedNote("C",data.x))
//     }  
// }}
/>);
;