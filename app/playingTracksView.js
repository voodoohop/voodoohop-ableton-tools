import React,{Component} from 'react';
import component from 'omniscient';
// import { dom } from 'react-reactive-class';
import most from "most";
import Immutable from "immutable";

// var ReactiveWaveform = reactive(Waveform);
import keysToColors from "./api/keysToColors";

// import ReactCountdownClock from "react-countdown-clock";

import AudioContainer from "./audioContainer";



var TrackStatistic=component(({fileData}) =>
<div className="ui mini statistics inverted right floated tom blackTransparentBg">
  {
  (fileData.getIn([ "id3Metadata","initialkey"])) ? 
  <div className="statistic tom">
    <div className="value" style={{ color: keysToColors(fileData.getIn([ "id3Metadata","initialkey"]))}}>
      {fileData.getIn([ "id3Metadata","initialkey"])}
    </div>
    <div className="label">
      Key
    </div>
  </div>
  :null
  }
  <div className="statistic  tom">
    <div className="value">
      {fileData.getIn(["warpMarkers","baseBpm"]).toFixed(2) || fileData.getIn([ "id3Metadata","bpm"]) || "-"}
    </div>
    <div className="label">
      Bpm
    </div>
  </div>
  <div className="statistic  tom">
    <div className="value">
      {Math.round(fileData.getIn([ "audioMetadata","duration"])) || "-"}
	</div>
    <div className="label">
      Duration
    </div>
  </div>
  
</div>
);


import actionStream from "./api/actionSubject";

var Track = component(({track,trackId, uiState}) => {
		// var track = props.track;	
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

    
    // var audioContainer = ;
    return (		
    <div className="ui vertical segment inverted" style={{padding:"3px"}}>
    <div className="image" style={{position:"relative"}}>
    <div className="content inverted" style={{position:"absolute", width:"100%"}}>
                 

    {
      track.get("fileData") ? <TrackStatistic fileData={track.get("fileData")} /> : ""
    } 
			    <div className="ui header tom" style={{fontSize:"3vw"}}><span className="blackTransparentBg"> 
{track.getIn(["fileData","id3Metadata","artist"])}
          </span></div>
      <span className="blackTransparentBg" style={{fontSize:"2vw", margin:"0px"}}>{track.getIn(["fileData","id3Metadata","title"])}</span>

    </div><div style={{paddingTop:"10px",height:"100%"}}>
    <AudioContainer uiState={uiState} trackId={trackId} track={track} />   
    </div>
  <button style ={{right:"0px",bottom:"0px", position:"absolute",opacity:0.6}} className={"ui  button inverted mini floated right toggle "+(grouped ? "yellow" : "blue")}
    onClick={() => actionStream.push(Immutable.Map({type:"groupButtonClicked", trackId}))}><i className={grouped ? "fa fa-unlink":"fa fa-link"} style={{fontWeight:"bold"}}></i></button>
  </div>
  </div>
	
				
		
);

});

import log from "./utils/streamLog";

var logger=log("playingTracksView");
// var RTrack = reactive(Track);
export default component(({availableTracks,uiState}) => 
	{
        var sortedTracks = availableTracks.keySeq().sort().toArray();
		logger("thijsTracks", availableTracks,uiState,sortedTracks);
		// var tracks = this.props.tracks;
        sortedTracks.map(log("trkId"));
		if (!availableTracks)
			return <div>no tracks loaded</div>;
		return  <div className="ui inverted relaxed divided list" style={{backgroundColor:"rgba(0,0,0,0)"}}>

			{sortedTracks.map(trackId => {
				
				var track = availableTracks.get(trackId);
				logger("rendering track",track.get("trackId"),track);
        // if (track === undefined || (!track.get("midiData") && !track.get("fileData")))
        //   return <div key={trackId}  className="item">undefined {trackId}</div>;
				return     <div key={"key_"+trackId}  className="item">
							<div className="content">
									<Track track={track} trackId={trackId} uiState={uiState} /> 
							</div>
							</div>;
	})}</div>;
	}
);

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
