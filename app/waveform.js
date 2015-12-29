import React from 'react';
import component from "omniscient";
// import { dom } from 'react-reactive-class';
import most from "most";
import Immutable from "immutable";
// import Waveform from "./waveform";

import logger from "./utils/streamLog";
var log = logger("waveform");
import actionSubject from "./api/actionSubject";
// class  extends Component {
// 	render() {
// 		var track = props.track;
// 		return <Rli style={{backgroundColor:"rgba(0,0,0,0.6)", color:"white"}} className="list-group-item" key={track.get("trackName")}><h3>{track.get("trackName")}</h3>title - {track.get("id3Metadata").get("title")},key - {track.get("id3Metadata").get("initialkey")}, bpm - {track.get("id3Metadata").get("bpm")}<br><Waveform data={track.get("waveform")} /></Rli>;
// 	}
// }

// var keyToColor=
var TWEEN = require('tween.js');

import tinycolor from "tinycolor2";

import keysToColors from "./api/keysToColors";



var waveformPoly = (({durationBeats, waveformData, trackId,chords,musicalKey,start, gainScale}) => {
		if (!chords)
			chords = Immutable.fromJS([{chord: musicalKey, startBeat: 0, endBeat: durationBeats}]);
		// log("waveform args", duration, viewboxWidth, viewboxHeight, waveformData.toJS(), trackId,chords.toString());

		
		// var takeRange = (waveSeq,startIndex=0, endIndex=Infinity) => 
		// 		waveSeq
		// 			.skipWhile((val,i) => i < startIndex)
		// 			.takeWhile((val,i) => i < endIndex);
		// log("doing waveform2 render", waveformData.get("size"),chords.toString());
		console.log("wform", trackId, waveformData.get("pixelsPerBeat"));
        if (chords.last().get("endBeat")<durationBeats)
			chords = chords.push(Immutable.Map({chord:null,  startBeat: chords.last().get("endBeat"), endBeat:durationBeats}));
		var segmentedByChord = chords.map(chord => {
			var size = waveformData.get("size");
			var startOffset = Math.floor(((chord.get("startBeat"))||0)*waveformData.get("pixelsPerBeat"));
			var endOffset = Math.floor(chord.get("endBeat") ? (chord.get("endBeat"))*waveformData.get("pixelsPerBeat") : size); 
			if (startOffset <0  || endOffset<0)
				return Immutable.Map({size:0});
			return Immutable.Map({
				chord:chord.get("chord"), 
				max: waveformData.get("max").slice(startOffset,endOffset),
				min: waveformData.get("min").slice(startOffset,endOffset),
				startOffset: startOffset,
				endOffset: endOffset,
				size: endOffset-startOffset
			});
		}).filter(s => { return s.get("size") > 0;}).toArray();


		var pixelsPerBeat = waveformData.get("pixelsPerBeat");
		// var s = segmentedByChord(Immutable.Seq(maxArray)).toJS();
		log("segmented",segmentedByChord);
		 
				 console.timeEnd("renderWaveformTime");

	return <g style={{transform:"scale(1,"+(Math.log(gainScale+1))*4+")",transformOrigin:"center"}}>{segmentedByChord.map((segment,i) => {
		var points = segment.get("max").map((v,i) => [i+segment.get("startOffset"),v]).concat(segment.get("min").map((v,i) => [i+segment.get("startOffset"),v]).reverse());
		if (points.size===0)
			return null;
		points = points.concat([points.first()]).toArray();
		log("points",i,points,segment.toJS());
		points=points.map((p)=> [p[0]/pixelsPerBeat, (p[1]/2+0.5)*127].join(","));
		return <polyline key={""+segment.get("startOffset")+"_"+segment.get("endOffset")} 
			stroke="none" fillOpacity="1"
					  fill={keysToColors(segment.get("chord"))}
					  points={points.join(" ")} />;
		})}
		 
		</g>;
	});
    

export default component(({waveform, chords, musicalKey,trackId,gainScale}) => {
		// log("waveformprops",props);
		// var waveform = props.waveform;
		// log("reactThis",waveform&&waveform.toJS());
		// var liveData=props.liveData;
		// log("liveData",liveData.toJS());
		if (waveform === undefined || waveform.get("size")<2)
			return null;
		var durationBeats =waveform.get("size")/waveform.get("pixelsPerBeat");
		// var waveform 
		log("waveformData", waveform,chords,musicalKey,trackId);
		// var chords = props.chords;
		// log("pts",points);
		// var beatToPos = (beat) => beat;//*waveform.get("pixelsPerBeat")*viewboxWidth/waveform.get("size");
		var start = -1*(waveform.get("firstBeat"))+0;
		// var beatLines=Immutable.Range(start,durationBeats-start, 32);
		// log("bealines",chords && chords.toJS(), beatLines.toJS());
 		var waveformPolyline = waveformPoly({start, durationBeats,musicalKey, waveformData: waveform, trackId,gainScale});
        
        var res= waveformPolyline;
        				 console.timeEnd("renderWaveformTime");
       console.time("renderWaveformTime");

        return res;
       			// { beatLines.map(x =>
					//   	<line key={x} stroke={tinycolor(color).complement().toHexString()} opacity="0.3" strokeWidth="2" x1={x} x2={x} y1={0} y2={127} />				
					//   )}	
					  
	})
