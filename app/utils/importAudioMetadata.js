import Subject from "./subject.js";
// import gen from "../api/audioMetadataGenerator";
import most from "most";
import ipcStream from "electron-ipc-stream";
import {fetchOrProcess} from "../api/db";

import Imm from "immutable";



// var metadataExtractor=ipcStream("metadataExtractRequest");
// var metadataExtractorResult=ipcStream("metadataExtractResult");


var taglib = require("thomash-node-audio-metadata");

var FindFiles = require("node-find-files");


var extensions="mp3,m4a,mp4,aif,aiff,wav".split(",");

var finder = new FindFiles({
    rootFolder : "/Users/thomash/Documents/organised/electronica",
    filterFunction: (path,start) => {
      // console.log("path",path);
      return extensions.reduce((hasExtension, ext) => path.toLowerCase().endsWith(ext) || hasExtension, false);
    }
});

var toTagStream = most.fromEvent("match",finder).until(most.fromEvent("complete",finder)).zip(t => t, most.periodic(5000,true));

var extractMetadata = (path) => {
  console.log("extracting metadata",path);
  
 var f =new taglib.File(path);
 return new Promise((resolve) => f.readTaglibMetadata((res) => {
  //  availableMetadataExtractor.push(extractMetadata);
   res = Imm.fromJS(res);
   resolve(res.set("audio",res.get("audio") ? res.get("audio").mapKeys(k => k === "length" ? "duration" : k):null));
 }));
};

// var promiseGen = toTagStream.map(f =>);44

// var availableMetadataExtractor = Subject(extractMetadata);

// var extractMetadataStreamIn = Subject();



// var extractedMetadata = extractMetadataStreamIn.zip((file, extractor) => new Promise(resolve => extractor(file,resolve)), availableMetadataExtractor).await();

// var metadataStream = fetchOrProcess(toTagStream.map(f =>f[0]), extractMetadata);


import extractWarpMarkers from "./extractWarpMarkers";

// var Imm = require("immutable");

// var warpMarkerStream = metadataStream.flatMap(f => most.fromPromise(extractWarpMarkers(f)).flatMapError(e => {
//   console.log("error_"+e);
//   return most.of(e);
// }))
// .tap(p => console.log("promiseWarpMarkers",p.toString()));

// warpMarkerStream.zip((warpMarkers,md) => md.merge(warpMarkers), metadataStream)
// .observe(out => console.log("out",out.toString())).catch(console.error.bind(console));



console.log("helllooo");
// finder.startSearch();




import {registerTransform, transforms} from "../api/audioMetadataGenerator";

import {overviewWaveform} from "./thomashWarpWaveform";

import audiobufferPeaks from "./audioBuffer2Peaks";
import {getAudioBuffer} from "./streamAudio/streamingAudioToWaveform";



registerTransform({name: "audioAndId3Metadata", depends:["path"], transform: extractMetadata});

// registerTransform({name: "waveformRange", depends:[], transform: waveform});


registerTransform({name: "audioMetadata", depends:["audioAndId3Metadata"], transform: (m) => m.get("audio") });
registerTransform({name: "id3Metadata", depends:["audioAndId3Metadata"], transform: (m) => m.get("metadata") });

registerTransform({name: "warpMarkers", depends:["path","audioMetadata"], transform: extractWarpMarkers });

// registerTransform({name: "overviewWaveform", depends:["path","audioMetadata","id3Metadata","warpMarkers"], transform: overviewWaveform });


console.log("transforms",transforms["path"]);

// transforms["warpMarkers"](toTagStream.map(f=>f[0]))
// .observe(out => console.log("out",Object.keys(out.toJS()))).catch(console.error.bind(console));

// console.log("AudioBuffer", audioBuffer);

var res = (pathInput, requiredData = "warpMarkers") => { 
  // finder.startSearch(); return (toTagStream.map(f=>f[0]).take(100))
  
return transforms[requiredData](pathInput)
.tap(console.log.bind(console))  

// .observe(out => console.log("out",Object.keys(out.toJS()))).catch(console.error.bind(console));


  pathInput
  };
export default res;
