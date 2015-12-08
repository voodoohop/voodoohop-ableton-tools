
var fs = require("fs");
var Immutable = require("immutable");

// var WaveformData = require("waveform-data");
// import doThePeaks from "./doThePeaks.js";
import most from "most";

import {registerTransform} from "../api/audioMetadataGenerator";

var path=require("path");
console.log("path",path);

import {parse} from "csv";

registerTransform({name: "vampChord_HPA", depends:["path","timeToBeat"], transform: (audioPath, timeToBeat) => {
	var parsedPath = path.parse(audioPath);
	var fileName = parsedPath.name;
	
	return most.fromPromise(new Promise((resolve,reject) => {
		fs.readFile("/Users/thomash/Documents/audioFeatures/"+fileName+"_vamp_HPA_HPA_HPA_ACE.csv","utf8", (errFile,vampFeature) => {
			if (errFile) {
				console.error(errFile);
				reject(errFile);
				return;
			}
	console.log("vampFeature",vampFeature);
			parse(vampFeature, (err,data) => { 
			var chordStream = most.from(Immutable.fromJS(data).map((d,i, dta) => {
				var chord = d.get(1).split(":");
	
				var majorMinorSymbol = chord[1] === "min" ? "m":"";
				var nextTime = dta.getIn([i+1,0]);
				return Immutable.Map({startTime:d.get(0), endTime: nextTime, chord: chord[0]+majorMinorSymbol});
			}).filter(d => d.get("chord") !== "N"));
			var warpedStartTimes = timeToBeat(chordStream.map(c => c.get("startTime")));
			var warpedEndTimes = timeToBeat(chordStream.map(c => c.get("endTime")));
			var warpedChordStream = most.zip((start, end, origChord) =>  
				origChord.set("startTime",start).set("endTime", end)
				, warpedStartTimes, warpedEndTimes, chordStream);
			resolve(warpedChordStream);
			})
		})
	}));		
}});