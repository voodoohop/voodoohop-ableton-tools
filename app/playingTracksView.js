import React,{Component} from 'react';
import {reactive} from "react-most-reactive";
// import { dom } from 'react-reactive-class';
import most from "most";
import Immutable from "immutable";
import Waveform from "./waveform";

var ReactiveWaveform = reactive(Waveform);
var Rli = reactive("li");
var Rul = reactive("ul");
var ReactiveDiv = reactive("div");
import keysToColors from "./api/keysToColors";

class Track extends Component {
	render() {
		var track = this.props.track;
		console.log("track",track);
		var key = track.getIn(["fileData", "id3Metadata","initialkey"]);
		return <div>title - {track.getIn(["fileData","id3Metadata","title"])},<label>key</label><span style={{fontWeight: "bold", color: keysToColors(key)}}>{key}</span>, <label>bpm</label>{track.getIn(["fileData","id3Metadata","bpm"])}, 
				<p>
				<ReactiveWaveform 
				liveData={track.get("liveData")}
				playingPosition={track.get("playingPosition")}
				metadata={track.getIn(["audioFile","audioMetadata"])} 
				waveform={track.getIn(["fileData","waveform"])} 
				chords={track.getIn(["fileData","vampChord_HPA"]) && track.getIn(["fileData","vampChord_HPA"]).scan((chords, chord) => chords.concat([chord]), Immutable.Seq())} 
				color={keysToColors(track.getIn(["fileData", "id3Metadata","initialkey"]))}/>
				</p>
				</div>;
	}
}

export default class PlayingTracks extends Component {
	render() {
		console.log("thisTracks", this.props.tracks);
		return <div style={{width:"100%"}} ><Rul style={{width:"100%"}} className="list-group">{this.props.tracks.map(t => {
			console.log("sorting tracks to display",t && t.toJS());
			return t.sortBy(a=> a.get("trackId")).map(
			track => <Rli key={track.get("trackId")} style={{backgroundColor:"rgba(0,0,0,0.85)", color:"white", width:"100%"}} className="list-group-item"><h3>{track.get("trackId")}</h3><ReactiveDiv>{track.getIn(["fileData","path"]) ? <Track track={track} /> : "no clip playing"}</ReactiveDiv></Rli>
			)
		})}</Rul></div>;
	}
}