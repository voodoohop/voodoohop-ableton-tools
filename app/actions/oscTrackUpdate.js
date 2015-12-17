// import {oscInputStream} from "../utils/oscInOut";

// import most from "most";
// console.log("importing metadata");
// import importMetadata from "../utils/importAudioMetadata.js";



// var oscInput= oscInputStream	
// 		.filter(f => f[2] === "playingClip" && f[1]>=0)
// 		.map(f => Immutable.fromJS({trackId: f[1], data: f.slice(3)}))
// 	.scan((state, info)=> state.setIn([info.get("trackId"), info.get("data").get(0)], info.get("data").get(1)), Immutable.Map( ))
// 	// .tap(f => console.log("oscInput1",f.toJS()))
// 	.flatMap(info => most.from(info.keySeq().map(k => info.get(k).set("trackId", k))))
// 	.tap(f => console.log("oscInput",f.toJS()))
// 	.multicast();
// 	// .drain();	
	
	
// import {getTransformed} from "./api/audioMetadataGenerator";
 
// var playingTrackData = oscInput.filter(f=> f.get("playing")===1 && f.get("file_path"));




// var playingTracksMetadata = 	
// 	getTransformed(["path","id3Metadata","audioMetadata", "waveform","warpMarkers","vampChord_HPA","vampChord_QM"], 
// 	// should move this out to a dedicated action reducer whatever
// 	playingTrackData.merge(actionStream.filter(a => a.get("type") === "refreshAudio"))
	
// 	.loop((paths,f) => {
// 		if (f.get("type") === "refreshAudio")
// 		  return {value: f.get("path"), seed:paths};
// 		var path = f.get("file_path");
// 		if (paths.has(path))
// 			return {value:null, seed:paths};
// 		else
// 			return {value:path, seed:paths.add(path)};
// 	}, Immutable.Set()).filter(p => p!=null))	
	
// 	.scan((tracks,track) => tracks.set(track.get("path"), track), Immutable.Map())
// 	.skip(1)

// 	// .scan((tracks, d) => tracks.set(d.get("track"), d), Immutable.Map())
// 	// .skip(1)
	
// 	.tap(f => console.log("playingData",f.toJS()));


// export default metadataStore