import Subject from "./subject.js";
// import gen from "../api/audioMetadataGenerator";
import * as most from 'most';
// import {fetchOrProcess} from "../api/db";


import Imm from "immutable";
import actionStream from "../api/actionSubject";

import "../transforms/vampMetadata.js";

// import {remote} from "electron";
import fs from "fs";

import log from "../utils/streamLog";

import taglib from "thomash-node-audio-metadata";

import AV  from 'av';
      import 'flac.js';
// var filewalker = require('filewalker');
// require("node-find-files");


var extensions=".mp3,.m4a,.mp4,.aif,.aiff,.wav".split(",");

// var finder = filewalker("/Users/thomash/Documents/organised/electronica",{maxPending:-1});

// import metadataStore from "../store/metadataStore";
  //  .drain();  

var mm = require('musicmetadata');

const extractMetadata = path => {
  console.log("extracting metadata",path);

 if (path.toLowerCase().indexOf(".flac")>0) {
 
// create a new parser from a node ReadStream
//  var flac = require("flac-metadata");

var flacData = fs.readFileSync(path);
// var stream = require('stream');

// Initiate the source
// var bufferStream = new stream.PassThrough();

// Write your buffer




// var processor = new flac.Processor({ parseMetaDataBlocks: true });
// processor.on("postprocess", function(mdb) {
//   console.log(mdb.toString(),mdb);
// });
// processor.on("preprocess", function(mdb) {
//   console.log("preproc",JSON.stringify(mdb));
// });

// bufferStream.pipe(processor);


// var mm = require('musicmetadata');

// var parser = mm(bufferStream, { duration: true },function (err, metadata) {
//   if (err) throw err;
//   console.log("mmmetadata",metadata);
// });

// var FLAC = require('flac-parser')
 

// var parser = bufferStream.pipe(new FLAC());

// parser.on('data', function(tag){
//     console.log(tag.type)  // => 'samplesInStream'
//     console.log(tag.value) // => 443520
// })

// bufferStream.end(flacData);


    return most.fromPromise(new Promise((resolve,reject) => {
       

      var asset = AV.Asset.fromBuffer(flacData);
      asset.get("duration", duration => {
        asset.get("metadata", metadata => {
          asset.get("format", audio => {
            console.log("flac audio format",audio);
            resolve(Imm.Map({metadata:Imm.fromJS(metadata),audio: Imm.fromJS(audio).mapKeys(k => k.toLowerCase().replace("channelsperframe","channels")).set("duration",duration).set("length",Math.round(duration/1000))}))
          })
        });
      })
    })).tap(log("loaded flac metadata"))
 }
 var f =new taglib.File(path);
 return most.fromPromise(new Promise((resolve) => f.readTaglibMetadata((res) => {
  //  availableMetadataExtractor.push(extractMetadata);
   res = Imm.fromJS(res);
   if (!res.get("metadata"))
    res = res.set("metadata", Imm.fromJS({}));
  //  console.log("got metadata",res.toJS());
   resolve(res);
 })));
};

const majorMinorFormat = (m) => {
  if (!m)
    return "";
  if (m.slice(0,3) === "maj")
    return "";
  if (m.slice(0,3) === "min")
    return "m";
  return m || "";  
  };




const keyRegEx = /^\s*([A-G])(#|B)?\s?((?:maj|min)(?:or)?|(?:m))?\b.*/i;

const camelotRegEx =  /^\s*((?:1[0-2]|[1-9])(?:a|b))\b.*/i;

const openKeyRegEx =  /^\s*((?:1[0-2]|[1-9])(?:d|m))\b.*/i;

const camelotToKey = { 
 "11b":"A",
 "8a":"Am",
 "6b":"A#",
 "3a":"A#m",
 "1b":"B",
 "10a":"Bm",
 "8b":"C",
 "5a":"Cm",
 "3b":"C#",
 "12a":"C#m",
 "10b":"D",
 "7a":"Dm",
 "5b":"D#",
 "2a":"D#m",
 "12b":"E",
 "9a":"Em",
 "7b":"F",
 "4a":"Fm",
 "2b":"F#",
 "11a":"F#m",
 "9b":"G",
 "6a":"Gm",
 "4b":"G#",
 "1a":"G#m"
}

const openKeyToKey = { 
 "4d":"A",
 "1m":"Am",
 "11d":"A#",
 "8m":"A#m",
 "6d":"B",
 "3m":"Bm",
 "1d":"C",
 "10d":"Cm",
 "8d":"C#",
 "5m":"C#m",
 "3d":"D",
 "12m":"Dm",
 "10d":"D#",
 "7m":"D#m",
 "5d":"E",
 "2m":"Em",
 "12d":"F",
 "9m":"Fm",
 "7d":"F#",
 "4m":"F#m",
 "2d":"G",
 "11m":"Gm",
 "9d":"G#",
 "6m":"G#m"
}

const doNormalization = (keyString) => 
                 keyRegEx.test(keyString) ? 
                 keyString.toLowerCase().replace(
                  keyRegEx, 
                   (_,keyName, flatOrSharp, majorMinor) => `${(keyName||"").toUpperCase()}${(flatOrSharp||"")}${majorMinorFormat(majorMinor)}`
                 ) 
                 
                 :
                 
                 (camelotRegEx.test(keyString) ? keyString.toLowerCase().replace(camelotRegEx, 
                 (_, camelotNotation) => `${camelotToKey[camelotNotation]}`)
                 
                 : 
                 
                 (openKeyRegEx.test(keyString) ? keyString.toLowerCase().replace(openKeyRegEx, 
                 (_, openKeyNotation) => `${openKeyToKey[openKeyNotation]}`)
                 :null))


const normalizeKeyFormat = (data) => 
  data.updateIn(["metadata","initialkey"], 
                data.getIn(["metadata","comment"]) || "", 
                  doNormalization
                 );

const normalizeMetadata = (metadata$) => metadata$
.map(res => 
  res.updateIn(["audio","duration"],res.getIn(["audio","length"],1)*1000, (duration) => duration / 1000)
)
.map(normalizeKeyFormat)
.tap(log("normalized key format"))
;



// var promiseGen = toTagStream.map(f =>);44

// var availableMetadataExtractor = Subject(extractMetadata);

// var extractMetadataStreamIn = Subject();



// var extractedMetadata = extractMetadataStreamIn.zip((file, extractor) => new Promise(resolve => extractor(file,resolve)), availableMetadataExtractor).await();

// var metadataStream = fetchOrProcess(toTagStream.map(f =>f[0]), extractMetadata);


import extractWarpMarkers from "../transforms/extractWarpMarkers";



console.log("helllooo");
// finder.startSearch();




import {registerTransform, transforms} from "../api/audioMetadataGenerator";

import {overviewWaveform} from "./thomashWarpWaveform";

import audiobufferPeaks from "./audioBuffer2Peaks";

import "../transforms/streamingAudioToWaveform";

registerTransform({name:"pathStat", depends:["path"], transform: (path) => Imm.fromJS(JSON.parse(JSON.stringify(fs.statSync(path))))});

registerTransform({name: "audioAndId3Metadata", depends:["path","audioStream"], transform: 
    (path,as)=> 
    
    normalizeMetadata(extractMetadata(path))
    .map(a=>
    {
    console.log("ais",a.toJS());

    return a.updateIn(["audio"],audio=> {
        if (audio===null)
            audio = Imm.Map();
        // console.log("updating in",audio,as);
        return audio
        .update("duration",(duration) => duration > 0 ? duration: as.duration)
        .update("samplerate",(samplerate) => samplerate > 0 ? samplerate: as.sampleRate);
     })
    
    })
     
 });

// registerTransform({name: "waveformRange", depends:[], transform: waveform});


registerTransform({name: "audioMetadata", depends:["audioAndId3Metadata"], transform: (m) => m.get("audio") });
registerTransform({name: "id3Metadata", depends:["audioAndId3Metadata"], transform: m=> m.get("metadata") });

registerTransform({name: "warpMarkers", depends:["path","audioMetadata"], transform: extractWarpMarkers });

// registerTransform({name: "overviewWaveform", depends:["path","audioMetadata","id3Metadata","warpMarkers"], transform: overviewWaveform });


console.log("transforms",transforms["path"]);


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
