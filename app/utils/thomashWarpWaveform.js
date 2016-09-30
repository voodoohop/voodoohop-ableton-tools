import {iterate as mostIterate} from "most";

var self2 = this;
import asyncjs from "async";
// var Promise = require("promise").Promise;
import Imm from "immutable";
// inlets = 1;
// outlets = 2;
//var bucketSize=256;
exports.waveformData = (range, audioBuffer) => {
};
exports.overviewWaveform = (metadataStream) => metadataStream
    // .tap(streamLogger("metaDataFoRWaveform2"))
    .map(metadata => {
    var audioBuffName = metadata.get("audioBufferName");
    var resolve = null;
    var warpResolve = (res) => resolve(Imm.fromJS(res));
    //  most.startWith(metadata.get("warpMarkers"))
    return metadata.set("overviewWaveform", mostIterate(warpMarkerResult => {
        // post("\n\n\n\niterating...",JSON.stringify(warpMarkerResult), typeof warpMarkerResult,"\n");
        // first time we evaluate the promise that gives us the warp markers
        if (warpMarkerResult.stream)
            return warpMarkerResult.stream.take(1).reduce((p, n) => n, null);
        // post ("going forward",warpMarkerResult instanceof Promise,"\n\n\n");
        var metadataWithWarpMarkers = metadata.merge(warpMarkerResult);
        return new Promise(newResolve => {
            if (resolve === null) {
                resolve = newResolve;
                var beatsPerBucket = (metadataWithWarpMarkers.get("durationBeats") / 2048);
                var durationBeats = metadataWithWarpMarkers.get("durationBeats");
                warpToBeats(warpResolve, audioBuffName, warpMarkerResult.get("warpMarkers"), beatsPerBucket);
            }
            else
                resolve = newResolve;
            //post("calling warptobeats",metadata.toString(),"\n");      
        });
    }, { stream: metadata.get("warpMarkersStream") }).skip(1).takeWhile(n => !n.get("done")) //.tap(n=>post("got",JSON.stringify(n.get("done")),"\n"))
    );
});
// function overviewWaveform(descriptor,name) {
// 	if (descriptor !== "dictionary")
// 		post("expecting dictionary type, ERROR!\n");
// 	post("generating warped waveform for dict",name,"\n");
// 	var dict = new Dict(name);
// 	var cached = dict.get("metaData::overviewWaveform");
// 	var audioBuffName =dict.get("maxAudioBufferName");
// 	var beatsPerBucket = (dict.get("metaData::durationBeats")/2048);
// 	var durationBeats = dict.get("metaData::durationBeats");
// 	if (cached) {
// 		outlet(1,["dictionary",dict.name]);
// 		//for (var i=0;i<cached.length;i++) {
// 		outlet(0, audioBuffName, 0, durationBeats, dict.get("color"),cached);			
// 		//}
// 	} else
// 	warpToBeats(function(res,done) {
// 		if (done) {
// 			dict.set("metaData::overviewWaveform",res.waveformData);
// 			outlet(1,["dictionary",dict.name]);
// 		} else {
// 			//outlet(0, name, waveformOutStart,beatsPerBucket,beatEnd-beatStart, waveformOut);
// 		//	post("outputting,", JSON.stringify(res),"\n");
// 		  	outlet(0, dict.name, res.beatStart,res.beatsPerBucket,res.durationBeats, dict.get("color"),res.waveformData);
// 		}
// 	}.bind(this),audioBuffName,dict.getIn(["metaData","warpMarkers"]),beatsPerBucket);
// }
var currentBuff = null;
var readBuf = null;
function warpToBeats(mainCallback, name, warpMarkersDict, beatsPerBucket, beatStartIn, beatEndIn) {
    var bucketSizeBeats = 1 / beatsPerBucket;
    var beatStart = beatStartIn || 0;
    if (currentBuff != name || readBuf == null)
        readBuf = new Buffer(name);
    currentBuff = name;
    Postln("reading buffer", name, readBuf.length(), readBuf.channelcount());
    var startTime = (new Date().getTime());
    //var sampleBuf=readBuf.peek(1,0, readBuf.framecount()-1);
    // var readSampleFunc = readBuf.peek;
    //  readSampleFunc = function(c,pos) {
    //	return sampleBuf[pos];
    //  }
    var warpMarkers = warpMarkersDict.toJS();
    var markerKeys = Object.keys(warpMarkers);
    var beatEnd = beatEndIn || warpMarkers[markerKeys[markerKeys.length - 1]].beats;
    post("processing markers", markerKeys, "beat start", beatStart, "beat end", beatEnd, " ", bucketSizeBeats, "\n");
    var downSample = Math.ceil((beatEnd - beatStart) / 30);
    post("downsampling", downSample, "\n");
    var res = [];
    var configs = [{
            channel: 1
        }];
    //var inSamples = readBuf.peek(/*config.channel*/1, 0, readBuf.framecount() - 1);
    Postln("scheduling", (new Date().getTime()) - startTime);
    //outlet(1, [name,1]);
    var readStartSamples = null, readEndSamples = null, readPosSamples = null, writePosBeats = null;
    asyncjs.eachSeries(configs, function (config, cb) {
        Postln("config nownow:", (new Date().getTime()) - startTime, config.channel);
        var bucketMin = 999;
        var bucketMax = -999;
        forEachAsync(markerKeys, function (markerKey, i, markerKeys, next) {
            Postln("processing", markerKey, "\n");
            if (i >= markerKeys.length - 1) {
                next();
                return;
            }
            var marker = warpMarkers[markerKey];
            var nextMarker = warpMarkers[markerKeys[i + 1]];
            if (beatStart > nextMarker.beats || beatEnd < marker.beats) {
                next();
                return;
            }
            if (readStartSamples == null && beatStart >= marker.beats) {
                readStartSamples = (beatStart - marker.beats) * marker.samplesPerBeat + marker.sourcetimesample;
            }
            if (readEndSamples == null && beatEnd >= marker.beats) {
                readEndSamples = (beatEnd - marker.beats) * marker.samplesPerBeat;
            }
            post("readStartSamples", readStartSamples, "marker", JSON.stringify(marker), "\n");
            if (readStartSamples == null) {
                next();
                return;
            }
            var samplesSinceBucketStart = null;
            if (readPosSamples == null) {
                readPosSamples = readStartSamples;
                writePosBeats = beatStart;
                samplesSinceBucketStart = 0;
            }
            //post("readPosSamples < nextMarker.sourcetimesample && writePosBeats < nextMarker.beats", readPosSamples < nextMarker.sourcetimesample && writePosBeats < nextMarker.beat, readPosSamples,nextMarker.sourcetimesample,writePosBeats,nextMarker.beats, currentBuf,"\n");
            ///var writePosBeats = marker.beats/bucketSize;
            asyncjs.whilst(function () { return (readPosSamples < nextMarker.sourcetimesample && writePosBeats < nextMarker.beats); }, function (callback) {
                var batch = 5;
                var waveformOut = [];
                var waveformOutStart = -1;
                while (readPosSamples < nextMarker.sourcetimesample && writePosBeats < nextMarker.beats && batch > 0) {
                    var sampleAmp = readPosSamples >= 0 ? Math.abs(readBuf.peek(1, Math.round(readPosSamples))) : 0;
                    //			if (sample < bucketMin)
                    //             bucketMin = sample;// (bucketMin == 999) ? sample : sample * (1 - config.peakSmoothing) + (config.peakSmoothing * bucketMin);
                    if (sampleAmp > bucketMax)
                        bucketMax = sampleAmp; //(bucketMax == -999) ? sample : sample * (1 - config.peakSmoothing) + (config.peakSmoothing * bucketMax);
                    readPosSamples += downSample;
                    var newWritePosBeats = writePosBeats + (downSample / marker.samplesPerBeat);
                    if (Math.floor((newWritePosBeats - beatStart) * bucketSizeBeats) > Math.floor((writePosBeats - beatStart) * bucketSizeBeats)) {
                        waveformOut.push(bucketMax);
                        if (waveformOutStart === -1)
                            waveformOutStart = newWritePosBeats;
                        res.push(bucketMax);
                        if (batch % 104 == 20) {
                            post("readPosSamples", readPosSamples, sampleAmp, newWritePosBeats, "\n");
                            post("writePosBeats", writePosBeats, bucketMax, "\n");
                        }
                        //bucketMin = 999;
                        bucketMax = -999;
                        batch--;
                    }
                    writePosBeats = newWritePosBeats;
                }
                ;
                if (waveformOutStart !== -1) {
                    // post("sending waceformData2", res.length,"\n\n\n");
                    mainCallback({ waveformData: waveformOut, beatStart: waveformOutStart, beatsPerBucket: beatsPerBucket, durationBeats: beatEnd - beatStart, done: false });
                }
                asyncjs.setImmediate(callback);
            }, function () {
                next();
            });
        }, function () {
            Postln("time elapsed, warping:", (new Date().getTime()) - startTime);
            cb();
        });
    }, function () {
        //     	outlet(1, [name,0]);
        post("sending waceformData", res.length, "\n\n\n");
        mainCallback({ waveformData: res, beatStart: beatStart, durationBeats: beatEnd - beatStart, beatsPerBucket: beatsPerBucket, done: true });
    });
    Postln("should repeat now");
    Postln("time elapsed just after scheduling:", (new Date().getTime()) - startTime);
}
//# sourceMappingURL=thomashWarpWaveform.js.map