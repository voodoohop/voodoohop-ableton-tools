import most from "most";

import Immutable from "immutable";

// import {createStore} from "./appStore";

// import {oscInputStream} from "../utils/oscInOut";

import log from "../utils/streamLog";

import {oscInputStream} from "../utils/oscInOut";


// import {midiClipStore} from ".";

// import {liveDataMidiLinker} from "./mididataLinker";


var oscInput= oscInputStream	
		.filter(f => f[2] === "playingClip" && f[1]>=0)
		.map(f => Immutable.fromJS({type: "liveDataInput", trackId: f[1], data: f.slice(3)}));

		
actionStream.plug(oscInput);


import actionStream from "../api/actionSubject";

// import {clickedLoopCommands} from "./oscOutputStore";

import liveDataPrepped from "./livedataPrepper";

import groupedTracksApplier from "./groupedTracksApplier";



    
// export var liveDataInAbleton =  liveDataPrepped.scan((store,newData)=> 

//                 store.setIn([newData.get("trackId"),newData.get("type")],newData.get("value"))
//                     .updateIn([newData.get("trackId"),"trackId"],(t) => newData.get("trackId"))
// , Immutable.Map()).skip(1);

var liveDataModified = 
// groupedTracksApplier(

            liveDataPrepped
          
            .scan((store,newData) => 
                
                store.setIn([newData.get("trackId"),newData.get("type")],newData.get("value"))
                    .updateIn([newData.get("trackId"),"trackId"],(t) => newData.get("trackId"))
                    .updateIn([newData.get("trackId"),"gain"],(t) => t || 0.4)

            ,Immutable.Map()).skip(1).throttledDebounce(100)
        

// actionStream.plug(liveDataPrepped.tap(log("liveDataPrepped")).filter(d => d.get("type")==="file_path").map(d=> Immutable.Map({type:"loadMetadata", path: d.get("value")})));




export default liveDataModified.multicast();
