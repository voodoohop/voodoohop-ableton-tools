import Immutable from "immutable";


import actionStream from "../api/actionSubject";


import {oscInputStream} from "../utils/oscInOut";


// oscInputStream.
var oscInput= oscInputStream	
		.filter(f => f[2] === "playingClip" && f[1]>=0)
		.map(f => Immutable.fromJS({type: "liveDataInput", trackId: f[1], data: f.slice(3)}));
		
		
var oscControlInput = oscInputStream.filter(f=> f[0] === "control").map(f => Immutable.fromJS({type: f[1], value:f[2]}))
	.tap(f=>console.log("oscControl",f.toJS()));

actionStream.plug(oscInput);
actionStream.plug(oscControlInput);

export default actionStream.filter(a=> a.get("type") === "globalZoom").scan((store,input) => input.get("trackId") ? store.mergeIn([input.get("trackId")], input) : store.set(input.get("type"), input.get("value"))
	, Immutable.Map({globalZoom: 2}));