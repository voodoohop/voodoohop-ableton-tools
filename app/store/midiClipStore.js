import * as most from 'most';

import Immutable from "immutable";

// import {createStore} from "./appStore";

import { oscInputStream } from "../utils/oscInOut";
import { midiClipStoreLinker as mididataLinker } from "./mididataLinker";

import actionStream from "../api/actionSubject";
import log from "../utils/streamLog";
import { livedataStore } from ".";

const oscMidiClipInput = oscInputStream.filter(f => f[2] === "midiClip" && f[1] >= 0).map(f => Immutable.fromJS({
  type: "liveMidiClipInput",
  trackId: f[1],
  command: f[3],
  data: f.slice(4)
}));

const oscClipUpdaeteReceiverTrack = oscInputStream.filter(f => f[0] === "clipUpdateReceiverTrack") //.observe(log("midiClipReceiverTrack"))
  .map(f => Immutable.fromJS({
    type: "clipUpdateReceiverTrack",
    trackId: f[2],
    numScenes: f[4],
    midi: f[6] && f[8]
  }));

actionStream.plug(oscMidiClipInput);

actionStream.plug(oscClipUpdaeteReceiverTrack);

const doStore = (liveMidiInput) => liveMidiInput.filter(midi => midi.get("command") === "notes").flatMap(notesStart => {
  console.log("notesStart", notesStart.toJS());
  const trackId = notesStart.get("trackId");
  return most.fromPromise(liveMidiInput.filter(midi => midi.get("trackId") === trackId).takeWhile(midi => midi.get("command") !== "done")
    // // .tap(midi => console.log("note received", midi.toJS()))
    .map(midi => midi.get("data")).map(([pitch, beat, duration, velocity, muted]) => Immutable.Map({ pitch, beat, velocity, duration, muted })).collect()).map(notes => Immutable.Map({
      notes: Immutable
        .List(notes)
        .sortBy(n => n.get("beat")),
      trackId
    }));


}).combine((midiClip, liveData) => {
  const data = liveData
    .get(midiClip.get("trackId"))
    .remove("playingPosition")
    .remove("playing");
  const contained = data.reduce((isContained, v, k) => isContained && midiClip.get(k) === v, true);
  return contained
    ? midiClip
    : midiClip.merge(data);
}, livedataStore)

  //  .await()
  .tap(log("oscMidiStore"));

const midiClipStore = doStore(actionStream.filter(a => a.get("type") === "liveMidiClipInput"))

  .scan((store, midiClip) => store.mergeIn([midiClip.get("trackId")], midiClip), Immutable.Map()).startWith(Immutable.Map())

export default mididataLinker(midiClipStore);