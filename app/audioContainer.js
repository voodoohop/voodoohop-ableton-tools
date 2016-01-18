
import React from 'react';
import component from 'omniscient';
import logger from "./utils/streamLog";

import Immutable from "immutable";

import actionSubject from "./api/actionSubject";

import Waveform from "./waveform";
import PianoRoll from "./pianoroll";

var log=logger("renderContainer");

function beatClick(beat,trackId,e,f) {
	log("beatClick",beat,trackId,e);
	actionSubject.push(Immutable.Map({type: "clickedBeat", beat,trackId}));
}

var BeatClickGrid = component(({startMarker, endMarker,trackId})=> {
		var beatClickGrid=Immutable.Range(startMarker,endMarker, 4);
		beatClickGrid = beatClickGrid.zip(beatClickGrid.skip(1));
		log("beatclickgrid",beatClickGrid);

        return <g>{beatClickGrid.map((xs,i) => {
            return <rect onClick={(e,f) => beatClick(i*4,trackId,e,f)} key={"_beatclickgrid_"+xs[0]} stroke="white" fill="rgba(0,0,0,0)" opacity="0.4 " strokeWidth="0.08" 
                x={xs[0]} 
                width={xs[1]-xs[0]} 
                y={-10} height={127+10} />;
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
	 console.log("children");
	
	var scale=viewboxWidth/visibleBeats;
	var playingPosX=liveData.get("playingPosition") || 0;
	var loopHighlight=null;
	if (liveData.get("looping") === 1) {
			var loopStart = liveData.get("loop_start");
			var loopEnd = liveData.get("loop_end");
			loopHighlight = <rect stroke="white" fill="rgba(255,255,255,0.1)" opacity="0.9" y="0" x={loopStart} width={loopEnd-loopStart} height={127} />
		}
	var endMarker=parseFloat(liveData.get("end_marker"));	
	log(playingPosX,uiState,liveData,trackId,track);
    var waveform=track.getIn(["fileData","waveform"]);
    var midiData = track.getIn(["midiData","notes"]);
    if (!waveform && !midiData)
        return <div>Waveform / midi not yet loaded</div>;
    var detailViews=[];
    // var detailViewMidi=null;
    //<div>no visualisation for this data type</div>;
    // return detailView;
    if (track.getIn(["fileData","waveform"]))
      detailViews.push(<Waveform 
				trackId={trackId}
                key={"blababla_"+detailViews.length} 
				waveform={waveform} 
				chords={liveData.get("transposedChords")} 
                gain={liveData.get("gain") || 0.4}
				musicalKey={track.getIn(["liveData", "transposedKey"])}/>);
    
      if (track.get("midiData"))
    {
      detailViews.push(<PianoRoll key={detailViews.length} notes={midiData} trackId={trackId} />);
    }
    if (detailViews.length==0)
        return <div> no midi or waveform data yet </div>
    console.log("detailView",detailViews);
    
	return <div key={"trackid_detail_"+trackId}><svg style={{overflow:"hidden"}} preserveAspectRatio="none"
					width={"100%"}  height={"100%"}
					viewBox={[0,0,viewboxWidth, viewboxHeight].join(" ")}>
						<defs>
					    	<mask id={"Mask"+trackId}>
								<rect stroke="none" fill="white" opacity={0.3} x={0} width={Math.max(playingPosX,1)} y={0} height={200} />
								<rect stroke="none" fill="white" opacity={1} x={playingPosX} width={endMarker-playingPosX} y={0} height={viewboxHeight} />
								<rect stroke="none" fill="white" opacity={0.3} x={endMarker} width={viewboxWidth-endMarker} y={0} height={viewboxHeight} />

    						</mask>
					   </defs>

					    <g transform={"scale("+(scale)+","+(viewboxHeight/127)+") translate("+(-playingPosX+(visibleBeats/4))+",0)"}>	
						  <g style={{mask:"url(#"+"Mask"+trackId+")"}}>
							{detailViews}
						  </g>
						  {loopHighlight}

					      <BeatClickGrid startMarker={liveData.get("start_marker")} endMarker={liveData.get("end_marker")} trackId={trackId}/> 
						</g>
					</svg>
                    </div>;

    }
)

