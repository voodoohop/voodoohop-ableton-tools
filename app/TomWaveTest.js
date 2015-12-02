import React,{Component} from 'react';
import {reactive} from "react-most-reactive";
// import { dom } from 'react-reactive-class';
import {of} from "most";
import most from "most";
import Immutable from "immutable";
var Span = reactive("span");


var fs = require("fs");

import { Sparklines, SparklinesBars, SparklinesLine, SparklinesNormalBand, SparklinesReferenceLine, SparklinesSpots } from 'react-sparklines';

var RSparklines = Sparklines;
var RDiv = reactive("div");
// var Waveform = require('react-waveform');

	// console.log("audioContext",audioCtx);
export default class TomWave extends Component {
	render() {
		// this.props.waveForm =//.observe(console.log.bind(console));
		return <RDiv>{this.props.waveData.scan((bagOfWaves,newWave) => bagOfWaves.push(newWave),Immutable.List()).skip(1)
		// .map(data => data))
		.map(datas => datas.toJS().map(d2 => {
			console.log("emd data",d2);
			var data = Array.from(data);
			return <RSparklines data={data} width={600} height={100}><SparklinesLine style={{ stroke: "white",strokeWidth:"0.2px", fill: "#8e44af", fillOpacity: "0.7" }}/></RSparklines>;
				;
		}))};</RDiv>;
	}
}