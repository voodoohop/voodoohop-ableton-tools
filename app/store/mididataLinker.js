

import actionStream from "../api/actionSubject";

import Immutable from "immutable";
// import {midiClipStore} from ".";

export default midiClipStore => actionStream
    .filter(a => a.get("type") === "endDraggingTrack" && a.get("sourceId") && a.get("targetId"))
    .startWith(Immutable.Map())
    .combine((drag,mididata) => {
        
        if (drag.get("targetId") && mididata.has(drag.get("sourceId"))) {
            console.log("mididata combining");
            return mididata.set(drag.get("targetId"),mididata.get(drag.get("sourceId")).set("trackId",drag.get("targetId")));
        }
        return mididata;
    },midiClipStore);