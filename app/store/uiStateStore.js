import Immutable from "immutable";


import actionStream from "../api/actionSubject";


import { oscInputStream } from "../utils/oscInOut";

import logger from "../utils/streamLog";

// oscInputStream.


var oscControlInput = oscInputStream.filter(f => f[0] === "control").map(f => Immutable.fromJS({ type: f[1], value: f[2] }))
    .tap(f => console.log("oscControl", f));

actionStream.plug(oscControlInput);

var visibleBeatsZoomedOut = 1024;

var initialState = Immutable.Map({
    visibleBeats: visibleBeatsZoomedOut / 2,
    keyNotation: "trad",
    visible: true
});

var toggle = (set, member) => set.contains(member) ? set.remove(member) : set.add(member);

export default actionStream//.filter(a=> a.get("type") === "globalZoom" || a.get("type") === "groupButtonClicked")

    .scan((store, input) => {
        // input.get("trackId") ? store.mergeIn([input.get("trackId")], input) : 
        // store.set(input.get("type"), input.get("value"))
        switch (input.get("type")) {
            case "visibility":
                return store.set("visible", input.get("value") == 1);
            case "masterTempo":
                return store.set("masterTempo", input.get("value"));
            case "keyNotation":
                return store.set("keyNotation", input.get("value"));
            case "updateClipNames":
                return store.setIn(["clipUpdate", "name"], input.get("value") != 0);
            case "updateClipColors":
                return store.setIn(["clipUpdate", "color"], input.get("value") != 0);
            case "globalZoom":
                return store.set("visibleBeats", input.get("value") * (visibleBeatsZoomedOut - 4) + 4);
            case "hoverDraggingTrack":
                // if (input.get(""))
                return store.setIn(["dragState", "hover"], input);
            case "endDraggingTrack":
                // console.log("removing");
                return store.remove("dragState");
            case "loadMetadata":
                return store.set("lastMetadataLoad", input.get("path"));
            case "metadataLoaded":
                return store.set("lastMetadata", input.get("metadata"));
            case "cpuUsageUpdate":
                return store.setIn(["cpuUsage", input.get("process")], input.get("usage"));
            case "containerHeightChanged":
                return store.set("componentHeight", input.get("value"));
            default:
                return store;
        }
    }
    , initialState).startWith(initialState)
    .skipImmRepeats()
    .tap(logger("uiState"));