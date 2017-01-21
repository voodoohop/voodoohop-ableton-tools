import * as most from 'most';

import Immutable from "immutable";

// import {createStore} from "./appStore"; import {oscInputStream} from
// "../utils/oscInOut";

import log from "../utils/streamLog";

// import {clickedLoopCommands} from "./oscOutputStore";

import liveDataPrepped from "./livedataPrepper";

const liveDataModified =
  // groupedTracksApplier(

  liveDataPrepped
    .tap(log("newLiveData"))
    .scan((store, newData) =>

      // newData.get("type") === "id" && newData.get("trackId") === "selectedClip"
      // ? store.update(newData.get("trackId"), () => Immutable.Map({
      //   id: newData.get("value")
      // })) : 
      newData.get("type") === "id" ? store.set(newData.get("trackId"), Immutable.Map({ id: newData.get("value"), trackId: newData.get("trackId") })) :
        store.setIn([newData.get("trackId"), newData.get("type")], newData.get("value"))
          .updateIn([
            newData.get("trackId"),
            "trackId"
          ], (t) => newData.get("trackId"))
          .updateIn([
            newData.get("trackId"),
            "gain"
          ], (t) => t || 0.4), Immutable.Map())
    .skip(1)
    .throttledDebounce(50)
    .map(m => m.sortBy((v, k) => k, (k1, k2) => ("" + k1).localeCompare("" + k2)))
    .map(tracks => tracks.map((v, trackId) => v.set("isSelected", v.get("id") && v.get("id") === tracks.getIn(["selectedClip", "id"]))))
    .map(m => m.update("selectedClip", s => s
      ? (m.find((v, trackId) => trackId !== "selectedClip" && v.get("id") === s.get("id"))
        ? s.set("selectedClipAlreadyDisplayed", true).set("playingPosition", 0)
        : s.set("playingPosition", 0))
      : s))
    .tap(log("liveDataModifiedStore"))
// .map(m => m.filter(t => t.get("id") >= 0))

export default liveDataModified.multicast();
