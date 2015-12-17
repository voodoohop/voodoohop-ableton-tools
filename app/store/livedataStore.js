import most from "most";

import Immutable from "immutable";

// import {createStore} from "./appStore";

import {oscInputStream} from "../utils/oscInOut";


// oscInputStream.
var oscInput= oscInputStream	
		.filter(f => f[2] === "playingClip" && f[1]>=0)
		.map(f => Immutable.fromJS({type: "liveDataInput", trackId: f[1], data: f.slice(3)}));
		
actionStream.plug(oscInput);

var doStore= (liveDataInput) => liveDataInput
		.scan((state, info)=> state.setIn([info.get("trackId"), info.get("data").get(0)], info.get("data").get(1)), Immutable.Map( ))
		.flatMap(info => most.from(info.keySeq().map(k => info.get(k).set("trackId", k))))
		// .tap(f => console.log("oscInputStore",f.toJS()))
		.filter(f=> f.get("playing")===1/* && f.get("file_path")*/)
		.multicast()
		.scan((ts,t) => 
			ts.set(t.get("trackId"),
			t
			)
			, Immutable.Map()).skip(1)
			.throttle(100);
			// .tap(f=>console.log("oscInputStore2",f.toJS()));
	

import actionStream from "../api/actionSubject";

export default doStore(actionStream.filter(a => a.get("type")==="liveDataInput"))