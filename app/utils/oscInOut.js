import * as most from 'most';

import osc from "node-osc";
import Subject from "./subject";
import Immutable from "immutable";
import log from "./streamLog";
import actionStream from "../api/actionSubject";


var oscServer = new osc.Server(8888, '0.0.0.0');
oscServer.setMaxListeners(100);
console.log("oscSerrver in renderer", oscServer);


var oscInputStream = most.fromEvent("message", oscServer)
	.map(f => f[0])
	// .skipRepeatsWith((e,f) => JSON.stringify(f) === JSON.stringify(e))
	.tap(log("oscIn"))
	.multicast();
// export oscInputStream as oscInp;
console.log("OSCstream", oscInputStream);

var oscOutput = Subject();
// oscOutput
// .observe(oscStatus => console.log("osc out:", oscStatus.toJS()));

var currentOscSender = new Promise(resolve => resolve(Immutable.Map({})));

var client = new osc.Client('127.0.0.1', 7777);

oscOutput
	.tap(log("oscOutputBefore", (msg) => [msg.get("trackId")].concat(msg.get("args").toArray())))

	.bufferedThrottle(5)
	// .tap((l)=>con)
	// .merge(actionStream.filter(a => a.get("type")==="oscOutput"))
	.scan((oscSender, oscMessage) => oscSender.then(() => new Promise(resolve => {
		// console.log("sending, ", oscMessage.toJS());
		client.send("" + oscMessage.get("trackId"), ...oscMessage.get("args").toArray(), function () {
			resolve(Immutable.Map({ sent: oscMessage }));
			// client.kill();
		});
	}
	)), currentOscSender)
	.flatMap(f => most.fromPromise(f))
	.observe(log("oscSent")).catch(console.error.bind(console));


oscOutput.plug(actionStream.filter(a => a.get("type") === "oscOutput"));

export { oscOutput, oscInputStream };
