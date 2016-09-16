import Immutable from "immutable";

import * as most from 'most';

import actionStream from "../api/actionSubject";

// import Subject from "../utils/subject";
// var throttler=Subject();

import fs from "fs";
import log from "../utils/streamLog";



import remoteClipUpdater from "./remoteClipUpdater";
// import livedataStore from "./livedataStore";
import metadataStore from "./metadataStore";

import getTransposed from "../utils/transposedNote";

var selectHarmonyMaster = actionStream.filter(action => action.get("type") === "harmonyMaster").map(action=>action.get("value")).startWith(0).throttledDebounce(300);

var harmonyMaster = most.combine((harmonyMaster,livedata,metadata) => {
    var trackIds= livedata.keySeq().sort();
    console.log("livedataIs",livedata)
    var selectedTrack=trackIds.get(Math.max(0,Math.floor(trackIds.size*harmonyMaster-0.001)));
    var clip=livedata.getIn([selectedTrack,"clips"]).find(clip=>clip.get("is_triggered")==1 || clip.get("playing_position")>0);  
    if(!clip)
        return Immutable.Map();
    return Immutable.Map({master:selectedTrack, livedata: clip, metadata: metadata.get(clip.get( "file_path" )) });
    },selectHarmonyMaster,remoteClipUpdater.filter(livedata=>livedata.size>0),metadataStore)
    .tap(log("harmonyMaster0"))
    .filter(master => master.get("livedata") && master.get("metadata"))
    .map(master => 
        Immutable.Map({
            scale: getTransposed(master.getIn(["metadata","id3Metadata","initialkey"]), master.get("livedata").get("pitch_coarse"))
           ,chords: master.getIn(["metadata","midiMetadata"]).updateIn(["notes"], notes => notes.map(note => note.update("pitch",(oldPitch)=>oldPitch+master.get("livedata").get("pitch_coarse"))))
    }))
    // .map(master => master.set("chords", ))
    // .map(master => master)
    .skipRepeatsWith(Immutable.is)
    // 
    .tap(log("harmonyMaster1"))
    .multicast();
    
    
   harmonyMaster.observe(log("globalHarmonryMater"));

actionStream.plug(
    harmonyMaster
    .combine((harmonyMaster, remoteTracks) => remoteTracks.map((remoteTrack)=> {
        console.log("}]eereeemote",harmonyMaster,remoteTracks)
        var chordNotes = harmonyMaster.getIn(["chords","notes"]);
        var trackId = remoteTrack.get("trackId");
        var cmds=null;
        switch(remoteTrack.get("midi")) {
            case "chords":
                
                cmds = chordNotes ? [["select_all_notes"],["replace_selected_notes"],["notes",chordNotes.size ],...chordNotes.map(note => ["note",note.get("pitch"),note.get("beat").toFixed(3),note.get("duration").toFixed(3), note.get("velocity"), note.get("muted")]),["done"]]:[];             
                break;
            case "scale":
                cmds= [];
                break;
            default:
                cmds= [];
        }
        return Immutable.fromJS(cmds.map(cmd =>(  {type: "oscOutput", trackId, 
            args:["clipCommand",1,"call"].concat(cmd)})));
    }),remoteClipUpdater.map(tracks=> tracks.filter(track => track.get("midi")).map(track=>track.toMap().filter((_,k)=>k==="midi" || k==="trackId")).valueSeq()).tap(log("eeee2")).skipRepeatsWith(Immutable.is))
    .flatMap(f => most.from(f.toArray()))
    .tap(log("globalHarmonyAction1"))
    .flatMap(f => most.from(f.toArray()))
    
    .tap(log("globalHarmonyAction"))
 
    // .bufferedThrottle(50, "oscChordReplaceStream")
);

remoteClipUpdater.map(tracks=> tracks.filter(track => track.get("midi")).map(track=>track.toMap().filter((_,k)=>k==="midi" || k==="trackId")).valueSeq()).tap(log("eeee2")).skipRepeatsWith(Immutable.is).observe(log("skippedRepeats"))

export default harmonyMaster;