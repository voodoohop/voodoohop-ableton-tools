
import actionStream from "../api/actionSubject";
import getKeyColor from "../api/keysToColors";

import Immutable from "immutable";
import {oscOutput,oscInputStream} from "../utils/oscInOut";
import log from "../utils/streamLog";
import {metadataStore} from ".";
import transposeNote from "../utils/transposedNote";
import most from "most";


import tinycolor from "tinycolor2";



const requestProperties = Immutable.fromJS(["pitch_coarse","file_path"]);


metadataStore.take(1).delay(500).observe((md)=> {
console.log("md",md);
oscOutput.push(Immutable.fromJS({trackId:"sendAll",args:[]}));
}
).catch(console.error.bind(console));



var clipUpdateRes = oscInputStream.filter(oscIn => oscIn[0] === "clipPropertyChange")
.map(u => Immutable.Map({type: "clipUpdateResult", trackId:u[1], scene: u[2], property: u[3], value: u[4]}))
.tap(log("clipUpdateResultResult")).multicast();

var newPathReceived =  clipUpdateRes.filter(c=>c.get("property")==="file_path" && c.get("value")).tap(log("newPathReceived"));
var metadataNeeded =newPathReceived
.sample((metadata,pathNeeded) => {
    // console.log("mdta",metadata.toJS(),"pathNeeded",pathNeeded.toJS());
    return Immutable.Map({
    path:pathNeeded.get("value"), 
    trackId:pathNeeded.get("trackId"), 
    scene:pathNeeded.get("scene"),
    metadata: metadata.get(pathNeeded.get("value"))
 });}, metadataStore,newPathReceived).tap(log("metadataNeeded"));

var waitingForMetadata = metadataNeeded.filter(m=>!m.get("metadata")).tap(log("waitingForMetadata"));
//.combine((waiting, metadata)=> ,metadataStore);

actionStream.plug(waitingForMetadata.map(w => w.set("type","loadMetadata")));

var alreadyGotMetadata = metadataNeeded.filter(m=>m.get("metadata")).tap(log("alreadyGotMetadata"));

// actionStream.plug(
//     alreadyGotMetadata.map(m => Immutable.Map({type:"oscOutput", trackId: m.get("trackId"), args:["clipCommand", m.get("scene"), "set", "color"
//     , parseInt(getKeyColor(m.getIn(["metadata","id3Metadata","initialkey"])).replace("#","0x"))]}))
//     .tap(log("oscColorOutput"))
//     );

// actionStream.plug(most.periodic(100,()=>Immutable.fromJS({type:"oscOutput", trackId:1, args:["clipCommand",Math.floor(Math.random()*5),"set","color",Math.floor(16777216*Math.random())]})).map(f=>f()))

var TrackStoreRecord = Immutable.Record({numScenes: 0,midi:0, trackId:-1,clips: Immutable.Map()}, "TrackStorage");

var remoteClipStore= actionStream
.filter(a=>a.get("type") === "clipUpdateReceiverTrack"  )
.tap(log("remoteClipUpdate"))
.flatMap(a=> most.from([{path:[a.get("trackId"), "trackId"],value:a.get("trackId")},{path:[a.get("trackId"), "numScenes"],value:a.get("numScenes")},{path:[a.get("trackId"), "midi"],value:a.get("midi")}]))
.merge(clipUpdateRes.map(r => ({path:[r.get("trackId"), "clips",r.get("scene"),r.get("property")],value:r.get("value")})))

.tap(log("remoteClipStoreData"))

.scan((store,{path,value}) => {
    if (!store.has(path[0]))
        store = store.set(path[0], Immutable.Map({numScenes: 0,midi:0, trackId:-1,clips: Immutable.Map()}));        
    return store.updateIn(path, () =>  value);
 }, Immutable.Map())
 .map(store => store.map(track => track.update("clips", clips => clips.filter(clip => clip.get("file_path")))))
// .skip(1) 

.skipRepeatsWith(Immutable.is)
 .throttledDebounce(100)

.map(m => m.filter((v,k) => v.get("trackId")>=0 && v.get("numScenes")>0 && v.has("clips")))
.tap(log("before keyseq test"))
// .map(tracks => tracks.map(m =>m.update("clips",Immutable.List(),clips=>clips.filter(clip => clip.keySeq().isSuperset(requestProperties.toArray())))))
// .skipRepeats()

// .tap(clipStore => log("remoteClipStore2")(clipStore.getIn([0,"clips"])))
// .startWith(Immutable.Map())
.skipRepeatsWith(Immutable.is)
.tap(tracks => log("remoteClipStoreFlat")(tracks.flatMap(track => track.get("clips"))))
.tap( log("remoteClipStore"))

.multicast();


var HarmonyColor = Immutable.Record({key:"-",hexColor:"#aaa",keyColor:0});

var ClipDataRecord= Immutable.Record({file_path:null, pitch_coarse:0, harmonyColor: new HarmonyColor(),name:null});

var ClipRecord= Immutable.Record({scene: -1,trackId:-1, clip: new ClipDataRecord()});

function createClipRecord(track, scene) {
    console.log("typeof scene",track,scene);
    var record= new ClipRecord({scene, trackId:track.get("trackId")});
    return record.set("clip",track.getIn(["clips",scene]));
}

var clipStreams = remoteClipStore.flatMap(tracks=>most.from(tracks.valueSeq().toArray()))
.flatMap(track => most.from(track.get("clips").map((clip, scene) => Immutable.Map({key:Immutable.Map({trackId: track.get("trackId"),scene}),clip:clip.remove("playing_position") })).toArray()))
.loop((clipStreamMap, trackStream) =>Immutable.is(clipStreamMap.get(trackStream.get("key")),trackStream.get("clip")) ?  {seed:clipStreamMap,value:most.empty()} : {seed:clipStreamMap.set(trackStream.get("key"),trackStream.get("clip")), value: most.of(trackStream)}, Immutable.Map())
.flatMap(f=>f)
.filter(cr => cr.get("clip") && cr.getIn(["clip","name"]))


function getTransposedNote(clip,metadata) {
    return transposeNote(metadata.getIn([clip.get("file_path"),"id3Metadata","initialkey"]),clip.get("pitch_coarse")||0)
};

function getMetadataName(clip,metadata) {
    var origName = clip.get("name").replace(/\[(.*)\]\ /,"").trim();
    
    var name = metadata.getIn([clip.get("file_path"),"id3Metadata","artist"]) ?  metadata.getIn([clip.get("file_path"),"id3Metadata","artist"])+" - "+metadata.getIn([clip.get("file_path"),"id3Metadata","title"]):origName;
    return name;
};


var clipColorStream = clipStreams
    .combine((clipRecord,metadata) => {
        const key = getTransposedNote(clipRecord.get("clip"),metadata);
        const metadataName  = getMetadataName(clipRecord.get("clip"),metadata);
        const hexColor = tinycolor(getKeyColor(key)).toHexString();
        const keyColor = parseInt(hexColor.replace("#","0x"));
        return clipRecord.setIn(["clip","harmonyColor"],Immutable.Map({key,hexColor,keyColor}))
        .setIn(["clip","metadataName"],metadataName);
     },metadataStore)
    // .tap(log("wannaColour"))
    // .loop((alreadyColored, clips)=> {
    //     const hashKey = (now) => ""+now.get("scene")+"_"+now.get("trackId")+"_"+now.get("file_path");

    //     const colorNow = clips
    //     .filter(clip => {
    //         const existsAlready=alreadyColored.get(hashKey(clip));
    //         // console.log(clip);
    //         return !existsAlready || existsAlready.toString() !== clip.toString();});
    //     // colorNow.map(t => t.toString()).forEach(log("colorNow"));
    //     return {seed: colorNow.reduce((before,newOne)=> before.set(hashKey(newOne), newOne),alreadyColored), value: colorNow.toArray()};
    // },Immutable.Map())
    // .flatMap(cs=> most.from(cs))
    // .skipRepeatsWith(Immutable.is)
    
    
    .tap(log("coloredClips"))
    .multicast();

    // var atEnd = clipColorStream.map(({clip}) => clip.get("playing_position")<16).skipRepeats().filter(f=>f);
    // var notAtEnd = clipColorStream.map(({clip}) => clip.get("playing_position")>=16).skipRepeats().filter(f=>f);
    // var flashNearEnd = clipColorStream.flatMap((clipRecord)=> most.generate(function*() {
    //     var flashNeutral=true;
    //     while (true) {
    //     yield new Promise((resolve)=> setTimeout(()=> {
    //         resolve(clip=> flashNeutral?clipRecord.setIn(["clip","harmonyColor","keyColor"], 0x666666):clipRecord);
    //         console.log("flashing")
    //         flashNeutral= !flashNeutral;
    //     },300))
    //     }
    // })).during(atEnd.map(notAtEnd));

//TODO: use flash near end


const pitchedInfo = pitch => pitch==0? "" : (pitch> 0? " +"+pitch : ""+pitch) ;

const clipPrefix = clipRecord => "["+clipRecord.getIn(["clip","harmonyColor","key"])+pitchedInfo(clipRecord.getIn(["clip","pitch_coarse"]))+"]";

actionStream.plug(
    clipColorStream
    // merge(flashNearEnd)
    .flatMap(clipRecord => most.from([
        ["color",clipRecord.getIn(["clip","harmonyColor","keyColor"])],
        ["name",clipPrefix(clipRecord) + " " + clipRecord.getIn(["clip","metadataName"]).replace(/\[(.*)\]\ /,"").trim()]
        
    ].map(setProps =>
        Immutable.fromJS(
            {
                type: "oscOutput",
                trackId: clipRecord.getIn(["key","trackId"]), 
                args:["clipCommand",clipRecord.getIn(["key","scene"]),"set"].concat(setProps)
            })
    
    )))
    .bufferedThrottle(5, "oscColorizeActionStream")
);

export default remoteClipStore;
