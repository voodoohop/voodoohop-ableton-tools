
//if (false) {


// autowatch = 1;
// post("heybabel67\n");
// include("utils.js");
// var self2= this;

var Imm = require("immutable");
var fs = require("fs");

var post = console.log.bind(console);
// var Promise = require("promise").Promise;
//post("Promise");
// po st("tomtom");
//var most = require("most.js");
//var Ppprom = promise;
function extractWarpMarkers(path, audioMetaData) {
  //console.log("simpleExtractWarpMarkers received dict name", dict.name, "\n");
  //var clipDict = new Dict(dictName);
  return new Promise((resolveMe,reject) => {

  post("possst extracting warp markers", path, audioMetaData.toString(), "\n");
  var duration = audioMetaData.get("duration") * 1000 + 1000;//get("duration");
  var samprate = audioMetaData.get("samplerate");//get("samplingRate");

  var lastMarkerPos = -1;

  var filename = path + ".asd";
  // post(filename + "\n");
  //length--; // to stop from reading after sample end

  var startTime = new Date().getTime();
  post("filename:" + filename, "\n");
  post("length:", duration, "\n");
  // var f = new File(filename);
    if (!fs.existsSync(filename))
      reject("file "+filename+" does not exist");
    else
    fs.readFile(filename, (err, buffer) => {
      // post("error,buf",err,buffer);
      var position = 0;
      // f.byteorder = "little";
      var markerNo = 0;
      var fname = filename;
      var chunksize = buffer.length;
      var tsk;
      var markersArr = [];
      var lastMarker;
 
      //var chunk=0;
      // while (position < buffer.length) {
        //outlet(3, f.position);
        var prevPos = position;
        // var str = buffer.toString();
        // position += chunksize;
        var offset=0;
      var index=0;
        while ((index = buffer.indexOf("WarpMarker",index)) >= 0) {
        if (index >= 0) {
          offset += index;
          index = index + "WarpMarker".length + 4;
          console.log("pos",index);
          // lastMarkerPos = posNumber + prevPos;
          
          //f.readbytes(4);
          var pos = [buffer.readDoubleLE(index), buffer.readDoubleLE(index + 8)];
          // position += 16;
          
          post("found warp marker at", index+" " + pos[0] + "," + pos[1] + "," + "\n");
          if (pos[0] < duration)
          markersArr.push({
            beats: pos[1],
            ms: pos[0] * 1000
          })
          else
            console.error("bad marker position (larger than duration encountered)", pos[0],pos[1],filename);
          }
        }
        // else
        //   position = prevPos + chunksize - 10;
      // }

      if (markersArr.length == 0) {
        // post("NO MARKERS FOUND... PRESS SAVE!!", filename);
        reject("warpmarkers not saved!!!");
        return;
      }

      var newMarkers = [];
      markersArr.shift(); // throw annoying marker away
      var fm = markersArr[0];
      //var tm = markersArr[2];
      var lm = markersArr[markersArr.length - 1];
      var lastToFirstSpeed = (lm.beats - fm.beats) / (lm.ms - fm.ms);
      var extrapolateLastBeats = (duration - fm.ms) * lastToFirstSpeed + fm.beats;
      var refBpm = ((extrapolateLastBeats - fm.beats) / (duration - fm.ms)) * 60000;
      //refBpm=100.0;
      post("REFBPM", {refBpm, lm, fm, extrapolateLastBeats, duration, filename});
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
      var secondm = newMarkers[1];
      if (firstm.beats > 0 && firstm.sourcetime > 0) {
        //post("FM",JSON.stringify(firstm),"\n");
        var firstSpeed = firstm.bpm / 60000;
        var info2 = {
          sourcetime: firstm.sourcetime - firstm.beats / firstSpeed,
          bpm: firstm.bpm,
          beats: 0
        };
        newMarkers.unshift(info2);
      }

      newMarkers[0].desttime = newMarkers[0].beats / refBpm * 60 * 1000;
      var lm2 = newMarkers[newMarkers.length - 1];
      // lm
      var lastBpm = newMarkers[newMarkers.length - 1].bpm;
      if (lm2.sourcetime < duration) newMarkers.push({
        sourcetime: duration,
        bpm: lastBpm,
        beats: lm2.beats + (duration - lm2.sourcetime) * lastBpm / 60000
      });

      // var fm = newMarkers[0];
      // if (false) {
      //   var newMarkersInterpolated = [];
      //   newMarkersInterpolated.push(newMarkers[0]);
      //   for (var i = 1; i < newMarkers.length; i++) {
      //     var startBeat = Math.ceil(newMarkers[i - 1].beats);
      //     var endBeat = Math.floor(newMarkers[i].beats);
      //     var prevTime = newMarkers[i - 1].sourcetime;
      //     var bpmNow2:number = newMarkers[i].bpm;
      //     for (var currentBeat = startBeat; currentBeat < endBeat; currentBeat += 1) {
      //       var beatOffset = currentBeat - newMarkers[i - 1].beats;
      //       var currentTime = beatOffset / (bpmNow / 60000) + prevTime;
      //       var interpInfo = {
      //         sourcetime: <number>currentTime,
      //         bpm: bpmNow2,
      //         beats: currentBeat
      //       };
      //       newMarkersInterpolated.push(interpInfo);
      //     }
      //     newMarkersInterpolated.push(newMarkers[i]);
      //   }

      //   newMarkers = newMarkersInterpolated;
      //   post("interpolated markers", newMarkersInterpolated.length, "\n");
    
      for (var i = 1; i < newMarkers.length; i++) {
        var relSpeed = newMarkers[i - 1].bpm / refBpm;
        newMarkers[i].desttime = newMarkers[i - 1].desttime + (newMarkers[i].sourcetime - newMarkers[i - 1].sourcetime) * relSpeed;
        //Postln("calculated desttime",i,newMarkers[i].desttime);
      }

      //outlet(2, refBpm);
      var lastSourceTime = -999999999;
      var lastDestTime = -999999999;
      var destTimes = [];
      var sourceTimes = [];
      var beatss = -1;
      //for (var i = 0; i < newMarkers.length; i++) {
      var warpMarkers = Imm.fromJS(newMarkers).map(marker => {
        marker = marker.toJS();
        var destTime = marker.beats;
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
      post("time (marker extract):", new Date().getTime() - startTime);
      // outlet(1, warpMarkers.size);
      // Postln("sending dictionary content:",JSON.stringify(dict_to_jsobj(markers)));
      var res = Imm.fromJS({ warpMarkers: warpMarkers, baseBpm: refBpm, durationBeats: beatss });
      //clipDict.replace("metaData",audioMetaData);
      //outlet(0, "dictionary", audioMetaData.name);
      // f.close();
      // post("resolving",filename);
      // if (resolve) 
      resolveMe(res);
    })
  });
  // });
}

//var processingNow = false;
//post("hey from es6!!!!", );
//self = this;
// for (var k in Promise)
// 	post("keys my love", k,"\n");

//var metaDataWithWarpMarkersDict = new Dict("metaDataWithWarpMarkers");
//globalStreams.metaDataByPath.observe(v=>post(v.stringify()));
//setTimeout(function() {
// post("\nhey man, from tsts\n");
// new Promise(resolve => setTimeout(resolve, 200)).then(() => post("resolved\n\n"));
//globalStreams.metaDataByPath.observe(function(v) {/*var d = new Dict();d.parse(v);*/post("meta2",v.stringify(),"\n")}).catch(function(e) {postprops(e)});;
//   post("metameta",globalStreams.metaDataFromPlayingClips.toString(),"\n");
// if(false)

export default extractWarpMarkers;

// var pr};
