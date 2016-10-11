import React from 'react';
import component from 'omniscient';
import Immutable from "immutable";

import keysToColors from "./api/keysToColors";
import { note as teoriaNote } from "teoria";

const SvgNote = component(({note, pitchSet}) => {
  var {beat, duration, pitch, velocity, muted} = note.toJS();
  // console.log("rendering note", beat,duration, pitch);
  var n = teoriaNote.fromMIDI(pitch);
  var fill = keysToColors("" + n.name() + n.accidental() + "m");
  console.log("note col", "" + n.name() + n.accidental(), pitch, pitchSet.indexOf(pitch), beat, duration, velocity);
  // pitchSet=Immutable.List([-1]).concat(pitchSet)
  return <rect
    x={beat}
    y={(pitchSet.size - pitchSet.indexOf(pitch)) * 100 / pitchSet.size}
    fill={fill}
    opacity={velocity / 127}
    width={duration - 0.01}
    height={100 / pitchSet.size - 0.01}
    stroke="black"
    strokeWidth="0.1" />
})

export default component(({notes}) => {
  console.log("notesFound", notes);
  var pitchSet = notes.reduce((pitches, note) => pitches.add(note.get("pitch")), Immutable.Set());
  console.log("pitchSet", pitchSet.sort().toList());
  return <g>{notes
    .toArray()
    .map((note, i) => {
      return <SvgNote
        key={"sd" + i}
        note={note}
        pitchSet={pitchSet
          .sort()
          .toList()} />
    })}</g>;

})