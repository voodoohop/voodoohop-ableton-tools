
import actionStream from "../api/actionSubject";
import getKeyColor from "../api/keysToColors";

import Immutable from "immutable";
import {oscOutput,oscInputStream} from "../utils/oscInOut";
import log from "../utils/streamLog";
import {metadataStore} from ".";

import most from "most";



metadataStore.take(1).observe((md)=> {
console.log("md",md.toJS());
oscOutput.push(Immutable.fromJS({trackId:"sendAll",args:[]}));
}
);


var clipUpdateRes = oscInputStream.filter(oscIn => oscIn[0] === "clipUpdateResult")
.map(u => Immutable.Map({type: "clipUpdateResult", trackId:u[1], scene: u[2], property: u[3], value: u[4]}))
.tap(log("clipUpdateResultResult"));

var newPathReceived =  clipUpdateRes.filter(c=>c.get("property")==="file_path");
var metadataNeeded =newPathReceived
.sample((metadata,pathNeeded) => {
    // console.log("mdta",metadata.toJS(),"pathNeeded",pathNeeded.toJS());
    return Immutable.Map({
    path:pathNeeded.get("value"), 
    trackId:pathNeeded.get("trackId"), 
    scene:pathNeeded.get("scene"),
    metadata: metadata.get(pathNeeded.get("value"))
 });}, metadataStore,newPathReceived);

var waitingForMetadata = metadataNeeded.filter(m=>!m.get("metadata"));
//.combine((waiting, metadata)=> ,metadataStore);

actionStream.plug(waitingForMetadata.map(w => w.set("type","loadMetadata")));

var alreadyGotMetadata = metadataNeeded.filter(m=>m.get("metadata")).tap(log("alreadyGotMetadata"));

// actionStream.plug(
//     alreadyGotMetadata.map(m => Immutable.Map({type:"oscOutput", trackId: m.get("trackId"), args:["clipCommand", m.get("scene"), "set", "color"
//     , parseInt(getKeyColor(m.getIn(["metadata","id3Metadata","initialkey"])).replace("#","0x"))]}))
//     .tap(log("oscColorOutput"))
//     );

// actionStream.plug(most.periodic(100,()=>Immutable.fromJS({type:"oscOutput", trackId:1, args:["clipCommand",Math.floor(Math.random()*5),"set","color",Math.floor(16777216*Math.random())]})).map(f=>f()))

var remoteClipStore= actionStream
.filter(a=>a.get("type") === "clipUpdateReceiverTrack"  )
.map(a=> Immutable.Map({trackId: a.get("trackId"), numScenes: a.get("numScenes")}))
.merge(clipUpdateRes.map(r => Immutable.Map({trackId:r.get("trackId")})
    .setIn(["clips",r.get("scene")], Immutable.Map().set(r.get("property"),r.get("value"))))//.tap(log("mergeClipUpdateRes"))
)
// .combine((remoteClipData,metaData) => ,metadataStore)
.scan((store,next)=>store.mergeDeep(Immutable.Map().set(next.get("trackId"),next)),Immutable.Map())
.tap(log("remoteClipStore"))
;

var clipColorStream = remoteClipStore.combine((remoteClips,metadata)=>{ 
    console.log("remoteClips",remoteClips.toJS());
    return remoteClips.map((trackClips,trackId)=> {
        console.log("trackClips",trackClips.toJS());
        if (!trackClips.get("clips"))
            return Immutable.List();
        return  trackClips.get("clips").filter(clip => metadata.get(clip.get("file_path"))).map((clip,scene) => Immutable.Map(
    {
        scene, 
        trackId, 
        key:metadata.getIn([clip.get("file_path"),"id3Metadata","initialkey"]),
        hexColor:getKeyColor(metadata.getIn([clip.get("file_path"),"id3Metadata","initialkey"])),
        keyColor: parseInt(getKeyColor(metadata.getIn([clip.get("file_path"),"id3Metadata","initialkey"])).replace("#","0x"))
    })).valueSeq();}
    )
    .valueSeq().flatMap(v=>v)
    }, metadataStore)
    .loop((alreadyColored, clips)=> {
        const colorNow = clips.filter(clip => !alreadyColored.has(clip.toString()));
        return {seed: alreadyColored.concat(colorNow.map(clip => clip.toString())), value: most.from(colorNow.toArray())};
    },Immutable.Set())
    .flatMap(cs=>cs)
    .tap(log("coloredClips"));

actionStream.plug(
    clipColorStream.map(clipCol =>
    Immutable.fromJS({type:"oscOutput", trackId:clipCol.get("trackId"), args:["clipCommand",clipCol.get("scene"),"set","color",clipCol.get("keyColor")]}))
);


var requestPathActions=remoteClipStore.zip(
    (prev,next) => next.filter((v,k) => !prev.has(k))
 ,remoteClipStore.skip(1))
 .flatMap(newTracks => most.from(newTracks.toArray()))
 .tap(log("newTrack"))
 .flatMap(
     newTrack => most.from(
        Immutable.Range(0,newTrack.get("numScenes") || 1).map(scene =>
         Immutable.fromJS({type:"oscOutput", trackId:newTrack.get("trackId"), args:["clipCommand",scene,"get","file_path"]})
        ).toArray()
     )
 );
 
 //TODO: make throttling not leak a buffer
actionStream.plug(
requestPathActions.bufferedThrottle(100).during(requestPathActions.take(1).delay(500).map(()=>most.never())));

// var clipsWithMetadata = remoteClipStore.combine((remoteClips,metadata) =>,metadataStore)

export default remoteClipStore;
// oscOutput.push(actionStream.filter(a => a.get("type") ===));




// actionStream.plug(clipUpdateRes 
//     .filter(r => r.get("property") === "file_path")
//     .map(r=> Immutable.Map({type:"loadMetadata", path: r.get("value")}))
// )