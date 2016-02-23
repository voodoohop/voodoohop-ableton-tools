import most from "most";

import osc from "node-osc";
import Subject from "./subject";
import Immutable from "immutable";
import log from "./streamLog";
import actionStream from "../api/actionSubject";


var oscServer = new osc.Server(5555, '0.0.0.0');
oscServer.setMaxListeners(100);
console.log("oscSerrver in renderer", oscServer);


var oscInputStream = most.fromEvent("message", oscServer)
	.map(f => f[0])
    // .skipRepeatsWith((e,f) => JSON.stringify(f) === JSON.stringify(e))
    .tap(log("oscIn"))
	.multicast();
// export oscInputStream as oscInp;
console.log("OSCstream",oscInputStream);

var oscOutput = Subject();
// oscOutput
// .observe(oscStatus => console.log("osc out:", oscStatus.toJS()));

var currentOscSender = new Promise(resolve => resolve(Immutable.Map({})));

var client = new osc.Client('127.0.0.1', 4444);

oscOutput
.tap(log("oscOutputPre"))

.bufferedThrottle(20)
// .merge(actionStream.filter(a => a.get("type")==="oscOutput"))
.scan((oscSender, oscMessage) => oscSender.then(() => new Promise(resolve => {
	console.log("sending, ", oscMessage.toJS() );
	client.send(""+oscMessage.get("trackId"),...oscMessage.get("args").toArray(), function() {
		setTimeout(()=>resolve(Immutable.Map({sent: oscMessage})),1);
		// client.kill();
	});
}
)),currentOscSender)
.flatMap(f => most.fromPromise(f))
.observe(oscStatus => console.log("osc sent:", oscStatus.toJS()));


oscOutput.plug(actionStream.filter(a => a.get("type")==="oscOutput"));

export {oscOutput, oscInputStream};
