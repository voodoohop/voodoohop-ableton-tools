import most from "most";

import Immutable from "immutable";

// import {createStore} from "./appStore";

import {oscInputStream} from "../utils/oscInOut";
import mididataLinker from "./mididataLinker";

import actionStream from "../api/actionSubject";
import log from "../utils/streamLog";

var oscMidiClipInput = oscInputStream
	.filter(f => f[2] === "midiClip" && f[1]>=0)
		.map(f => Immutable.fromJS({type: "liveMidiClipInput", trackId: f[1],command:f[3], data: f.slice(4)}));
	
		
actionStream.plug(oscMidiClipInput);


var doStore= (liveMidiInput) => liveMidiInput
		.filter(midi => midi.get("command") === "notes")
		.flatMap(notesStart => {
			console.log("notesStart", notesStart.toJS());
			var trackId = notesStart.get("trackId");
			return most.fromPromise(liveMidiInput
				.filter(midi => midi.get("trackId")===trackId)
				.takeWhile(midi => midi.get("command") !== "done")
				// // .tap(midi => console.log("note received", midi.toJS()))
				.map(midi => midi.get("data"))
				.map(([pitch, beat, duration, velocity, muted]) => Immutable.Map({pitch,beat,velocity,duration,muted}))
			   	.collect()).map(notes=> Immutable.Map({notes:Immutable.List(notes).sortBy(n=>n.get("beat")), trackId}));
			//    .reduce(({trackId, notes},midiNote) => ({trackId, notes:notes.concat([midiNote])}),{trackId, notes: Immutable.List()});
			//    )
			   //.map(notes => Immutable.Map({trackId: trackId, notes: notes.orderBy(note => note.get("beat"))}))
		
		})
		.scan((store, midiClip) => store.set(midiClip.get("trackId"), midiClip), Immutable.Map())
		//  .await()
		
	 .tap(log("oscMidiStore"));



var midiClipStore = doStore(actionStream.filter(a => a.get("type")==="liveMidiClipInput")).startWith(Immutable.Map())

// midiClipStore).drain();

export default mididataLinker(midiClipStore);