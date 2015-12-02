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
		console.log("reactThis",this.props.data);
		var pointCount = this.props.data.get("length");
		var maxArray=this.props.data.get("data").filter((v,i) => i%2==1).toJS();
		var minArray=this.props.data.get("data").filter((v,i) => i%2==0).toJS();
		var points = maxArray.map((v,i) => [i,v]).concat(minArray.map((v,i) => [i,v]).reverse());
		points.push(points[0]);
		console.log("pts",points);
		var width="100%";
		var height="100px";
		var viewboxWidth=1000;
		var viewboxHeight=100;
		return <svg preserveAspectRatio="none" 
					width={width} height={height} 
					viewBox={[0,0,viewboxWidth, viewboxHeight].join(" ")}>
					  <polyline stroke="none" fillOpacity="1"
					  fill={this.props.color} 
					//   strokeWidth="0.2	" 
					  points={points.map(
			(p)=> [p[0]*viewboxWidth/pointCount, (p[1]/255+0.5)*viewboxHeight].join(",")
		).join(" ")} /></svg>;
	}
}