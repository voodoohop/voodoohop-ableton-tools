import React,{Component} from 'react';

import component from './utils/immComponent';

// import { dom } from 'react-reactive-class';
import {fromEvent} from 'most';
import Immutable from "immutable";

// var ReactiveWaveform = reactive(Waveform);
import keysToColors from "./api/keysToColors";

// import ReactCountdownClock from "react-countdown-clock";

import AudioContainer from "./audioContainer";



var TrackStatistic=component(({fileData,liveData}) => {
  const beatsRemaining = Math.round(liveData.get("end_marker") - liveData.get("playingPosition"));
return <div className="ui mini statistics inverted right floated tom blackTransparentBg">
  {
  (liveData.get("transposedKey")) ? 
  <div className="statistic tom">
    <div className="value" >
      <span style={{ color: keysToColors(liveData.get("transposedKey"))}}>{liveData.get("transposedKey")}</span> 
      <span style={{fontSize:"80%"}}>{(liveData.get("pitch") != 0 ? ((liveData.get("pitch") > 0 ? " +":" ")+`${liveData.get("pitch")}`): "")}</span>
    </div>
    <div className="label">
      Key
    </div>
  </div>
  :null
  }
  <div className="statistic  tom">
    <div className="value">
      {Math.round(fileData.getIn(["warpMarkers","baseBpm"])) || fileData.getIn([ "id3Metadata","bpm"]) || "-"}
    </div>
    <div className="label">
      Bpm
    </div>
  </div>
  <div className="statistic  tom">
    <div className="value" style={beatsRemaining < 64 ? {color:"orange", fontWeight:"bold"}:{}} >
      {beatsRemaining}
	</div>
    <div className="label">
      Beats
    </div>
  </div>
  
</div>
});


import actionStream from "./api/actionSubject";

import {DraggableParent, DraggableChild, dragEvent} from "./utils/makeDraggableTrack";


actionStream.plug(fromEvent("beginDrag", dragEvent));
actionStream.plug(fromEvent("endDrag", dragEvent));
actionStream.plug(fromEvent("hoverDrag", dragEvent).throttle(20)
.skipRepeatsWith((a,b)=> a.get("targetId") === b.get("targetId"))
);


var Track = component(function({track,trackId, uiState}) {
		// var track = props.track;	
        // console.log("props",this.props);
		if (!track)
			return <div>no track found</div>;
	
    // console.log("trackttt",track.toJS());
		var progress=20;
	  var textStyle = {
      'fill': '#ffffff',
      'textAnchor': 'middle'
    };
    if (!track.getIn(["fileData","waveform"]) && track.getIn(["liveData","file_path"])) {
      actionStream.push(Immutable.Map({type:"loadMetadata", path: track.getIn(["liveData","file_path"])}));
      return <div>{"loading"}</div>;
    }  
    
     var grouped =uiState.getIn(["groupedTracks",trackId]);

    var style={padding:"3px"/*,backgroundColor:"white"*/,boxSizing:"content-box"};
    if (uiState.getIn(["dragState", "hover"]) && uiState.getIn(["dragState", "hover","sourceId"])!==trackId)
        style.backgroundColor="rgba(255,255,255,0.12)"
    if (uiState.getIn(["dragState", "hover","targetId"])===trackId && uiState.getIn(["dragState", "hover","sourceId"])!==trackId) {
        style.border="1px dotted white";
        style.backgroundColor="rgba(255,255,255,0.2)";
     }
    // var audioContainer = ;
    return this.props.connectDragSource(
        this.props.connectDropTarget(<div className="ui vertical segment inverted" style={style}>
    <div className="image" style={{position:"relative"}}>
    <div className="content inverted" style={{position:"absolute", width:"100%"}}>
                 

    {
      track.get("fileData") ? <TrackStatistic liveData={track.get("liveData")} fileData={track.get("fileData")} /> : ""
    } 
			    <div className="ui header tom" style={{fontSize:"3vw", fontWeight:"bold"}}><span className="blackTransparentBg"> 
{track.getIn(["fileData","id3Metadata","artist"]) || track.getIn(["liveData","name"])}
          </span></div>
      <span className="blackTransparentBg" style={{fontSize:"3vw", margin:"0px"
      // ,color: keysToColors(track.getIn([ "liveData","transposedKey"]))
    }}>{track.getIn(["fileData","id3Metadata","title"])}</span>

    </div><div style={{paddingTop:"10px",height:"100%"}}>
      <AudioContainer uiState={uiState} trackId={trackId} track={track} />   
    </div>
  
  </div>
  </div>));

});

const DraggableTrack = DraggableChild(Track);

import log from "./utils/streamLog";

var logger=log("playingTracksView");
// var RTrack = reactive(Track);

// import { CardStack, Card } from 'react-cardstack';


const PlayingTracks = component(({availableTracks,uiState}) => 
	{
        var sortedTracks = availableTracks.keySeq().sort().toArray();
		logger("thijsTracks", availableTracks,uiState,sortedTracks);
		// var tracks = this.props.tracks;
        sortedTracks.map(log("trkId"));
		if (!availableTracks)
			return <div>no tracks loaded</div>;
		return  <div className="ui inverted divided list" style={{backgroundColor:"rgba(0,0,0,0)"}}>

			{sortedTracks.map(trackId => {
				
				var track = availableTracks.get(trackId);
				logger("rendering track",track.get("trackId"),track);
 				return     <div key={"key_"+trackId}  className="item">
							<div className="content">
									<DraggableTrack track={track} trackId={trackId} uiState={uiState} /> 
							</div>
							</div>;
	})}
    </div>;
	}
);


export default DraggableParent(PlayingTracks);

// <div className="floating ui">
//   <ProgressLabel
//    style={{display:"none"}}
//         progress={progress}
//         startDegree={0}
//         progressWidth={8}
//         trackWidth={10}
//         cornersWidth={4}
//         size={50}
//         fillColor="black"
//         trackColor="red"
//         progressColor="black">

//         <text x="200" y="200" style={textStyle}>{`${progress}%`}</text>

//       </ProgressLabel>
// </div>
