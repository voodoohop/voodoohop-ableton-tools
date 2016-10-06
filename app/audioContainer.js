
import React from 'react';

import logger from "./utils/streamLog";

import Immutable from "immutable";

import actionSubject from "./api/actionSubject";

import component from "omniscient";
import component2 from "./utils/immComponent";
import Waveform from "./waveform";
import PianoRoll from "./pianoroll";

import {VictoryAnimation} from "victory";

var log = logger("renderContainer");

function beatClick(beat, trackId, e, f) {
	log("beatClick", beat, trackId, e);
	actionSubject.push(Immutable.Map({ type: "clickedBeat", beat, trackId }));
}

const getStrokeWidth = (i, modulo) => {
	// let gridWidth = 1;
	// console.log("input",i);
	var current = modulo;
	while (i % current != 0 && current >= 1) {
		current /= 2;
	}
	// console.log("output",current/modulo);
	return current / modulo < 0 ? 0 : current / modulo;
}


var BeatClickGrid = component2(({startMarker, endMarker, trackId}) => {
	var beatClickGrid = Immutable.Range(startMarker, endMarker, 4);
	beatClickGrid = beatClickGrid.zip(beatClickGrid.skip(1));
	log("beatclickgrid", beatClickGrid);
	const strokeDasharray = (width, height) => [0, width + height + width, height].join(",");
	return <g style={{ compOp: "xor" }}>{beatClickGrid.map((xs, i) => {
		const width = xs[1] - xs[0];
		const height = 127 + 10;
		const sWidth = getStrokeWidth(i, 32);
		const strokeWidth = sWidth < 0.05 ? 0 : 0.3 + sWidth;
		return <rect onClick={(e, f) => beatClick(i * 4, trackId, e, f) } className="hoverWhite" key={"_beatclickgrid_" + xs[0]}

			fill={`rgba(0,0,0,${i % 16 >= 8 ? 0.1 : 0.06}`}
			style={{ strokeDasharray: strokeDasharray(width, height) }}
			stroke={`rgba(80,80,80,${strokeWidth + 0.5})`}
			opacity="0.7" strokeWidth={strokeWidth}
			x={xs[0]}
			width={width}
			y={-10} height={height} />;
	}
	) }</g>;
});

const DetailViews = component2(({waveform,trackId,waveformLPF, midiData,transposedChords, transposedKey, gain, startOffset=0, endOffset = Infinity,maskId})=> 
							<g style={{ mask: maskId ? `url(#${maskId})` : null}}>
								{
									(waveform && !(waveform.get("error"))) ? <Waveform
								
										key="waveform_Container"
								
										chords={transposedChords }
										gain={(gain || 0.4) }
										style={{ opacity: 0.9 }}
										musicalKey={transposedKey}
										{...{startOffset,endOffset, waveform, trackId}}
										/>
										: null
								}
								{
									waveformLPF ? <Waveform
										key={"waveformLPF_Container"}
										waveform={waveformLPF}
										chords={transposedChords}
										gain={(gain || 0.4) * 1.2}
										style={{ opacity: 0.3, stroke: "rgba(0,0,0,0.8)", fill: "rgba(0,0,0,0.1)", strokeWidth: "1" }}
										musicalKey={undefined}
										{...{startOffset,endOffset,trackId}}
										/>
										: null
								}
								{ midiData ?
									<PianoRoll key={"midi_Container"} notes={midiData} {...{startOffset,endOffset,trackId}}/>
									: null
								}
							</g>
 )


const neededLiveInfo = Immutable.Set(["start_marker","end_marker", "looping", "loop_end", "loop_start"]);
export default component2(({uiState, trackId, track}) => {
	var liveData = track.get("liveData");
	if (!(liveData.keySeq().isSuperset(neededLiveInfo)))
		return <div style={{width:"100%", textAlign:"center", color: "#aaa"}}>no data yet</div>
	var viewboxWidth = 1000;
	var viewboxHeight = trackId == "selectedClip" ? 150: 200;
	var visibleBeats = uiState.get("visibleBeats");
	//  console.log("children");

	var playingPosX = liveData.get("playingPosition") || 0;

	var endMarker = parseFloat(liveData.get("looping") ? liveData.get("end_marker"):liveData.get("loop_end"));
	var startMarker = parseFloat(liveData.get("start_marker"));
	var startRenderPos = Math.min(startMarker, 0);
	var scale = viewboxWidth / visibleBeats;// * 
	var shortnessAdjust = 1/Math.min(1,Math.ceil(4*(endMarker-startMarker)/256)/4);
	if (shortnessAdjust==3)
		shortnessAdjust=2;
	// console.log("shortnessAdjust",shortnessAdjust);
	log(playingPosX, uiState, liveData, trackId, track);
    var midiData = track.getIn(["midiData", "notes"]);
    var waveform = track.getIn(["fileData", "waveform"]);
	var waveformLPF = track.getIn(["fileData", "waveformLPF"]);
	const gain = liveData.get("gain");
	const transposedChords = liveData.get("transposedChords");
	const transposedKey = liveData.get("transposedKey");
	const isSelectedClip = track.getIn(["liveData","isSelected"]);
	// console.log("positions",playingPosX,startRenderPos,endMarker,startMarker);
    if ((!(waveform && !(waveform.get("error"))) && !midiData))
        return <div>Waveform / midi not yet	 loaded</div>;
	return <div key={"trackid_detail_" + trackId}>

		<svg style={{ overflow: "hidden", backfaceVisibility: "hidden" }}
			width={"100%"}  height={"100%"}
			viewBox={[0, 0, viewboxWidth, viewboxHeight].join(" ") }>

			<defs>


				<mask id={"Mask" + trackId}>
					<rect stroke="none" fill="white" opacity={0.5} x={startRenderPos} width={Math.max(playingPosX - startRenderPos, 1) } y={0} height={200} />
					<rect stroke="none" fill="white" opacity={1} x={playingPosX} width={Math.max(endMarker - playingPosX, 0.1) } y={0} height={viewboxHeight} />
					<rect stroke="none" fill="white" opacity={0.3} x={endMarker} width={viewboxWidth - endMarker} y={0} height={viewboxHeight} />
				</mask>

			</defs>
			 { liveData.get("isSelected")|| liveData.get("playing") ?
				<g>
					<g transform={"scale(" + (scale) + "," + (viewboxHeight / 127) + ")"}>
						
						<g transform={`translate(${visibleBeats/4},0)`}>
						
						<g transform={"translate(" + (-playingPosX) + ",0)"}>
						  
							<DetailViews maskId={"Mask" + trackId} {...{waveform,trackId, waveformLPF, midiData, gain, transposedChords, transposedKey}} />
							
							{(liveData.get("looping") === 1) ?
							<rect stroke="white" fill="rgba(255,255,255,0.1)" opacity="0.9"
								y="0" x={liveData.get("loop_start") }
								width={liveData.get("loop_end") - liveData.get("loop_start") } height={127} />
							: null}
							{
								// repeat looped waveform if it finishes at the end of the loop marker
								(liveData.get("looping") === 1 && endMarker === liveData.get("loop_end") ) ? 
								<g opacity="0.6">
								<g id={`loopedRegion_${trackId}`} transform={`translate(${liveData.get("loop_end")-liveData.get("loop_start")},0)`} >
									<DetailViews startOffset={liveData.get("loop_start")} endOffset={liveData.get("loop_end")} {...{waveform,trackId, waveformLPF, midiData, gain, transposedChords, transposedKey}} />
								</g>
								{
										Immutable.Range(liveData.get("loop_end")-liveData.get("loop_start"), Math.max(liveData.get("loop_end"),uiState.get("visibleBeats")*3/4), liveData.get("loop_start") - liveData.get("loop_end"))
										.map(start => <use key={`loopedRegionCopy_${trackId}_${start}`} xlinkHref={`#loopedRegion_${trackId}`} x={start} />)
								}
								</g>
								: null}
								
							<BeatClickGrid startMarker={startMarker} endMarker={liveData.get("end_marker") } trackId={trackId}/>
						</g>
					
						</g>
					</g>
				</g>
			: null }
		</svg>

	</div>;

});




//  <VictoryAnimation data={{playingPosX}} velocity={0.3} tween="elasticInOut">{
	//				    (tweened) =>

            //    }
            //             </VictoryAnimation>