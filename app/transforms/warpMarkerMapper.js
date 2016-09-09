import * as most from 'most';

import Immutable from "immutable"

import log from "../utils/streamLog";

export function warpMarkerMap(timeStream, warpMarkerStream) {
	var twoMarkers=warpMarkerStream.map(f=>f.toJS()).zip((prev,next) => [prev,next],warpMarkerStream.map(f=>f.toJS()).skip(1));
	// twoMarkers.observe(t=> console.log("two",t));
	return most.concat(
		twoMarkers.take(1).map(m => timeStream.takeWhile(t => t < m[0].sourcetime).map(t => (m[1].desttime-m[0].desttime) /(t - m[0].sourcetime)*t+m[0].desttime))
		,
		(twoMarkers.loop((timeRemaining,markers) => {
		var skipBeforeFirstMarker=timeRemaining.skipWhile(t => t<markers[0].sourcetime);
		return {
			seed: skipBeforeFirstMarker,
			value: {
					time: skipBeforeFirstMarker.takeWhile(t => t<markers[1].sourcetime),
					markers: markers
					}		
			};
		}, timeStream).map(n => n.time.map(t => {
			let markers = n.markers;
			return markers[0].desttime + (markers[1].desttime - markers[0].desttime)*((t - markers[0].sourcetime)/(markers[1].sourcetime-markers[0].sourcetime));
		})))).tap(log("warpConcat")).flatMap(t=>t).tap(log("warpConcat2"));	
}

export function warpMarkerReverseMap(warpMarkerStream) {
	return (destTimeStream) =>
			warpMarkerMap(destTimeStream, warpMarkerStream.map(wm => Immutable.Map({desttime: wm.get("sourcetime"), sourcetime: wm.get("desttime")})));
}

export function warpMarkerBeatMap(warpMarkerStream) {
	return (beatStream) =>
			warpMarkerMap(beatStream, warpMarkerStream.map(wm => Immutable.Map({desttime: wm.get("beats"), sourcetime: wm.get("sourcetime")})));
}

export function timeToBeatWarper(warpmarkers) {
	return (timeStream) => warpMarkerMap(timeStream.map(t=> t*1000), most.from(warpmarkers.get("warpMarkers").toArray() || []))
		.map(warpedTime => warpmarkers.get("baseBpm")*warpedTime/60000);
}

