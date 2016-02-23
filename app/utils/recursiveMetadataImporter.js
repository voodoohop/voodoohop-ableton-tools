
import Imm from "immutable";
import actionStream from "../api/actionSubject";

import "../transforms/vampMetadata.js";

import fs from "fs";

import log from "../utils/streamLog";
import most from "most";


var taglib = require("thomash-node-audio-metadata");

var filewalker = require('filewalker');
// require("node-find-files");


var extensions=".mp3,.m4a,.mp4,.aif,.aiff,.wav".split(",");

import metadataStore from "../store/metadataStore";
  //  .drain();  



metadataStore.take(1).observe(storedMetadata=>{

var finder = filewalker("/Users/thomash/Documents/organised/electronica",{maxPending:-1});

actionStream.filter(a => a.get("type")==="sendMeMore").observe(finder.resume);

    // storedMetadata = storedMetadata[1];
    console.log("stored before",storedMetadata);
var toTagStream = most.fromEvent("file", finder)
.tap(log("fileEvent"))
  .filter(([path]) => (extensions.reduce((hasExtension, ext) => path.toLowerCase().endsWith(ext) || hasExtension, false)))
  .filter(([filename,stats,path]) => !storedMetadata.has(path))
   
 actionStream.plug(toTagStream.filter(path=>fs.existsSync(path[2]+".asd"))
.bufferedThrottle(500)
.map(path => Imm.Map({path:path[2], type:"loadMetadata"})) 
// .tap(console.log.bind(console))  
// .tap(finder.pause)
)
finder.walk(); 

});

