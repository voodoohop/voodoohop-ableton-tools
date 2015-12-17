import React from 'react';
import component from "omniscient";
// import { dom } from 'react-reactive-class';
import most from "most";
import Immutable from "immutable";
// import Waveform from "./waveform";


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

function beatClick(beat,trackId,e,f) {
	console.log("beatClick",beat,trackId,e);
	actionSubject.push(Immutable.Map({type: "clickedBeat", beat,trackId}));
}

var waveformPoly = component(({duration, viewboxWidth,viewboxHeight, waveformData, trackId,chords,musicalKey,start}) => {
		if (!chords)
			chords = Immutable.fromJS([{chord: musicalKey, startTime: 0, endTime: duration}]);
		// console.log("waveform args", duration, viewboxWidth, viewboxHeight, waveformData.toJS(), trackId,chords.toString());
		
		
		// var takeRange = (waveSeq,startIndex=0, endIndex=Infinity) => 
		// 		waveSeq
		// 			.skipWhile((val,i) => i < startIndex)
		// 			.takeWhile((val,i) => i < endIndex);
		console.log("doing waveform2 render", waveformData.get("size"),chords.toString());
		var segmentedByChord = chords.map(chord => {
			var size = waveformData.get("size");
			var startOffset = Math.floor((chord.get("startBeat")||0)*waveformData.get("pixelsPerBeat"));
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
		}).filter(s => s.get("size") >0);

		var pointCount = waveformData.get("size");
		var maxArray=waveformData.get("max").toArray();
		var minArray=waveformData.get("min").toArray();
		// var s = segmentedByChord(Immutable.Seq(maxArray)).toJS();
		console.log("segmented",segmentedByChord);
		 
				var beatClickGrid=Immutable.Range(start,viewboxWidth, 4*viewboxWidth*waveformData.get("pixelsPerBeat")/waveformData.get("size"));
		beatClickGrid = beatClickGrid.zip(beatClickGrid.skip(1));
		console.log("beatclickgrid",beatClickGrid);

	return <g>{segmentedByChord.map((segment) => {
		var points = segment.get("max").map((v,i) => [i+segment.get("startOffset"),v]).concat(segment.get("min").map((v,i) => [i+segment.get("startOffset"),v]).reverse());
		points = points.concat([points.first()]).toArray();
	
		return <polyline key={""+segment.get("startOffset")+"_"+segment.get("endOffset")} style={{mask:"url(#"+"Mask"+trackId+")"}} stroke="none" fillOpacity="1"
					  fill={keysToColors(segment.get("chord"))}
					  points={points.map(
						(p)=> [p[0]*viewboxWidth/pointCount, (p[1]/2+0.5)*viewboxHeight].join(",")
					).join(" ")} />;
		})}
		 { beatClickGrid.map((xs,i) =>{
			//    console.log("xs",xs);
		  	return <rect onClick={(e,f) => beatClick(i*4,trackId,e,f)} key={"_beatclickgrid_"+xs[0]} stroke="white" fill="rgba(0,0,0,0)" opacity="0.3 " strokeWidth="0.08" x={xs[0]} width={xs[1]-xs[0]} y={-10} height={viewboxHeight+10} />
		}
		 )}
		</g>;
	});

export default component(({waveform, liveData,chords,metadata, musicalKey,trackId, color,uiState}) => {
		// console.log("waveformprops",props);
		// var waveform = props.waveform;
		// console.log("reactThis",waveform&&waveform.toJS());
		// var liveData=props.liveData;
		// console.log("liveData",liveData.toJS());
		if (waveform === undefined || waveform.get("size")<2)
			return <span>undefined</span>;
		// var waveform 
		// console.log("playingPOs", props.playingPosition);
		// var chords = props.chords;
		// console.log("pts",points);
		var width="100%";
		var height="100%";
		var viewboxWidth=1000;
		var viewboxHeight=200;
		var beatToPos = (beat) => beat*waveform.get("pixelsPerBeat")*viewboxWidth/waveform.get("size");
		var start = -1*beatToPos(waveform.get("firstBeat"));
		var beatLines=Immutable.Range(start,viewboxWidth, 32*viewboxWidth*waveform.get("pixelsPerBeat")/waveform.get("size"));
		var playingPosBeat = liveData.get("playingPosition") || 0;
		var playingPosX=start+playingPosBeat*viewboxWidth*waveform.get("pixelsPerBeat")/waveform.get("size")
		var playingPosOpacity = 0.2;//Math.abs((playingPosBeat/4)%1-0.5)+0.5; 
		// console.log("bealines",chords && chords.toJS(), beatLines.toJS());
		var waveformPolyline = waveformPoly({start, chords, duration: metadata.get("duration"),musicalKey,viewboxWidth, viewboxHeight, waveformData: waveform, trackId});
		var loopHighlight=null;
		if (liveData.get("looping") === 1) {
			var loopStart = start+liveData.get("loop_start")*viewboxWidth*waveform.get("pixelsPerBeat")/waveform.get("size");
			var loopEnd = start+liveData.get("loop_end")*viewboxWidth*waveform.get("pixelsPerBeat")/waveform.get("size")
			loopHighlight = <rect stroke="white" fill="rgba(255,255,255,0.1)" opacity="0.9" y="0" x={loopStart} width={loopEnd-loopStart} height={viewboxHeight} />
		}
		var zoom = uiState.get("globalZoom");
		var scale=waveform.get("size")/(256*(zoom*2+0.01)*waveform.get("pixelsPerBeat"));
		console.log("playpos",playingPosX,zoom);
		return <svg style={{overflow:"hidden"}} preserveAspectRatio="none" 
					width={width} height={height} 
					viewBox={[0,0,viewboxWidth, viewboxHeight].join(" ")}>
					<g transform={"scale("+scale+",1) translate("+((-playingPosX+(1/4)*viewboxWidth/(scale*2)))+",0)"}>
					<defs>
					    <mask id={"Mask"+trackId}>
					  	<rect stroke="none" fill="white" opacity={playingPosOpacity} x={0} width={playingPosX} y={0} height={viewboxHeight} />

					  	<rect stroke="none" fill="white" opacity="1" x={playingPosX} width={viewboxWidth-playingPosX} y={0} height={viewboxHeight} />
    					</mask>
					</defs>
					  
					{loopHighlight}
					<g transform={"translate(0, "+(viewboxHeight/2)+") scale(1,"+((liveData.get("gain")-0.4)*2+1)+") translate(0, "+(-viewboxHeight/2)+")"}>
					{waveformPolyline}
					</g>
{ beatLines.map(x =>
					  	<line key={x} stroke={tinycolor(color).complement().toHexString()} opacity="0.3" strokeWidth="2" x1={x} x2={x} y1={0} y2={viewboxHeight} />
				
					  )}					  
	 		</g>
		</svg>;
	})
