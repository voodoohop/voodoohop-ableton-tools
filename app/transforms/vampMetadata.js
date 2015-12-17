
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
				reject("not able to open vamp chord file"+errFile);
				return;
			}
	console.log("vampFeature",vampFeature);
			parse(vampFeature, (err,data) => { 
			var chordStream = most.from(Immutable.fromJS(data).map((d,i, dta) => {
				var chord = d.get(1).split(":");
	
				var majorMinorSymbol = typeof chord[1] === "string" && chord[1].split("/")[0]  === "min" ? "m":"";
				var nextTime = dta.getIn([i+1,0]);
				return Immutable.Map({startTime:parseFloat(d.get(0)), endTime: parseFloat(nextTime), chord: chord[0]+majorMinorSymbol});
			}));//.filter(d => d.get("chord") !== "N"));
			var warpedStartTimes = timeToBeat(chordStream.map(c => c.get("startTime")));
			var warpedEndTimes = timeToBeat(chordStream.map(c => c.get("endTime")));
			var warpedChordStream = most.zip((start, end, origChord) =>  
				origChord.set("startBeat",start).set("endBeat", end)
				, warpedStartTimes, warpedEndTimes, chordStream);
			warpedChordStream.collect().then(chords => resolve(Immutable.fromJS(chords)));
			})
		})
	}));		
}});

registerTransform({name: "vampChord_QM", depends:["path","timeToBeat"], transform: (audioPath, timeToBeat) => {
	var parsedPath = path.parse(audioPath);
	var fileName = parsedPath.name;
	
	return most.fromPromise(new Promise((resolve,reject) => {
		fs.readFile("/Users/thomash/Documents/audioFeatures/"+fileName+"_vamp_qm-vamp-plugins_qm-keydetector_key.csv","utf8", (errFile,vampFeature) => {
			if (errFile) {
				console.error(errFile);
				reject("not able to open vamp qm chord file"+errFile);
				return;
			}
		console.log("vampFeature_QM",vampFeature);
			parse(vampFeature, (err,data) => { 
			var chordStream = most.from(Immutable.fromJS(data).map((d,i, dta) => {
				var chord = d.get(2).split(" ");
	
				var majorMinorSymbol = chord[1] === "minor" ? "m":"";
				var nextTime = dta.getIn([i+1,0]);
				return Immutable.Map({startTime:parseFloat(d.get(0)), endTime: parseFloat(nextTime), chord: chord[0]+majorMinorSymbol});
			}));//.filter(d => d.get("chord") !== "N"));
			var warpedStartTimes = timeToBeat(chordStream.map(c => c.get("startTime")));
			var warpedEndTimes = timeToBeat(chordStream.map(c => c.get("endTime")));
			var warpedChordStream = most.zip((start, end, origChord) =>  
				origChord.set("startBeat",start).set("endBeat", end)
				, warpedStartTimes, warpedEndTimes, chordStream);
			warpedChordStream.collect().then(chords => {
				console.log("got QM Chords",Immutable.fromJS(chords).toJS());
				resolve(Immutable.fromJS(chords))
			});
			})
		})
	}));		
}});