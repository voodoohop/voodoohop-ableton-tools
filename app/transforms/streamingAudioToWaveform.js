

// var lame = require('lame');

import fs from "fs";
import Immutable from "immutable";

// var WaveformData = require("waveform-data");
import doThePeaks from "./doThePeaks.js";
import * as most from 'most';


import AudioReader from "../lib/audioreader.js";

import {registerTransform} from "../api/audioMetadataGenerator";

// import WarpAdaptorCreator from "./warpWaveformDataAdaptor.js";
// console.log("wfdata",WaveformData.builders);
// var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var audioElements = {};

import {AIFFDecoder} from "../lib/audiofile";
import log from "../utils/streamLog";
import shell from 'shelljs';


import {Asset}  from 'av';
import 'flac.js';
import 'aac';
import 'alac';

export function getWebAudioBuffer(path) {
	// return 	pathStream.map(path => {

		// var audioBuffer;


		// 	return most.of(new Promise((resolve,reject)=> fs.readFile(path,"utf8",(err,data)=>{
		// 		console.log("calling decoder in 5s for data:", data.length); 
		// 		setTimeout(()=>resolve(new AIFFDecoder().decode(data)),10);

		// 		}))).await();



	const readStream = new Promise((resolve, reject) => fs.readFile(path, (err, data) => err ? reject(err) : resolve(data)));
	const audioBuffer_src = most.fromPromise(readStream);

	var audioBuffer;



	console.log("getStreamWaveform", path);
	const offlineAudioCtx = new OfflineAudioContext(1, 1, 11025);

	if (path.trim().toLowerCase().indexOf(".flac") > 0 || path.trim().toLowerCase().indexOf(".m4a") > 0 || path.trim().toLowerCase().indexOf(".aif") > 0 ) {
		// return most.fromPromise(new Promise(resolve => {
		//           console.log("executing ","ffmpeg -i \""+path+"\" /tmp/decoded.wav");
		// 	shell.exec("rm /tmp/decoded.wav", () =>
		// 	shell.exec("ffmpeg -i \""+path+"\" /tmp/decoded.wav", (res)=> {console.log("reser",res); resolve(getWebAudioBuffer("/tmp/decoded.wav"))})
		// 	);
		// })).flatMap(p => p)//.flatMap(p=>p);
		// audioBuffer = s,chunk) => Buffer.concat([chunks,chunk]), new Buffer([])).skip(5)
		audioBuffer = audioBuffer_src
			.map(Asset.fromBuffer)
			// .tap(log("loaded flac asset"))
			.map(asset => new Promise((resolve, reject) => {
				asset.on("error", reject);
				asset.decodeToBuffer((buffer) => {
					var channels = asset.format.channelsPerFrame;
					var samples = buffer.length / channels;
					const downsample = 11025/asset.format.sampleRate;
					var audioBuf = offlineAudioCtx.createBuffer(1, samples*downsample, 11025);
					var audioChans = audioBuf.getChannelData(0);
					// for (var i = 0; i < channels; i++) {
					// 	audioChans.push(audioBuf.getChannelData(i));
					// }
					for (var i = 0; i < buffer.length; i+=1/downsample) {
						audioChans[Math.round(i*downsample/channels)] = buffer[Math.floor(i)];
					}
					// Do something with your fancy new audioBuffer
					resolve(audioBuf);
					// const offlineAudioCtxBig = new OfflineAudioContext(1, samples*11025/asset.format.sampleRate, 11025);
					// const source = offlineAudioCtxBig.createBufferSource();
					// source.buffer=audioBuf;
					// source.connect(offlineAudioCtxBig.destination);
					// source.start();
					// offlineAudioCtxBig.startRendering().then(resolve).catch(reject);
					// resolve(audioBuf);
				})
				// 	asset.get("duration", duration => {
				//   asset.get("metadata", metadata => {
				//     asset.get("format", audio => {
				//       console.log("flac audio format",audio);
				//       resolve(Imm.Map({metadata:Imm.fromJS(metadata),audio: Imm.fromJS(audio).mapKeys(k => k.toLowerCase().replace("channelsperframe","channels")).set("duration",duration).set("length",Math.round(duration/1000))}))
				//     })
				//   });
				// })
			})).await()

			// .tap(log("loaded flac data"))

	} else {

		// var audioCtx

		// .tap(b => console.log("audiobuffer1",b))

		// .scan((chunks,chunk) => Buffer.concat([chunks,chunk]), new Buffer([])).skip(5)
		audioBuffer = audioBuffer_src
			.map(chunk => AudioReader(new Uint8Array(chunk).buffer, offlineAudioCtx))
			.await()
			// .recoverWith(e => ({}))
			.map(b => b.buffer || b)
			//    .tap(b => console.log("audiobuffer",b));
			.tap(log("otheraudiobuffer"));//new Promise((resolve,reject) => offlineAudioCtx.decodeAudioData(new Uint8Array(chunk).buffer,resolve,reject))})
		//.observe(chunk => console.log("chunk",chunk)).catch(e => console.error(e));
		// .await()
		}
	// console.log("ab",audioBuffer);
	return audioBuffer;
	// })
};



registerTransform({ name: "audioBuffer", depends: ["path"], transform: getWebAudioBuffer });


import _  from "lodash";
// var MediaStreamRecorder = require("msr");



const downsampleFactor = 16;


registerTransform({
	name: "audioStream", depends: ["audioBuffer"], transform: buffer => {
		console.log("sending buffer",buffer);//,buffer.channels[0].length);
		if (buffer.channels) {
			buffer.getChannelData = (i) =>
				buffer.channels[i];
			// {

			// 	var c = buffer.channels[i];
			// 	var downSampled = [];
			// 	for (var j=0;j<c.length;j+=downsampleFactor)
			// 		downSampled.push(c[j]);
			// 	return downSampled;
			// 	//  buffer.channels[i].reduce((downSampled, sample, i)=>i % 8 === 0 ? downSampled.concat([sample]):downSampled,[]);;
			// }
			buffer.duration = buffer.length / buffer.sampleRate;
			buffer.sampleRate = buffer.sampleRate;///downsampleFactor;

		}
		if (!buffer.getChannelData)
			return ({
				error: "couldn't get buffer",
				buffer: [],
				duration: -500,
				offset: 0
			});
		return ({
			buffer: buffer.getChannelData(0),
			duration: buffer.duration || (buffer.length / buffer.sampleRate),
			offset: 0, sampleRate:
			buffer.sampleRate
		});
	}
});

import {warpMarkerReverseMap, warpMarkerBeatMap, timeToBeatWarper} from "./warpMarkerMapper";

registerTransform({ name: "timeToBeat", depends: ["warpMarkers"], transform: timeToBeatWarper });

import lodash from "lodash";

function split(a, n) {
	var len = a.length, out = [], i = 0;
	while (i < len) {
		var size = Math.ceil((len - i) / n--);
		out.push(a.slice(i, i += size));
	}
	return out;
}

function resample(a, noSamples, mult = 1) {
	// console.log("resampling", a.length / noSamples, noSamples);
	var res = split(a, noSamples).map(b => mult * Math.sqrt(b.reduce(function (a, m, i, p) {
    return a + (m * m);
	}, 0) / b.length));
	// console.log("resampling res", res);
	return res;
}

function warpMap(buffer, warpMarkers) {
	return new Promise((resolve, reject) => {
		// console.log("buffer",buffer,warpMarkers);
		console.log("warpMarkers", warpMarkers);
		if (warpMarkers.get("error"))
			reject("warpMarkers not present");
		var fm = warpMarkers.get("warpMarkers").first();
		var lm = warpMarkers.get("warpMarkers").last();
		warpMarkerReverseMap(most.from(warpMarkers.get("warpMarkers").toArray()))
			(most.from(Immutable.Range(fm.get("desttime"), lm.get("desttime"), (lm.get("desttime") - fm.get("desttime")) / buffer.buffer.length).toArray()))
			.collect()
			.then(warpedTimes => {
				var newBuffer = [];
				// var lastWarpedBeat=-1;
				// var lastBufferIndex=-1;
				// var lastTime=-1;
				console.log("warpedTimes", warpedTimes);
				var warpedDuration = warpedTimes[warpedTimes.length - 1] / 1000;
				warpedTimes.forEach((t, i) => {
					t = t / 1000;
					var interpolatedIndex = Math.floor(buffer.buffer.length * t / warpedDuration);
					var sampleVal = interpolatedIndex >= 0 && interpolatedIndex < buffer.buffer.length ? buffer.buffer[interpolatedIndex] : [0];
					// var warpedTime = t/1000;
					// var interpTime = (buffer.buffer.length*())/buffer.duration;
					// lastWarpedBeat= warpMarkers.get("baseBpm") * interpTime/60;
					// lastTime = interpTime;
					// lastBufferIndex = i;
					// console.log(i,t,interpTime); 
					newBuffer[i] = sampleVal;
				});
				console.log("wms", warpMarkers.toJS());
				var pixelsPerBeat = buffer.buffer.length / warpMarkers.get("durationBeats");
				warpMarkerBeatMap(most.from(warpMarkers.get("warpMarkers").toArray()))(most.of(0))
					.tap(log("beatMapRes"))
					.take(1).tap(firstBeat => {
						console.log("firstBeat", firstBeat);
						resolve({ pixelsPerBeat, waveform: newBuffer, firstBeat: (firstBeat), duration: warpedDuration })
					})
					.drain().catch(console.error.bind(console));

			}, error => console.error("warpedTimesError", error))
		// return buffer;
	});
}

import Subject from "../utils/subject";

registerTransform({
	name: "waveform", depends: ["path", "audioStream", "warpMarkers"], transform: (path, audioStream, warpMarkers) => {
		// console.log("AUDIOSTREAM", audioStream, warpMarkers.toJS());
		if (audioStream.error || audioStream.duration < 0)
			return most.throwError("no buffer to convert to waveform");
		return most.fromPromise(warpMap({ buffer: split(audioStream.buffer, audioStream.buffer.length/1024), duration: audioStream.duration }, warpMarkers))
			//   .map((v,i) => )
			//   .map(n => warpMap(n,warpMarkers))

			.map(w => {
				// console.log("w", w);
				return w.waveform.reduce((minmax, n, pos) => {
					//  if (n.length===0)
					//  	return minmax;
					//   var mappedPos = warpMap()
					minmax.min.push(lodash.min(n));
					minmax.max.push(lodash.max(n));
					minmax.size = pos + 1;
					return minmax;

				}, { min: [], max: [], pixelsPerBeat: w.pixelsPerBeat, firstBeat: w.firstBeat, path })
			})
			//   .map(n => ({min: warpMap(n.min)}))
			// .tap(n => console.log("precalculated",n))
			.map(n => {
				//   var resampledMin = resample(n.min, 4096,-1);
				//   var resampledMax = resample(n.max, 4096);
				return Immutable.fromJS(n);//{min: resampledMin, max: resampledMax, pixelsPerBeat: n.pixelsPerBeat* resampledMin.length/n.max.length, firstBeat: n.firstBeat * resampledMin.length/n.min.length})
			})

			//   .tap(n => console.log("calculated",n.toJS()))//.map(n => Immutable.fromJS(n));//(new Immutable.Range(audioMetadata.get("duration")*audioMetadata.get("sample_rate")));
			.flatMapError(e => Immutable.fromJS({ error: "no warpMarkers saved" }))
	}
});

function smoothArray(values, smoothing) {
	//   values = values.toJS(); 
  var value = values[0]; // start with the first input
  var newValues = [value];
	//   console.log("values",values);
  for (var i = 1, len = values.length; i < len; ++i) {
    var currentValue = values[i];
    value += (currentValue - value) / smoothing;
    newValues.push(value);
  }
	//   console.log("newVals",newValues);
  return newValues;
}


registerTransform({
	name: "waveformLPF", depends: ["path", "audioStream", "warpMarkers"], transform: (path, audioStream, warpMarkers) => {
		//    console.log("AUDIOSTREAMLPF",audioStream,warpMarkers.toJS());
		if (audioStream.error || audioStream.duration < 0)
			return most.throwError("no buffer to convert to waveform");

		return most.fromPromise(warpMap({ buffer: split(smoothArray(audioStream.buffer, 100), audioStream.buffer.length/4096), duration: audioStream.duration }, warpMarkers))
			//   .map((v,i) => )
			//   .map(n => warpMap(n,warpMarkers))

			.map(w => 
				// console.log("w", w);
				w.waveform.reduce((minmax, n, pos) => {
					//  if (n.length===0)
					//  	return minmax;
					//   var mappedPos = warpMap()
					minmax.min.push(lodash.min(n));
					minmax.max.push(lodash.max(n));
					minmax.size = pos + 1;
					return minmax;

				}, { min: [], max: [], pixelsPerBeat: w.pixelsPerBeat, firstBeat: w.firstBeat, path })
			)
			//   .map(n => ({min: warpMap(n.min)}))
			// .tap(n => console.log("precalculated",n))
			.map(n => _.extend(n, { min: smoothArray(n.min, 2), max: smoothArray(n.max, 2) }))
			.map(n => {
				//   var resampledMin = resample(n.min, 4096,-1);
				//   var resampledMax = resample(n.max, 4096);
				return Immutable.fromJS(n);//{min: resampledMin, max: resampledMax, pixelsPerBeat: n.pixelsPerBeat* resampledMin.length/n.max.length, firstBeat: n.firstBeat * resampledMin.length/n.min.length})
			})

			//   .tap(n => console.log("calculated",n.toJS()))//.map(n => Immutable.fromJS(n));//(new Immutable.Range(audioMetadata.get("duration")*audioMetadata.get("sample_rate")));
			.flatMapError(e => Immutable.fromJS({ error: "no warpMarkers saved" }))
	}
});
