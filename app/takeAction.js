// import actionSubject from "./api/actionSubject";
// // import osc from "node-osc";

// import Immutable from "immutable";

// import oscControlToAction from "./api/oscControlToAction";

// import most from "most";

// var reducers = [
// //	applies: (actionStream) => actionStream.filter(action => action.get("type") === "clickedBeat")
// 	 stateActionStream => stateActionStream.map(({state,action}) => 
// 		action.get("type") === "clickedBeat" ? 
// 		state
// 			.setIn([action.get("trackId"), "liveData", "looping"],1)
// 			.setIn([action.get("trackId"), "liveData", "loop_end"],Math.ceil(action.get("beat")/16)*16)
// 			.setIn([action.get("trackId"), "liveData", "loop_start"],Math.floor(action.get("beat")/16)*16)
// 		:
// 		state)
// ];


// console.log("registered actions",reducers);
// var noAction = Immutable.Map();

// var streamReducers = (inputStream) => reducers.reduce((inputStream, reducer) => reducer(inputStream),inputStream);

// var stateAction = (stateStream) => stateStream.map(s => ["state",s]).merge(actionSubject.map(action => ["action",action]))
// 	.loop((state, ...[type, details]) => 
// 		type === "state" ? 
// 			{seed: details, value: {state: details, action:noAction}} 
// 		: 
// 			{seed: state, value: {state, action: details}}, Immutable.Map())
// 	.skip(1)
	

// var transformStateStream = (stateStream) => streamReducers(stateAction(stateStream)).map(s => s.state)


// export default transformStateStream;


// var testState=most.periodic(500, Immutable.fromJS({liveData: {looping: 0}}));

// transformStateStream(testState).observe(s => console.log("transformStateTest", s));

// var testActionStream=most.from(Immutable.Map({type: "clickedBeat", beat: Math.floor(Math.random()*50)})).delay(5000);

// actionSubject.plug(testActionStream);
