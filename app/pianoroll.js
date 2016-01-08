import React from 'react';
import component from 'omniscient';
import Immutable from "immutable";
var SvgNote = component(({note,pitchSet}) => {
	var {beat, duration, pitch, velocity, muted} = note.toJS();
	// console.log("rendering note", beat,duration, pitch);
	return <rect x={beat} y={(pitchSet.size-pitchSet.indexOf(pitch))*127/pitchSet.size} fill={"rgba(255,255,255,"+(velocity/127)+")"} width={duration-0.01} height={127/pitchSet.size-0.01} strok="none"/>
}
)

export default component(({notes}) => {
	console.log("notesFound",notes.toArray().map((note,i) => "bla"+i));
	var pitchSet = notes.reduce((pitches, note)=>pitches.add(note.get("pitch")), Immutable.Set());
	console.log("pitchSet",pitchSet.sort().toList().toJS());
	return <g>{notes.toArray().map((note,i) => {
		return <SvgNote key={"sd"+i}  note={note} pitchSet={pitchSet.sort().toList()}/>
	})}</g>;
			
	}
)