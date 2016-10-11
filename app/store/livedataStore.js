import * as most from 'most';

import Immutable from "immutable";

// import {createStore} from "./appStore"; import {oscInputStream} from
// "../utils/oscInOut";

import log from "../utils/streamLog";

import { oscInputStream, oscOutput } from "../utils/oscInOut";

// import {midiClipStore} from "."; import {liveDataMidiLinker} from
// "./mididataLinker";

const oscInput = oscInputStream
  // .tap(log("preLiveDataInput"))
  .map(d => d[1] === "playingClip"
    ? [
      "list", ...d
    ]
    : d).filter(f => f[2] === "playingClip").map(f => Immutable.fromJS({
      type: "liveDataInput",
      trackId: f[1],
      data: f.slice(3)
    }));

import actionStream from "../api/actionSubject";

// import {clickedLoopCommands} from "./oscOutputStore";

import liveDataPrepped from "./livedataPrepper";

oscOutput.push(Immutable.Map({
  trackId: "sendAll",
  args: Immutable.List()
}));

const liveDataModified =
  // groupedTracksApplier(

  liveDataPrepped.scan((store, newData) => (newData.get("type") === "id" && newData.get("trackId") === "selectedClip"
    ? store.update(newData.get("trackId"), () => Immutable.Map({
      id: newData.get("value")
    }))
    : store.setIn([
      newData.get("trackId"),
      newData.get("type")
    ], newData.get("value"))).updateIn([
      newData.get("trackId"),
      "trackId"
    ], (t) => newData.get("trackId")).updateIn([
      newData.get("trackId"),
      "gain"
    ], (t) => t || 0.4), Immutable.Map())
    .skip(1)
    .throttledDebounce(10)
    .map(m => m.sortBy((v, k) => k, (k1, k2) => ("" + k1).localeCompare("" + k2)))
    .map(tracks => tracks.map((v, trackId) => v.set("isSelected", v.get("id") && v.get("id") === tracks.getIn(["selectedClip", "id"]))))
    .map(m => m.update("selectedClip", s => s
      ? (m.find((v, trackId) => trackId !== "selectedClip" && v.get("id") === s.get("id"))
        ? s.set("selectedClipAlreadyDisplayed", true).set("playingPosition", 0)
        : s.set("playingPosition", 0))
      : s))
    .tap(log("liveDataModifiedStore"))
    .map(m => m.filter(t => t.get("id") >= 0))

actionStream.plug(oscInput);

export default liveDataModified.multicast();
