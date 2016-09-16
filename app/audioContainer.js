
import React from 'react';

import logger from "./utils/streamLog";

import Immutable from "immutable";

import actionSubject from "./api/actionSubject";

import component from "omniscient";
import Waveform from "./waveform";
import PianoRoll from "./pianoroll";

import {VictoryAnimation} from "victory";

var log=logger("renderContainer");

function beatClick(beat,trackId,e,f) {
	log("beatClick",beat,trackId,e);
	actionSubject.push(Immutable.Map({type: "clickedBeat", beat,trackId}));
}

const getStrokeWidth = (i,modulo) => {
	// let gridWidth = 1;
	// console.log("input",i);
	var current=modulo;
		while (i % current != 0 && current >= 1) {
		current /= 2;
	}
		// console.log("output",current/modulo);
	return current/modulo < 0 ? 0 : current/modulo;
}
import MtSvgLines from 'react-mt-svg-lines';    
var BeatClickGrid = component(({startMarker, endMarker,trackId})=> {
		var beatClickGrid=Immutable.Range(startMarker,endMarker, 4);
		beatClickGrid = beatClickGrid.zip(beatClickGrid.skip(1));
		log("beatclickgrid",beatClickGrid);
		const strokeDasharray = (width,height) => [0,width+height+width,height].join(",");
        return <g style={{compOp:"xor"}}>{beatClickGrid.map((xs,i) => {
			const width = xs[1]-xs[0];
			const height=127+10;
			const sWidth = getStrokeWidth(i,32) ;
			const strokeWidth= sWidth < 0.05 ? 0: 0.3 + sWidth;
            return <rect onClick={(e,f) => beatClick(i*4,trackId,e,f)} className="hoverWhite" key={"_beatclickgrid_"+xs[0]} 
			
			fill={`rgba(0,0,0,${i%16>=8 ? 0.1 : 0.06}`} 
			style={{ strokeDasharray: strokeDasharray(width, height) }}
			stroke={`rgba(80,80,80,${strokeWidth+0.5})`} 
			opacity="0.7" strokeWidth={strokeWidth}
                x={xs[0]} 
                width={width} 
                y={-10} height={height} />;
             }	
        )}</g>;
        });

export default component(({uiState,trackId,track}) => {
	var liveData = track.get("liveData");
	if (!(liveData.has("loop_start")&&liveData.has("loop_end")&&liveData.has("looping")))
		return <div>not enough data</div>
	var viewboxWidth=1000;
	var viewboxHeight=200;
	var visibleBeats = uiState.get("visibleBeats");
	//  console.log("children");
	
	var scale=viewboxWidth/visibleBeats;
	var playingPosX=liveData.get("playingPosition") || 0;
	var loopHighlight=null;
	if (liveData.get("looping") === 1) {
			var loopStart = liveData.get("loop_start");
			var loopEnd = liveData.get("loop_end");
			loopHighlight = <rect stroke="white" fill="rgba(255,255,255,0.1)" opacity="0.9" y="0" x={loopStart} width={loopEnd-loopStart} height={127} />
		}
	var endMarker=parseFloat(liveData.get("end_marker"));
	var startMarker=parseFloat(liveData.get("start_marker"));	
	var startRenderPos = Math.min(startMarker,0);
	log(playingPosX,uiState,liveData,trackId,track);
    var waveform=track.getIn(["fileData","waveform"]);
	var waveformLPF=track.getIn(["fileData","waveformLPF"]);
    var midiData = track.getIn(["midiData","notes"]);
    if (!waveform && !midiData)
        return <div>Waveform / midi not yet	 loaded</div>;
    var detailViews=[];
    // var detailViewMidi=null;
    //<div>no visualisation for this data type</div>;
    // return detailView;
    if (waveform && !(waveform.get("error"))) {
      detailViews.push(<Waveform 
				trackId={trackId}
                key={"blababla_"+detailViews.length} 
				waveform={waveform} 
				chords={liveData.get("transposedChords")} 
                gain={(liveData.get("gain") || 0.4)}
				style={{opacity:0.9}}
				musicalKey={track.getIn(["liveData", "transposedKey"])}/>);
				}
				if (waveformLPF) {
	detailViews.push(<Waveform 
				trackId={trackId}
                key={"waveLPF_"+detailViews.length} 
				waveform={waveformLPF} 
				chords={liveData.get("transposedChords")} 
                gain={(liveData.get("gain") || 0.4 )*1.2}
				style={{opacity:0.3, stroke:"rgba(0,0,0,0.8)", fill:"rgba(0,0,0,0.1)", strokeWidth:"1"}}
				musicalKey={undefined}/>);				
				}
			
      if (track.get("midiData"))
    {
      detailViews.push(<PianoRoll key={detailViews.length} notes={midiData} trackId={trackId} />);
    }
    if (detailViews.length==0)
        return <div> no midi or waveform data yet </div>
    // console.log("detailView",detailViews);
    
	return <div key={"trackid_detail_"+trackId}>

    <svg style={{overflow:"hidden",backfaceVisibility:"hidden"}} 
					width={"100%"}  height={"100%"}
					viewBox={[0,0,viewboxWidth, viewboxHeight].join(" ")}>
                 
	                <defs>
                       <filter id={"blur1_"+trackId} x="0" y="0" width="100%" height="100%">
                                <feGaussianBlur is in="SourceGraphic" stdDeviation={0.15}  result="BLURRED" />
                                 
                           
                        </filter>
                        
  
					    	<mask id={"Mask"+trackId}>
								<rect stroke="none" fill="white" opacity={0.3} x={startRenderPos} width={Math.max(playingPosX-startRenderPos,1)} y={0} height={200} />
								<rect stroke="none" fill="white" opacity={1} x={playingPosX} width={Math.max(endMarker-playingPosX,0.1)} y={0} height={viewboxHeight} />
								<rect stroke="none" fill="white" opacity={0.3} x={endMarker} width={viewboxWidth-endMarker} y={0} height={viewboxHeight} />
    						</mask>
                              
                        </defs>
                          <g>	   
                          <g transform={"scale("+(scale)+","+(viewboxHeight/127)+")"}>	
						  <g transform={"translate("+(-playingPosX+(visibleBeats/4))+",0)"}>
						  <g style={{mask:"url(#"+"Mask"+trackId+")"}}>
							{detailViews}
						  </g>
						  {loopHighlight}

					      <BeatClickGrid startMarker={startMarker} endMarker={liveData.get("end_marker")} trackId={trackId}/> 
						  </g>
						</g>
                        </g>
            
					</svg>
                    
                    </div>;

    });




//  <VictoryAnimation data={{playingPosX}} velocity={0.3} tween="elasticInOut">{
	//				    (tweened) =>
    
            //    }
            //             </VictoryAnimation>