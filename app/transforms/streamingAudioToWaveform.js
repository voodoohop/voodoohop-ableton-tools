

// var lame = require('lame');

var fs = require("fs");
var Immutable = require("immutable");

// var WaveformData = require("waveform-data");
import doThePeaks from "./doThePeaks.js";
import most from "most";

import {registerTransform} from "../api/audioMetadataGenerator";

// import WarpAdaptorCreator from "./warpWaveformDataAdaptor.js";
// console.log("wfdata",WaveformData.builders);
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var audioElements = {};

	

export function getWebAudioBuffer(pathStream) {
return 	pathStream.map(path => {
	console.log("getStreamWaveform", path);
	var offlineAudioCtx = new OfflineAudioContext(1, 2, 44100);
	
	var readStream = new Promise((resolve,reject) => fs.readFile(path, (err,data) => err ? reject(err):resolve(data)));
	
	var audioBuffer = most.fromPromise(readStream)
	// .scan((chunks,chunk) => Buffer.concat([chunks,chunk]), new Buffer([])).skip(5)
	.map(chunk => {console.log(chunk); return new Promise((resolve,reject) => offlineAudioCtx.decodeAudioData(new Uint8Array(chunk).buffer,resolve,reject))})
	.await()//.observe(chunk => console.log("chunk",chunk)).catch(e => console.error(e));
	.tap(b => console.log("audiobuffer",b))
	// console.log("ab",audioBuffer);
	return audioBuffer;
})
};


export function getAudioBufferSourceNode(audioBuffer) {
	 var offlineAudioCtx = audioCtx;//new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);

	 var source = offlineAudioCtx.createBufferSource();
	 source.buffer=audioBuffer;
	 source.playbackRate.value=16;
	 source.start();
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

function webAudioNodeToStream(node, bufSize=512) {
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
			add(most.from(_.clone(inBuf.getChannelData(0)))//.startWith({offset,length})
			);
			offset += inBuf.length;
// 			// console.log(JSON.stringify(audioProcessingEvent));
// 			var outBuf = audioProcessingEvent.outputBuffer;
		}
		node.onended = () => {
			node.disconnect(scriptProcessor);
			scriptProcessor.disconnect(dest);
			end();
		}
		// node.context.startRendering();
	// console.log("streamDest",streamDest.stream.getAudioTracks());
	})
	// .flatMap(m => m)
	//.map(v=> v.collect()).await().observe(v => console.log("streamedFinally???",v)).catch(n => console.error(n));
}



export function audioStreamRangeAccessor(audioStream) {
	return (range) => audioStream.zip((partialStream, indexRange) => ({partialStream,indexRange}),audioStream.flatMap(partial => partial.take(1)))
		.skipWhile(p => p.indexRange.offset <range.min()).takeUntil(p => p.indexRange.offset+p.indexRange.length > range.max()).flatMap(p => p.partialStream.skip(1));
}





registerTransform({name: "audioStream", depends:["audioBuffer"], transform: (audioBuffer) => audioBuffer.map(buffer => ({buffer:buffer.getChannelData(0),duration:buffer.duration, offset: 0, sampleRate: buffer.sampleRate}))});

import {warpMarkerReverseMap, warpMarkerBeatMap, timeToBeatWarper} from "./warpMarkerMapper";

registerTransform({name: "timeToBeat", depends: ["warpMarkers"], transform: timeToBeatWarper});

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

import lodash from "lodash";

function split(a, n) {
    var len = a.length,out = [], i = 0;
    while (i < len) {
        var size = Math.ceil((len - i) / n--);
        out.push(a.slice(i, i += size));
    }
    return out;
}

function resample(a,noSamples, mult=1) {
	console.log("resampling",a.length/noSamples,noSamples);
 var res = split(a, noSamples).map(b => mult*Math.sqrt(b.reduce(function(a,m,i,p) {
    return a + (m*m);
},0)/b.length));
console.log("resampling res",res);
	return res;
}

console.log(most.from(Immutable.Range()).take(1004).collect().then(console.log.bind(console)));

function warpMap(buffer,warpMarkers) {
	return new Promise((resolve) => {
		console.log("buffer",buffer);
	var fm = warpMarkers.get("warpMarkers").first();
	var lm = warpMarkers.get("warpMarkers").last();
	warpMarkerReverseMap(most.from(warpMarkers.get("warpMarkers")))
		(most.from(Immutable.Range(fm.get("desttime"),lm.get("desttime"), (lm.get("desttime")-fm.get("desttime"))/buffer.buffer.length)))
	.collect()
		.then(warpedTimes => {
			var newBuffer=[];
			// var lastWarpedBeat=-1;
			// var lastBufferIndex=-1;
			// var lastTime=-1;
			console.log("warpedTimes",warpedTimes);
			var warpedDuration = warpedTimes[warpedTimes.length-1]/1000;
			warpedTimes.forEach((t,i) => {
				t=t/1000;
			var interpolatedIndex = Math.floor(buffer.buffer.length*t/warpedDuration);
			var sampleVal  = interpolatedIndex >=0 && interpolatedIndex < buffer.buffer.length ? buffer.buffer[interpolatedIndex] : [0];
			// var warpedTime = t/1000;
			// var interpTime = (buffer.buffer.length*())/buffer.duration;
				// lastWarpedBeat= warpMarkers.get("baseBpm") * interpTime/60;
				// lastTime = interpTime;
				// lastBufferIndex = i;
				// console.log(i,t,interpTime); 
				newBuffer[i] = sampleVal; });
			console.log("wms",warpMarkers.toJS());
			var pixelsPerBeat = buffer.buffer.length/warpMarkers.get("durationBeats");
			warpMarkerBeatMap(most.from(warpMarkers.get("warpMarkers")))
				(most.of(0)).take(1).observe(firstBeat => {console.log("firstBeat",firstBeat); resolve({pixelsPerBeat,waveform:newBuffer, firstBeat: (firstBeat), duration: warpedDuration})})
			
		}, error => console.error("warpedTimesError",error))
	// return buffer;
	});
}

// import warpMarkerReverseMap from "./warpMarkerMapper";
import Subject from "../utils/subject";

registerTransform({name: "waveform", depends:["path","audioMetadata","audioStream","warpMarkers"], transform: (path,audioMetadata, audioStream,warpMarkers) => {
  console.log("AUDIOSTREAM",audioStream);
  return audioStream.map(n => {
  	return {buffer: split(n.buffer,4096), duration: n.duration};
  })
//   .map((v,i) => )
  .map(n => warpMap(n,warpMarkers))
  .await()
  .map(w => {
	  console.log("w",w);
 	 return w.waveform.reduce((minmax,n,pos) => {
		//  if (n.length===0)
		//  	return minmax;
	//   var mappedPos = warpMap()
	  minmax.min.push(lodash.min(n)); 
	  minmax.max.push(lodash.max(n));
	  return minmax;
  
  },{min:[],max:[], pixelsPerBeat: w.pixelsPerBeat, firstBeat: w.firstBeat})})
//   .map(n => ({min: warpMap(n.min)}))
.tap(n => console.log("precalculated",n))
  .map( n =>  {
	//   var resampledMin = resample(n.min, 4096,-1);
	//   var resampledMax = resample(n.max, 4096);
	  return Immutable.fromJS(n);//{min: resampledMin, max: resampledMax, pixelsPerBeat: n.pixelsPerBeat* resampledMin.length/n.max.length, firstBeat: n.firstBeat * resampledMin.length/n.min.length})
  })
  
//   .reduce((minmax) => minma,[0,0])
//   .filter((n,i)=> i % 1 === 0))
  .tap(n => console.log("calculated",n.toJS()));//.map(n => Immutable.fromJS(n));//(new Immutable.Range(audioMetadata.get("duration")*audioMetadata.get("sample_rate")));
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