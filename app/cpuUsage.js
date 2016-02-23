import React from 'react';
import component from "omniscient";
// import { dom } from 'react-reactive-class';
import most from "most";
import Immutable from "immutable";
// import Waveform from "./waveform";

import log from "./utils/streamLog";
import actionStream from "./api/actionSubject";
// import log from "./utils/
import {VictoryPie} from "victory";

var usage = require('usage');

var pidMe = process.pid // you can use any valid PID instead
// console.log("process pid",pid);

import pidof from 'pidof';

var pids = {me:pidMe};

pidof('.*\\/Live.*', function (err, pidLive) {
    if (err) {
        console.log('Weird error getting PIDs');
        console.log(err);
    } else {
        if (pidLive) {
            console.log('Found ableton at pid ' + pidLive);
            pids.live = pidLive;
        } else {
            console.log('Seems like there\'s no ableton running on this system');
        }
 Object.keys(pids).forEach((processName,i) => {   
     var pid =pids[processName];
      console.log("pid for process",processName,pid);
actionStream.plug(
most.periodic(300,true)
    .flatMap(()=> most.fromPromise(new Promise(resolve=>usage.lookup(pid, function(err, result) {
    // console.log("usage result",result,err);
    resolve(result);
}))))
.map(res => res.cpu)
.tap(log("cpuUsage"))
.loop((window, newVal)=>    
({seed: (window.size > 5 ? window.shift() : window).push(newVal),
    value: window.reduce((total, val)=> total+=val/window.size,0)
 }),Immutable.List())
.throttledDebounce(3000)
// .delay(i*1000/2)
.map(res => Immutable.Map({type:"cpuUsageUpdate", process:processName, usage:res})))
 });
    }
});

// .observe(log("cpuUsage"))




;

export default component(({usage})=>
<div style={{position:"relative", width:"30px"}}>
  	 <div style={{textAlign:"center",color:"rgba(255,255,255,0.6)",width:"100%", fontSize: "8px"}}>&nbsp;CPU</div> 
   
    <VictoryPie padding={0} animate={{velocity:0.2}}  width={30} height={30} style={{labels:{display:"none"},data:{stroke:"transparent"}}} 
        data={[{x:"me",y:usage.get("me"), fill:"red", opacity:0.8},{x:"live",y:usage.get("live"), fill:"green", opacity:0.8},{x:"",y:100-usage.get("live")-usage.get("me"), fill:"rgba(255,255,255,0.1)"}]}
    />
  
</div>
);