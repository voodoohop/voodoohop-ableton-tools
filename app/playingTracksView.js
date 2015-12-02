import React,{Component} from 'react';
import {reactive} from "react-most-reactive";
// import { dom } from 'react-reactive-class';
import most from "most";
import Immutable from "immutable";
import Waveform from "./waveform";


var Rli = reactive("li");
var Rul = reactive("ul");
var ReactiveDiv = reactive("div");
import keysToColors from "./api/keysToColors";

class Track extends Component {
	render() {
		var track = this.props.track;
		var key = track.getIn(["id3Metadata","initialkey"]);
		return <div>title - {track.getIn(["id3Metadata","title"])},<label>key</label><span style={{fontWeight: "bold", color: keysToColors(key)}}>{key}</span>, <label>bpm</label>{track.getIn(["id3Metadata","bpm"])}, 
				<p><Waveform data={track.get("waveform")()} color={keysToColors(track.getIn(["id3Metadata","initialkey"]))}/></p>
				</div>;
	}
}

export default class PlayingTracks extends Component {
	render() {
		console.log("thisTracks", this.props.tracks);
		return <div style={{width:"100%"}} ><Rul style={{width:"100%"}} className="list-group">{this.props.tracks.map(t => {
			console.log("sorting tracks to display",t && t.toJS());
			return t.sortBy(a=> a.get("track")).map(
			track => <Rli key={track.get("path")+"_"+track.get("track")} style={{backgroundColor:"rgba(0,0,0,0.75)", color:"white", width:"100%"}} className="list-group-item"><h3>{track.get("track")}</h3><ReactiveDiv>{track.get("path") ? <Track track={track} /> : "no clip playing"}</ReactiveDiv></Rli>
			)
		})}</Rul></div>;
	}
}