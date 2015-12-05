

// var lame = require('lame');

var fs = require("fs");
var Immutable = require("immutable");

var WaveformData = require("waveform-data");
import doThePeaks from "../transforms/doThePeaks.js";


// import WarpAdaptorCreator from "./warpWaveformDataAdaptor.js";
console.log("wfdata",WaveformData.builders);
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export default function getWaveformPeaks(path, audioMetadata, warpMarkers, numPeaks=512) {
  console.log(audioMetadata);
  return new Promise(resolve =>{
    
      // var sourceCre = ;
        // var adapter=ArrayBufferAdapter;
        var warpAdapterCreater = WarpAdaptorCreator(WaveformData.adapters.arraybuffer, warpMarkers);
        console.log("warpadaptercreater",warpAdapterCreater);
        // ,{scale:audioMetadata.get("duration")*audioMetadata.get("samplerate")/1024}
        audioCtx.decodeAudioData(fs.readFileSync(path).buffer, decodedData=>
        {
          var wfData = new WaveformData(doThePeaks(decodedData,numPeaks).buffer, warpAdapterCreater);
          // console.log(wfData); 
          wfData = wfData.resample({width:2048});
          console.log("wfData",wfData);
          resolve(Immutable.fromJS(wfData.adapter.data));
        });
  });
  // return null;

  // console.log("input", path, audioMetadata.toString());
  // // var audioElement = new Audio("file:"+path);


  // // audioElement.src="file:"+path;
  // // audioElement.preload = 
  // // audioElement.load();

  // var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // // console.log("audioelement",{e:audioElement});

  // // var source = audioCtx.createMediaElementSource(audioElement);

  // audioCtx.decodeAudioData(fs.readFileSync(path).buffer, (buffer) => {
  //   console.log("processing raw");
    
  //   console.log("done processing raw");
  //   var offAudioCtx = new OfflineAudioContext(1, buffer.duration*4096, 4096);

  //   console.log("buf", buffer);
  //   var source = offAudioCtx.createBufferSource();
  //   source.buffer = buffer

	// 			// resolve()
		

  //   // audioCtx.startRendering();

  //   var scriptNode = offAudioCtx.createScriptProcessor(buffer.duration*4096/numPeaks, 1, 1);

  //   scriptNode.connect(offAudioCtx.destination);
  //   var count=0;
  //   scriptNode.onaudioprocess = function (audioProcessingEvent) {
  //     console.log(audioProcessingEvent);
  //     // The input buffer is the song we loaded earlier
  //     var inputBuffer = audioProcessingEvent.inputBuffer;

  //     // The output buffer contains the samples that will be modified and played
  //     // var outputBuffer = audioProcessingEvent.input;

  //     // Loop through the output channels (in this case there is only one)
  //     for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
  //       var inputData = inputBuffer.getChannelData(channel);
  //       // var outputData = outputBuffer.getChannelData(channel);
  //       var max=-Infinity;
  //       var min=Infinity;
  //       // Loop through the 4096 samples
  //       for (var sample = 0; sample < inputBuffer.length; sample++) {
  //         max = sample>max?sample:max;
  //         min = sample<min?sample:min;
  //         // console.log(inputData[sample]);
  //         // make output equal to the same as the input
  //         // outputData[sample] = inputData[sample];
  //         // count++;
  //         // add noise to each output sample  
  //         // outputData[sample] += ((Math.random() * 2) - 1) * 0.2;
  //       }
  //       // console.log(count/4096);
  //     }
  //   }
  //   // audioCtx.startRendering();
  //   source.connect(scriptNode);
  //   scriptNode.connect(offAudioCtx.destination);
  //   source.start();
  //   offAudioCtx.startRendering();
  //   // console.log("started rendering",path);
  // });
  // return new Promise(resolve => {
  //   audioCtx.oncomplete = function (e) {
  //     console.log('rendered', e);
  //     resolve(Immutable.Map({ audioBuffer: e.renderedBuffer }));
  //   }
  // }
    // );

}