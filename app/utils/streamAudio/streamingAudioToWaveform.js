

// var lame = require('lame');

var fs = require("fs");
var Immutable = require("immutable");

// var WaveformData = require("waveform-data");
import doThePeaks from "../doThePeaks.js";
import most from "most";

import {registerTransform} from "../../api/audioMetadataGenerator";

// import WarpAdaptorCreator from "./warpWaveformDataAdaptor.js";
// console.log("wfdata",WaveformData.builders);
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var audioElements = {};

	

export function getWebAudioBuffer(path) {
	console.log("getStreamWaveform", path);
	var offlineAudioCtx = new OfflineAudioContext(1, 2, 4096)
	
	var readStream = new Promise((resolve,reject) => fs.readFile(path, (err,data) => err ? reject(err):resolve(data)));
	
	var audioBuffer = most.fromPromise(readStream)
	// .scan((chunks,chunk) => Buffer.concat([chunks,chunk]), new Buffer([])).skip(5)
	.map(chunk => {console.log(chunk); return new Promise((resolve,reject) => offlineAudioCtx.decodeAudioData(new Uint8Array(chunk).buffer,resolve,reject))})
	.await();//.observe(chunk => console.log("chunk",chunk)).catch(e => console.error(e));
	// console.log("ab",audioBuffer);
	return audioBuffer;
}


export function getAudioBufferSourceNode(audioBuffer) {
	 var offlineAudioCtx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);

	 var source = offlineAudioCtx.createBufferSource();
	 source.buffer=audioBuffer;
	 source.start(0);
	//  source.note
	 console.log("creaeted audiobuffersourcenode",source,audioBuffer);
	 return source;
}	


registerTransform({name: "audioBuffer", depends:["path"], transform: getWebAudioBuffer});
registerTransform({name: "audioBufferSourceNode", depends:["audioBuffer"], transform: (audioBufferStream) => audioBufferStream.reduce((together,buffer) => 
	//todo: here i'm skipping the factthat the buffer could be a stream in the future
	getAudioBufferSourceNode(buffer))});
	
	
registerTransform({name: "lowPassFilteredNode", depends:["audioBufferSourceNode"], 
	transform:  (source) => {
		var filter = source.context.createBiquadFilter();
		filter.type = 'lowpass'; // Low-pass filter. See BiquadFilterNode docs
		filter.frequency.value = 440; // Set cutoff to 440 HZ
		source.connect(filter);
		return filter;
	}
});

var _ = require("lodash");
// var MediaStreamRecorder = require("msr");

function webAudioNodeToStream(node, bufSize=8196) {
		 console.log("creaeted webAudioNodeToStream",node);
		// var streamDest = audioCtx.createMediaStreamDestination();
		// var dest={connect:(...args) => console.log("connargs",args)};
	return most.create((add,end,err) => {
		var dest = node.context.destination;//new OfflineAudioContext(2, 11025*30, 11025);
		var scriptProcessor = node.context.createScriptProcessor(bufSize,1,1);
		node.connect(scriptProcessor);
		scriptProcessor.connect(dest);
		var offset=0;
		var length=node.context.length;
		scriptProcessor.onaudioprocess = function (audioProcessingEvent) {
			var inBuf = audioProcessingEvent.inputBuffer;
			console.log("shaaring inBuf",inBuf,audioProcessingEvent);
			add(most.from(_.clone(inBuf.getChannelData(0))).startWith({offset,length}));
			offset += inBuf.length;
// 			// console.log(JSON.stringify(audioProcessingEvent));
// 			var outBuf = audioProcessingEvent.outputBuffer;
		}
		node.onended = () => {
			node.disconnect(scriptProcessor);
			scriptProcessor.disconnect(dest);
			end();
		}
		node.context.startRendering();
	// console.log("streamDest",streamDest.stream.getAudioTracks());
	})
	// .flatMap(m => m)
	//.map(v=> v.collect()).await().observe(v => console.log("streamedFinally???",v)).catch(n => console.error(n));
}



export function audioStreamRangeAccessor(audioStream) {
	return (range) => audioStream.zip((partialStream, indexRange) => ({partialStream,indexRange}),audioStream.flatMap(partial => partial.take(1)))
		.skipWhile(p => p.indexRange.offset <range.min()).takUntil(p => p.indexRange.offset+p.indexRange.length > range.max()).flatMap(p => p.partialStream.skip(1));
}





registerTransform({name: "audioStream", depends:["audioBufferSourceNode"], transform: webAudioNodeToStream});

import {warpMarkerReverseMap} from "./warpMarkerMapper";


registerTransform({name: "audioStreamRangeAccessor", depends:["audioStream"], transform:audioStreamRangeAccessor});

registerTransform({name: "warpMarkerReverseMap", depends:["warpMarkers"], transform:audioStreamRangeAccessor});


registerTransform({name: "warpedStreamByRange", depends:["warpMarkerReverseMap","audioStreamRangeAccessor"], 
	transform: (warpMarkerReverseMap, audioStreamRangeAccessor) => {
		return (range) => audioStreamRangeAccessor(range.map(warpMarkerReverseMap));
	}
});
// registerTransform({name: , depends:["audioBufferSourceNode"], 
// 	transform:  (source) => {
// 		var filter = audioCtx.createBiquadFilter();
// 		filter.type = 'lowpass'; // Low-pass filter. See BiquadFilterNode docs
// 		filter.frequency.value = 440; // Set cutoff to 440 HZ
// 		source.connect(filter);	
// 		source.start(1);
// 		return filter;
// 	}
// });



registerTransform({name: "waveform", depends:["path","audioMetadata","warpedStreamByRange"], transform: (path,audioMetadata, warpedStream) => {
 return (visibleRange) => visibleRange.map(range =>  warpedStream(range|| new Immutabe.Range(audioMetadata.get("duration")*audioMetadata.get("sample_rate"))));
}});


// export function 
// 	// document.body.appendChild(audioElem);
// 	// audioElem.addEventListener("canplay", () => console.log("canplay"));
// 	var audioElem = new Audio("file:" + path);

// 	audioElem.addEventListener("canplay", data => {
// 	audioElem.playbackRate = 4;
// 	audioElem.preload = "auto";
// 	// audioElements[path] = [audioElem];
// 		console.log("audioelem duration", { audioElem }, "file:" + path, audioElem.duration);
// 		// audioElements[path].push(offlineAudioCtx);
// 		var source = offlineAudioCtx.createMediaElementSource(audioElem);
// 		var scriptProc = offlineAudioCtx.createScriptProcessor(4096, 2, 1);
// 		// audioElements[path].push(scriptProc);
// 		var outSum =0;
// 		var processedSamples=0;
// 		scriptProc.onaudioprocess = function (audioProcessingEvent) {
// 			var inBuf = audioProcessingEvent.inputBuffer;
			
// 			// console.log(JSON.stringify(audioProcessingEvent));
// 			var outBuf = audioProcessingEvent.outputBuffer;

// 				var out = outBuf.getChannelData(0);			
// 			for (var c=0;c<2;c++) {
// 				var inB = inBuf.getChannelData(c);
// 				for (var i=0;i<out.length;i++) {4
// 					// console.log(out[i]);
// 					out[i] = inB[i];
// 					outSum += inB[i] > 0 ? inB[i] : -1 * inB[i];
// 					processedSamples++;
// 				}
// 			}
// 			// console.log(outBuf.getChannelData(0));

// 		}
// 		source.connect(scriptProc);
// 		scriptProc.connect(offlineAudioCtx.destination);
	
// 		var endedListener=() => {
// 			// document.body.removeChild(audioElem); 
// 			console.log("currenttime",audioElem.currentTime);	
			
// 			console.log("sum",outSum,processedSamples);
// 			audioElements[path] = null; 
// 			audioElem.src="";
// 			source.disconnect();
// 			scriptProc.disconnect();	
// 			outSum=0;
// 			audioElem.removeEventListener(endedListener);
// 		};	
// 		audioElem.addEventListener("ended",  endedListener);			
// 		// offlineAudioCtx.


	
// 		// offlineAudioCtx.startRendering();
// 		audioElem.play();
// 	});
	
// 	// audioElem.addEventListener("ended", data =>console.log("ended",data));

// 	return most.fromPromise(new Promise(resolve => "bla"));
// }

// export default getWaveformChunked;//
// function audioElemLoader(path, audioMetadata, warpMarkers) {
// 	console.log("getStreamWaveform", path, audioMetadata);
	
// 	// document.body.appendChild(audioElem);
// 	// audioElem.addEventListener("canplay", () => console.log("canplay"));
// 	var audioElem = new Audio("file:" + path);

// 	audioElem.addEventListener("canplay", data => {
// 	audioElem.playbackRate = 4;
// 	audioElem.preload = "auto";
// 	// audioElements[path] = [audioElem];
// 		console.log("audioelem duration", { audioElem }, "file:" + path, audioElem.duration);
// 		var offlineAudioCtx = audioCtx;//new OfflineAudioContext(2, audioElem.duration * 4096, 4096);
// 		// audioElements[path].push(offlineAudioCtx);
// 		var source = offlineAudioCtx.createMediaElementSource(audioElem);
// 		var scriptProc = offlineAudioCtx.createScriptProcessor(4096, 2, 1);
// 		// audioElements[path].push(scriptProc);
// 		var outSum =0;
// 		var processedSamples=0;
// 		scriptProc.onaudioprocess = function (audioProcessingEvent) {
// 			var inBuf = audioProcessingEvent.inputBuffer;
			
// 			// console.log(JSON.stringify(audioProcessingEvent));
// 			var outBuf = audioProcessingEvent.outputBuffer;

// 				var out = outBuf.getChannelData(0);			
// 			for (var c=0;c<2;c++) {
// 				var inB = inBuf.getChannelData(c);
// 				for (var i=0;i<out.length;i++) {4
// 					// console.log(out[i]);
// 					out[i] = inB[i];
// 					outSum += inB[i] > 0 ? inB[i] : -1 * inB[i];
// 					processedSamples++;
// 				}
// 			}
// 			// console.log(outBuf.getChannelData(0));

// 		}
// 		source.connect(scriptProc);
// 		scriptProc.connect(offlineAudioCtx.destination);
	
// 		var endedListener=() => {
// 			// document.body.removeChild(audioElem); 
// 			console.log("currenttime",audioElem.currentTime);	
			
// 			console.log("sum",outSum,processedSamples);
// 			audioElements[path] = null; 
// 			audioElem.src="";
// 			source.disconnect();
// 			scriptProc.disconnect();	
// 			outSum=0;
// 			audioElem.removeEventListener(endedListener);
// 		};	
// 		audioElem.addEventListener("ended",  endedListener);			
// 		// offlineAudioCtx.


	
// 		// offlineAudioCtx.startRendering();
// 		audioElem.play();
// 	});
	
// 	// audioElem.addEventListener("ended", data =>console.log("ended",data));

// 	return most.fromPromise(new Promise(resolve => "bla"));
// }