//if (false) {


// autowatch = 1;
// post("heybabel67\n");
// include("utils.js");
// var self2= this;

import Imm from "immutable";
import fs from "fs";

var post = console.log.bind(console);

import actionSubject from "../api/actionSubject";
// var Promise = require("promise").Promise;
//post("Promise");
// po st("tomtom");
//var most = require("most.js");
//var Ppprom = promise;


function getMarkersArrayFromBuffer({buffer,filename,duration}) {
  // var position = 0;
  // f.byteorder = "little";
  var markersArr = [];

  //var chunk=0;
  // while (position < buffer.length) {
  //outlet(3, f.position);
  // var prevPos = position;
  // var str = buffer.toString();
  // position += chunksize;
  var offset = 0;
  var index = 0;
  while ((index = buffer.indexOf("WarpMarker", index)) >= 0) {
    if (index >= 0) {
      offset += index;
      index = index + "WarpMarker".length + 4;
      console.log("pos", index);
      // lastMarkerPos = posNumber + prevPos;

      //f.readbytes(4);
      var pos = [buffer.readDoubleLE(index), buffer.readDoubleLE(index + 8)];
      // position += 16;

      post("found warp marker at", index + " " + pos[0] + "," + pos[1] + "," + "\n");
      if (pos[0] < duration)
        markersArr.push({
          beats: pos[1],
          ms: pos[0] * 1000
        })
      else
        console.error("bad marker position (larger than duration encountered)", pos[0], pos[1], filename);
    }
  }

  if (markersArr.length>2)
    markersArr.shift(); // throw annoying marker away

  return markersArr;
}

function extractFromBuffer({
          buffer,
          filename,
          duration,
          samprate,
          resolve,
          id3Bpm
        }) {

  

  var markersArr = buffer ? getMarkersArrayFromBuffer({buffer,filename,duration}) : [];

  console.log("markersAfter", JSON.stringify(markersArr));
  
  const noMarkersFound = markersArr.length == 0;
  
  if (noMarkersFound) {
    const useBpm = (id3Bpm && parseFloat(id3Bpm)) || 120;
    console.log("NO MARKERS FOUND... PRESS SAVE!!", filename);
    // reject("warpmarkers not saved!!!");
    markersArr = [{
        beats: 0,
        ms: 0
      }, {
        beats: duration / (1000/(useBpm/60)),
        ms: duration
      }];
      // return;
  }
  var fm = markersArr[0];
  //var tm = markersArr[2];
  var lm = markersArr[markersArr.length - 1];
  var lastToFirstSpeed = (lm.beats - fm.beats) / (lm.ms - fm.ms);
  // var extrapolateLastBeats = (duration - fm.ms) * lastToFirstSpeed + fm.beats;
  var refBpm = lastToFirstSpeed * 60000; //((extrapolateLastBeats ) / (duration )) * 60000;
  var newMarkers = [];
  //refBpm=100.0;
  // post("REFBPM", {refBpm, lm, fm, duration, filename});
  for (var i = 0; i < markersArr.length - 1; i++) {
    var bpmNow = (markersArr[i + 1].beats - markersArr[i].beats) / (markersArr[i + 1].ms - markersArr[i].ms) * 1000 * 60;
    var info = {
      sourcetime: markersArr[i].ms,
      bpm: bpmNow,
      beats: markersArr[i].beats
    }
    newMarkers.push(info);
    //Postln("info1", info);
  }
  var firstm = newMarkers[0];
  if (firstm.sourcetime > 0) {
    console.log("FirstMarker", JSON.stringify(firstm), "\n");

    var firstSpeed = firstm.bpm / 60000;
    var info2 = {
      sourcetime: 0, //firstm.sourcetime - firstm.beats / firstSpeed,
      bpm: firstm.bpm,
      beats: firstm.beats - (firstm.sourcetime * firstSpeed)
    };


    newMarkers.unshift(info2);
  }

  newMarkers[0].desttime = newMarkers[0].beats / refBpm * 60 * 1000;
  // console.log("first two markers");
  // console.table(newMarkers);
  console.log("duration",duration);
  var lm2 = newMarkers[newMarkers.length - 1];
  // lm
  var lastBpm = newMarkers[newMarkers.length - 1].bpm;
  if (lm2.sourcetime < duration) newMarkers.push({
    sourcetime: duration,
    bpm: lastBpm,
    beats: lm2.beats + (duration - lm2.sourcetime) * lastBpm / 60000
  });

  for (var i = 1; i < newMarkers.length; i++) {
    var relSpeed = newMarkers[i - 1].bpm / refBpm;
    newMarkers[i].desttime = newMarkers[i - 1].desttime + (newMarkers[i].sourcetime - newMarkers[i - 1].sourcetime) * relSpeed;
    //Postln("calculated desttime",i,newMarkers[i].desttime);
  }
  // console.log("second two markers");
  //           console.table(newMarkers);
  //outlet(2, refBpm);
  var lastSourceTime = -999999999;
  var lastDestTime = -999999999;
  var destTimes = [];
  var sourceTimes = [];
  var beatss = -1;
  //for (var i = 0; i < newMarkers.length; i++) {
  var warpMarkers = Imm.fromJS(newMarkers).map(marker => {
    marker = marker.toJS();
    if (marker.desttime < lastDestTime || marker.sourcetime < lastSourceTime)
      return null;
    lastDestTime = Math.max(lastDestTime, marker.desttime);
    lastSourceTime = Math.max(lastSourceTime, marker.sourcetime);

    beatss = marker.desttime * refBpm / 60000;

    var markerObj = Imm.Map({
      "desttime": marker.desttime,
      "sourcetime": marker.sourcetime,
      "beats": beatss,
      "playSpeed": refBpm / marker.bpm,
      "sourceBpm": marker.bpm,
      "desttimesample": Math.floor(marker.desttime * samprate / 1000),
      "sourcetimesample": Math.floor(marker.sourcetime * samprate / 1000),
      "samplesPerBeat": 1 / (marker.bpm / 60) * samprate
    });

    sourceTimes.push(marker.sourcetime / duration);
    destTimes.push(marker.desttime / duration);
    return markerObj;
  }).filter(w => w !== null);
  //console.log("time (marker extract):", new Date().getTime() - startTime);
  // outlet(1, warpMarkers.size);
  // Postln("sending dictionary content:",JSON.stringify(dict_to_jsobj(markers)));
  console.log("final warp markers",warpMarkers);
  console.table(warpMarkers.toJS());
  var res = Imm.Map({
    error: null,
    path: filename,
    pathStat: Imm.fromJS(JSON.parse(JSON.stringify(fs.statSync(filename)))),
    warpMarkers: warpMarkers,
    baseBpm: refBpm,
    durationBeats: warpMarkers.last().get("beats") - warpMarkers.first().get("beats"),
    markersSaved: !noMarkersFound
  });
  //clipDict.replace("metaData",audioMetaData);
  //outlet(0, "dictionary", audioMetaData.name);
  // f.close();
  // post("resolving",filename);
  // if (resolve) 
  console.timeEnd(`extractWarpMarkers_${filename}`);
  resolve(res);
}

export default function extractWarpMarkers(path, metadata) {
  const audioMetaData = metadata.get("audio");
  //console.log("simpleExtractWarpMarkers received dict name", dict.name, "\n");
  //var clipDict = new Dict(dictName);
  const id3Bpm = metadata.getIn(["metadata", "bpm"]) || metadata.getIn(["metadata", "tbpm"]) || metadata.getIn(["metadata", "fbpm"])
  return new Promise((resolveMe, reject) => {

      // post("possst extracting warp markers", path, audioMetaData.toString(), "\n");
      var duration = (audioMetaData.get("duration")) * 1000; //get("duration");
      var samprate = audioMetaData.get("samplerate"); //get("samplingRate");

      var filename = path + ".asd";
      // post(filename + "\n");
      //length--; // to stop from reading after sample end
      console.time(`extractWarpMarkers_${filename}`);
      // var f = new File(filename);
        fs.readFile(filename, (err, buffer) => extractFromBuffer({
          buffer,
          filename,
          duration,
          samprate,
          id3Bpm,
          resolve: resolveMe
        }));
      // });
    })
  };