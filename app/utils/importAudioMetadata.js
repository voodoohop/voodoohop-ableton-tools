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

import AV from 'av';


import 'flac.js';
// var filewalker = require('filewalker');
// require("node-find-files");


var extensions = ".mp3,.m4a,.mp4,.aif,.aiff,.wav".split(",");

// var finder = filewalker("/Users/thomash/Documents/organised/electronica",{maxPending:-1});

var mm = require('musicmetadata');

const extractMetadata = path => {
  console.log("extracting metadata", path);

  if (path.toLowerCase().indexOf(".flac") > 0) {

    var flacData = fs.readFileSync(path);
    return most.fromPromise(new Promise((resolve, reject) => {
      var asset = AV.Asset.fromBuffer(flacData);
      asset.get("duration", duration => {
        asset.get("metadata", metadata => {
          asset.get("format", audio => {
            console.log("flac audio format", audio);
            resolve(Imm.Map({
              metadata: Imm.fromJS(metadata), audio: Imm.fromJS(audio).mapKeys(k => k.toLowerCase().replace("channelsperframe", "channels"))
                .set("duration", duration).set("length", Math.round(duration / 1000))
            }))
          })
        });
      })
    })).tap(log("loaded flac metadata"))
  }
  console.log("initializing taglib");
  var f = new taglib.File(path);
  return most.fromPromise(new Promise((resolve) => f.readTaglibMetadata((res) => {
    //  availableMetadataExtractor.push(extractMetadata);
    res = Imm.fromJS(res);
    if (!res.get("metadata"))
      res = res.set("metadata", Imm.fromJS({}));
    log("got metadata")(res);
    resolve(res);
  })));
};

const majorMinorFormat = (m) => {
  if (!m)
    return "";
  if (m.slice(0, 3) === "maj")
    return "";
  if (m.slice(0, 3) === "min")
    return "m";
  return m || "";
};




const keyRegEx = /\b\s*([A-G])(#|B)?\s?((?:maj|min)(?:or)?|(?:m))?\b.*/i;

const camelotRegEx = /\b\s*((?:1[0-2]|[1-9])(?:a|b))\b.*/i;

const openKeyRegEx = /\b\s*((?:1[0-2]|[1-9])(?:d|m))\b.*/i;

// const keyRegEx_filename = /\b\s*([A-G])(#|B)?\s?((?:maj|min)(?:or)?|(?:m))?\b.*/i;

// const camelotRegEx_filename =  /\b\s*((?:1[0-2]|[1-9])(?:a|b))\b.*/i;

// const openKeyRegEx_filename =  /\b\s*((?:1[0-2]|[1-9])(?:d|m))\b.*/i;
import { camelotToKey, openKeyToKey } from "../api/openKeySequence";


const doKeyNormalize = ([_, keyName, flatOrSharp, majorMinor]) => `${(keyName || "").toUpperCase()}${(flatOrSharp || "")}${majorMinorFormat(majorMinor)}`

const normalize = (keyString, keyRegEx, camelotRegEx, openKeyRegEx) =>
  keyRegEx.test(keyString) ?
    doKeyNormalize(keyString.toLowerCase().match(keyRegEx))
    :
    camelotRegEx.test(keyString) ?
      camelotToKey[keyString.toLowerCase().match(camelotRegEx)[1]]
      : (
        (openKeyRegEx.test(keyString) ? openKeyToKey[keyString.toLowerCase().match(openKeyRegEx)[1]]
          : undefined));

const doNormalization = (possibleKeyString) => normalize(possibleKeyString, keyRegEx, camelotRegEx, openKeyRegEx);

// const doNormalization_filename = (possibleKeyString) => normalize(possibleKeyString, keyRegEx_filename, camelotRegEx_filename, openKeyRegEx_filename);

const normalizeKeyFormat = (data, path) => {
  // console.log("trying to update ",data, data.getIn(["metadata","initialkey"]));
  const id3Tried =
    data.updateIn(["metadata", "initialkey"],
      data.getIn(["metadata", "key"], data.getIn(["metadata", "comment"]) || ""),
      doNormalization
    )
      .update("metadata", md => md.filter((v, k) => v !== undefined));
  // console.log("after try ",id3Tried.getIn(["metadata","initialkey"]));  
  const filename = path.split("/").reverse()[0].toLowerCase();
  console.log("trying to extract metadata from filename", filename, doNormalization(filename));
  return id3Tried.updateIn(["metadata", "initialkey"], (before) => before || doNormalization(filename));
}



const normalizeMetadata = (metadata$, path) => metadata$
  // .tap(log("before normalizing metadata"))
  .map(res =>
    res.updateIn(["audio", "duration"], res.getIn(["audio", "length"], 1) * 1000, (duration) => duration / 1000)
  )
  // .tap(log("after normalizing duration"))
  .map(data => normalizeKeyFormat(data, path))
  .tap(log("normalized key format"))
  ;



// var promiseGen = toTagStream.map(f =>);44

// var availableMetadataExtractor = Subject(extractMetadata);

// var extractMetadataStreamIn = Subject();



// var extractedMetadata = extractMetadataStreamIn.zip((file, extractor) => new Promise(resolve => extractor(file,resolve)), availableMetadataExtractor).await();

// var metadataStream = fetchOrProcess(toTagStream.map(f =>f[0]), extractMetadata);


import extractWarpMarkers from "../transforms/extractWarpMarkers";

import { registerTransform, transforms } from "../transforms/audioMetadataGenerator";

import { overviewWaveform } from "./thomashWarpWaveform";

import "../transforms/streamingAudioToWaveform";

registerTransform({ name: "pathStat", depends: ["path"], transform: (path) => Imm.fromJS(JSON.parse(JSON.stringify(fs.statSync(path)))) });

registerTransform({
  name: "audioAndId3Metadata", depends: ["path", "audioStream"], transform:
  (path, as) =>
    normalizeMetadata(extractMetadata(path), path)
      .map(a => {
        log("ais")(a, as);

        return a.updateIn(["audio"], audio => {
          if (audio === null)
            audio = Imm.Map();
          // console.log("updating in",audio,as);
          return audio
            .update("duration", (duration) => as.duration || duration)
            .update("length", (duration) => as.duration || duration)
            .update("samplerate", (samplerate) => samplerate > 0 ? samplerate : as.sampleRate);
        })

      })

});

// registerTransform({name: "waveformRange", depends:[], transform: waveform});


registerTransform({ name: "audioMetadata", depends: ["audioAndId3Metadata"], transform: (m) => m.get("audio") });
registerTransform({ name: "id3Metadata", depends: ["audioAndId3Metadata"], transform: m => m.get("metadata") });

registerTransform({ name: "warpMarkers", depends: ["path", "audioAndId3Metadata"], transform: extractWarpMarkers });

// registerTransform({name: "overviewWaveform", depends:["path","audioMetadata","id3Metadata","warpMarkers"], transform: overviewWaveform });


console.log("transforms", transforms["path"]);


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
