import most from "most";

import Immutable from "immutable";

// import {createStore} from "./appStore";

// import {oscInputStream} from "../utils/oscInOut";

import throttledDebounce from "../utils/throttledDebounce";

import log from "../utils/streamLog";

import {oscInputStream} from "../utils/oscInOut";

var oscInput= oscInputStream	
		.filter(f => f[2] === "playingClip" && f[1]>=0)
		.map(f => Immutable.fromJS({type: "liveDataInput", trackId: f[1], data: f.slice(3)}));

		
actionStream.plug(oscInput);


import actionStream from "../api/actionSubject";

// import {clickedLoopCommands} from "./oscOutputStore";

import liveDataPrepped from "./livedataPrepper";

import groupedTracksApplier from "./groupedTracksApplier";



var clickedLoopAction = 
actionStream.tap(log("actionStream")).filter(a => a.get("type") === "clickedBeat");

export var clickedLoopCommands = clickedLoopAction.flatMap(action=>
	{	
		// console.log("tracks",tracks.toJS());
    	var commands=		
		[
			["looping",1],
			["loop_start",Math.floor(action.get("beat")/16)*16], 
			["loop_end",(Math.floor(action.get("beat")/16)+1)*16]
		];
		return most.from(commands.map(c=>Immutable.Map({trackId: Number(action.get("trackId")), type: c[0], value:c[1]})));// tracks.update(action.get("trackId"), track => commands.reduce((track, command) => track.set(command[0], command[1]), track))
	}).tap(log("clickedLoopCommands"));
    
    
export var liveDataInAbleton =  liveDataPrepped.scan((store,newData)=> 

                store.setIn([newData.get("trackId"),newData.get("type")],newData.get("value"))
                    .updateIn([newData.get("trackId"),"trackId"],(t) => newData.get("trackId"))
, Immutable.Map()).skip(1);

var liveDataModified = 
// groupedTracksApplier(
        throttledDebounce(50,
            liveDataPrepped
            .merge(clickedLoopCommands)
            .scan((store,newData) => 
                store.setIn([newData.get("trackId"),newData.get("type")],newData.get("value"))
                    .updateIn([newData.get("trackId"),"trackId"],(t) => newData.get("trackId"))
            ,Immutable.Map()).skip(1)
            );

export default liveDataModified.multicast();
