import most from "most";

import osc from "node-osc";
import Subject from "./subject";

import Immutable from "immutable";
var oscServer = new osc.Server(5555, '0.0.0.0');
oscServer.setMaxListeners(100);
console.log("oscSerrver in renderer", oscServer);

var oscInputStream = most.fromEvent("message", oscServer)
	.map(f => f[0]);
	
// export oscInputStream as oscInp;


var oscOutput = Subject();
// oscOutput
// .observe(oscStatus => console.log("osc out:", oscStatus.toJS()));

var currentOscSender = new Promise(resolve => resolve(Immutable.Map({})));

oscOutput.map(s => typeof s === "Stream" ? s : most.of(s)).join().scan((oscSender, oscMessage) => oscSender.then(() => new Promise(resolve => {
	console.log("sending, ", oscMessage.toJS());
	var client = new osc.Client(oscMessage.get("host") || '127.0.0.1', oscMessage.get("port") || 4000);
	client.send(...oscMessage.get("args").toJS(), function() {
		resolve(Immutable.Map({sent: oscMessage}));
		client.kill();
	});
}
)),currentOscSender)
.await()
.observe(oscStatus => console.log("osc sent:", oscStatus.toJS()));


export {oscOutput, oscInputStream};