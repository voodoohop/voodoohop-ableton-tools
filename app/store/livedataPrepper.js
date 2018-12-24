import * as most from 'most';

import Immutable from 'immutable';

// import {createStore} from "./appStore";

import log from '../utils/streamLog';


import { oscInputStream, oscOutput } from "../utils/oscInOut";

// import {midiClipStore} from "."; import {liveDataMidiLinker} from
// "./mididataLinker";

setTimeout(() =>
  oscOutput.push(Immutable.Map({
    trackId: "sendAll",
    args: Immutable.List()
  })), 5000);


const oscFilteredInput = oscInputStream
  // .tap(log("preLiveDataInput"))
  .map(d => d[1] === "playingClip"
    ? [
      "list", ...d
    ]
    : d).filter(f => f[2] === "playingClip").map(f => Immutable.fromJS({
      type: "liveDataInput",
      trackId: f[1],
      data: f.slice(3)
    }));



const liveIn =
  // most.empty();
  oscFilteredInput
    // .tap(log("liveDataInput1"))//.switch( (accumData,liveDataInput)
    // .merge(most.periodic(60, null)) .loop((state, info)=> {
    .filter(info => info !== null)
    .map((info) => {
      const key = info.getIn(['data', 0]);
      let val = info.getIn(['data', 1]);

      if (typeof val === 'string' && val.match(/"(.*)"/))
        val = val.match(/"(.*)"/)[1];
      return Immutable.Map({
        trackId: info.get('trackId'),
        type: key,
        value: val
      });
    });

// .tap(log("accumulated live data1")) .tap(log("prepped live data"))
// .flatMap(info => most.from(info.keySeq().map(k => info.get(k).set("trackId",
// k)))) .tap(f => console.log("oscInputStore",f.toJS())) .filter(f=>
// f.get("playing")===1/* && f.get("file_path")*/) .multicast() .scan((ts,t) =>
// 	ts.set(t.get("trackId"), 	t 	) 	, Immutable.Map()));
// .tap(f=>console.log("oscInputStore2",f.toJS()));


// export var addLiveDataSource =(source) => { console.log("adding data
// source",source);  mergeBack.push(source); }

// let liveIn = prepLiveInput(actionStream.filter(a => a.get('type') === 'liveDataInput'));

// actionStream.plug(liveIn.filter(l => l.get('type') === 'file_path').map(l => Immutable.Map({
//   type: 'livePathReceived',
//   path: l.get('value')
// })));

// addLiveDataSource(liveIn.delay(1).sample( 	(storedNow, liveAccum) =>{
// 	console.log("merging",storedNow.toJS(),liveAccum.toJS()); 	return
// storedNow.mergeDeep(liveAccum); }, stored.startWith(emptyDta),liveIn));
// stored.observe(log("stored"));
export default liveIn.multicast();
