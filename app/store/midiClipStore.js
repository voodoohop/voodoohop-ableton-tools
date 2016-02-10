import most from "most";

import Immutable from "immutable";

// import {createStore} from "./appStore";

import {oscInputStream} from "../utils/oscInOut";
import {midiClipStoreLinker as mididataLinker} from "./mididataLinker";

import actionStream from "../api/actionSubject";
import log from "../utils/streamLog";
import {livedataStore} from ".";


var oscMidiClipInput = oscInputStream
	.filter(f => f[2] === "midiClip" && f[1]>=0)
		.map(f => Immutable.fromJS({type: "liveMidiClipInput", trackId: f[1],command:f[3], data: f.slice(4)}));
		
var oscClipUpdaeteReceiverTrack = oscInputStream
	.filter(f => f[0] === "clipUpdateReceiverTrack")//.observe(log("midiClipReceiverTrack"))
	.map(f => Immutable.fromJS({type: "clipUpdateReceiverTrack", trackId: f[2], numScenes: f[4]}));


actionStream.plug(oscMidiClipInput);

actionStream.plug(oscClipUpdaeteReceiverTrack);

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
		.combine((midiClip,liveData) => {
            var data = liveData.get(midiClip.get("trackId")).remove("playingPosition").remove("playing");
            var contained = data.reduce((isContained,v,k) => isContained && midiClip.get(k)===v,true);
            return contained? midiClip : midiClip.merge(data);
        },livedataStore)
        
		//  .await()
		
	 .tap(log("oscMidiStore"));



var midiClipStore = doStore(actionStream.filter(a => a.get("type")==="liveMidiClipInput"))
    // .merge(actionStream.filter(a=>a.get("type") === "midiClipReceiverTrack").map(a=> Immutable.Map({trackId: a.get("trackId"), midiclipReceiver:true})))
    .scan((store, midiClip) => store.mergeIn([midiClip.get("trackId")], midiClip), Immutable.Map())
    .startWith(Immutable.Map())


export default mididataLinker(midiClipStore);