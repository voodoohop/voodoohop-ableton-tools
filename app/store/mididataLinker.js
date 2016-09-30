

import actionStream from "../api/actionSubject";

import Immutable from "immutable";

import {from as mostFrom} from "most";
// import {midiClipStore} from ".";

export function generateMidiMergeEventHack(finalState) {
    actionStream.plug(
    finalState.flatMap(s => mostFrom(
    s.get("tracks").toArray()
    .filter(t => t.get("midiData") && t.get("fileData") && !t.getIn(["fileData","midiMetadata"]))
    .map(t => Immutable.Map({
        type:"mergeMetadata",   
        data:Immutable.Map({midiMetadata: t.get("midiData")}), 
        path: t.getIn(["fileData","path"])}))
)))
}
;


export var midiClipStoreLinker= (midiClipStore) => actionStream
    .filter(a => a.get("type") === "endDraggingTrack" && a.get("sourceId") && a.get("targetId"))
    .startWith(Immutable.Map())
    .combine((drag,mididata) => {
        
        if (drag.get("targetId") && mididata.has(drag.get("sourceId"))) {
            console.log("mididata combining");
            return mididata.set(drag.get("targetId"),mididata.get(drag.get("sourceId"))/*.set("trackId",drag.get("targetId"))*/);
        }
        return mididata;
    },midiClipStore);

// export var liveDataLinker= (liveDataStore) => actionStream
//     .filter(a => a.get("type") === "endDraggingTrack" && a.get("sourceId") && a.get("targetId"))
//     .startWith(Immutable.Map())
//     .combine((drag,livedata) => {
        
//         if (drag.get("targetId") && li.has(drag.get("sourceId"))) {
//             console.log("mididata combining");
//             return mididata.set(drag.get("targetId"),mididata.get(drag.get("sourceId")).set("trackId",drag.get("targetId")));
//         }
//         return mididata;
//     },liveDataStore);
        
    
//  export var liveDataMidiLinker = (liveDataStore,midiClipStore) => actionStream
//     .filter(a => a.get("type") === "endDraggingTrack" && a.get("sourceId") && a.get("targetId"))
//     .startWith(Immutable.Map())
//     .combine((drag,mididata,liveData) => {
        
//         if (drag.get("targetId") && mididata.has(drag.get("sourceId"))) {
//             console.log("mididata combining");
//             return liveData.setIn([drag.get("targetId"),"midiMetadata"],mididata.get(drag.get("sourceId")).set("trackId",drag.get("targetId")));
//         }
//         return mididata;
//     },midiClipStore, liveDataStore);
    
    
 