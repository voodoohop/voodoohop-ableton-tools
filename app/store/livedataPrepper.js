import * as most from 'most';

import Immutable from "immutable";

// import {createStore} from "./appStore";


import log from "../utils/streamLog";


var emptyDta=Immutable.Map();
var prepLiveInput= (liveDataInput) => 
// most.empty();
		liveDataInput//.switch( (accumData,liveDataInput)
		// .merge(most.periodic(60, null))
		// .loop((state, info)=> {
            .filter(info => info !==null)
            .map(info => {
            
			var key= info.getIn(["data",0]);
			var val= info.getIn(["data",1]);
			// console.log("val before",val);
			var prevVal = val;
			if (typeof val === "string" && val.match(/"(.*)"/))
				val = val.match(/"(.*)"/)[1];
			if (prevVal != val)
				console.log('val before', prevVal,"val after",val);
             return Immutable.Map({trackId: Number(info.get("trackId")), type:key, value:val})
            })
            
		// .tap(log("accumulated live data1"))	
		.tap(log("prepped live data"))	
		// .flatMap(info => most.from(info.keySeq().map(k => info.get(k).set("trackId", k))))
		// .tap(f => console.log("oscInputStore",f.toJS()))
		// .filter(f=> f.get("playing")===1/* && f.get("file_path")*/)
		
		// .multicast()
		// .scan((ts,t) => 
		// 	ts.set(t.get("trackId"),
		// 	t
		// 	)
		// 	, Immutable.Map()));
			// .tap(f=>console.log("oscInputStore2",f.toJS()));
	

import actionStream from "../api/actionSubject";
    // export var addLiveDataSource =(source) => {
// console.log("adding data source",source);	
//  mergeBack.push(source);
// }

var liveIn = prepLiveInput(actionStream
.filter(a => a.get("type")==="liveDataInput"));

actionStream.plug(liveIn.filter(l => l.get("type") === "file_path").map(l => Immutable.Map({type:"livePathReceived", path: l.get("value")})));

// addLiveDataSource(liveIn.delay(1).sample(
// 	(storedNow, liveAccum) =>{ 
// 	console.log("merging",storedNow.toJS(),liveAccum.toJS());
// 	return storedNow.mergeDeep(liveAccum);
// }, stored.startWith(emptyDta),liveIn));

// stored.observe(log("stored"));
export default liveIn;