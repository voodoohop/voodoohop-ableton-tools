import React,{Component} from 'react';
import component from 'omniscient';
// import { dom } from 'react-reactive-class';
import most from "most";
import Immutable from "immutable";
import Waveform from "./waveform";

// var ReactiveWaveform = reactive(Waveform);
import keysToColors from "./api/keysToColors";

// import ReactCountdownClock from "react-countdown-clock";

import ProgressLabel from "react-progress-label";



var TrackStatistic=component(({fileData}) =>
<div className="ui mini statistics inverted right floated tom blackTransparentBg">
  <div className="statistic tom">
    <div className="value" style={{ color: keysToColors(fileData.getIn([ "id3Metadata","initialkey"]))}}>
      {fileData.getIn([ "id3Metadata","initialkey"])}
    </div>
    <div className="label">
      Key
    </div>
  </div>
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
      {fileData.getIn([ "audioMetadata","duration"]) || "-"}
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
    if (!track.getIn(["fileData","waveform"])) {
      actionStream.push(Immutable.Map({type:"loadMetadata", path: track.getIn(["liveData","file_path"])}));
      return <div>loading...</div>;
    }  
    

    return (		
    <div className="ui vertical segment inverted" style={{padding:"3px"}}>
    <div className="image">
    <div className="content inverted" style={{position:"absolute", width:"100%"}}>
  
      <TrackStatistic fileData={track.get("fileData")} />
      
			    <div className="ui header tom"><span className="blackTransparentBg">{track.getIn(["fileData","id3Metadata","artist"])}</span></div>
      <span className="blackTransparentBg">{track.getIn(["fileData","id3Metadata","title"])}</span>

	</div>    

	 	<Waveform 
				trackId={trackId}
				liveData={track.get("liveData")}
				metadata={track.getIn(["fileData","audioMetadata"])} 
				waveform={track.getIn(["fileData","waveform"])} 
        uiState={uiState}
				chords={
					(track.getIn(["fileData","vampChord_HPA"]) && !track.getIn(["fileData","vampChord_HPA","error"]) && track.getIn(["fileData","vampChord_HPA"]))
				|| 	(track.getIn(["fileData","vampChord_QM"]) && !track.getIn(["fileData","vampChord_QM","error"]) && track.getIn(["fileData","vampChord_QM"]))
 
				} 
				musicalKey={track.getIn(["fileData", "id3Metadata","initialkey"])}/>
			     </div>
    <div className="content inverted">
			    <div className="description">
 
</div>
	</div>
    </div>
	
				
		
);

});



// var RTrack = reactive(Track);
export default component(({availableTracks,uiState}) => 
	{
		// console.log("thisTracks", availableTracks);
		// var tracks = this.props.tracks;
		if (!availableTracks)
			return <div>no tracks loaded</div>;
		return  <div className="ui inverted relaxed divided list" style={{backgroundColor:"rgba(0,0,0,0.9)"}}>

			{availableTracks.keySeq().sort().map(trackId => {
				
				var track = availableTracks.get(trackId);
				console.log("rendering track",track.get("trackId"),track);
				return     <div key={trackId}  className="item">
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
