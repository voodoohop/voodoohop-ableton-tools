import React,{Component} from 'react';
import {reactive} from "react-most-reactive";
// import { dom } from 'react-reactive-class';
import most from "most";
import Immutable from "immutable";
// import Waveform from "./waveform";



// class  extends Component {
// 	render() {
// 		var track = this.props.track;
// 		return <Rli style={{backgroundColor:"rgba(0,0,0,0.6)", color:"white"}} className="list-group-item" key={track.get("trackName")}><h3>{track.get("trackName")}</h3>title - {track.get("id3Metadata").get("title")},key - {track.get("id3Metadata").get("initialkey")}, bpm - {track.get("id3Metadata").get("bpm")}<br><Waveform data={track.get("waveform")} /></Rli>;
// 	}
// }

// var keyToColor=

export default class Waveform extends Component {
	resize(params) {
		console.log("resize",params);
	}
	render() {
		var waveform = this.props.waveform;
		console.log("reactThis",waveform&&waveform.toJS());
		if (waveform === undefined || waveform.get("max").size<2)
			return <span>undefined</span>;
		// var waveform 
		var pointCount = waveform.get("max").size;
		var maxArray=waveform.get("max").toArray();
		var minArray=waveform.get("min").toArray();
		var points = maxArray.map((v,i) => [i,v]).concat(minArray.map((v,i) => [i,v]).reverse());
		points.push(points[0]);
		// console.log("pts",points);
		var width="100%";
		var height="100px";
		var viewboxWidth=1000;
		var viewboxHeight=200;
		var beatLines=Immutable.Range(0,viewboxWidth, 1*viewboxWidth*waveform.get("pixelsPerBeat")/waveform.get("max").size);
		console.log("bealines",beatLines.toJS());
		return <svg preserveAspectRatio="none" 
					width={width} height={height} 
					viewBox={[0,0,viewboxWidth, viewboxHeight].join(" ")}>
					  { beatLines.map(x =>
					  	<line stroke="red" opacity="0.7" strokeWidth="2" x1={x} x2={x} y1={viewboxHeight/2} y2={viewboxHeight} />
					  )}			
					  <polyline stroke="none" fillOpacity="1"
					  fill={this.props.color} 
					//   strokeWidth="0.2	" 
					  points={points.map(
			(p)=> [p[0]*viewboxWidth/pointCount, (p[1]/2+0.5)*viewboxHeight].join(",")
		).join(" ")} />

		</svg>;
	}
}