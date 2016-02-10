
import actionStream from "../api/actionSubject";

import most from "most";

import Immutable from "immutable";

import livedataStore from "./livedataStore";
import uiStateStore from "./uiStateStore";
// import {addLiveDataSource} from "./livedataStore";

import {oscDiff2} from "../utils/oscStateDiff";

import log from "../utils/streamLog";

import Subject from "../utils/subject";

import throttledDebounce from "../utils/throttledDebounce";
import {oscOutput} from "../utils/oscInOut";
// most.combine((tracks,uiState) => tracks.filter((v,trackId)=> uiState.get("groupedTracks").includes(parseInt(trackId))),livedataStore,uiStateStore)
// .observe(log("oscGrouped"));
// var groupedTracksState = most.combine((tracks,uiState) => tracks.filter((v,trackId)=> uiState.get("groupedTracks").includes(parseInt(trackId))),livedataStore,uiStateStore);

console.log("liveDataStore",livedataStore);


// export clickedLoopCommands;

// var groupedChangeRequest = ( groupedChangeRequestDiff.sample((diff,uiState, livedata) => 
// 	(uiState.get("groupedTracks").take(1).includes(parseInt(diff.get("trackId")))) 
// 	? 
// 		uiState.get("groupedTracks").keySeq().reduce((data, groupedTrackId) => 
// 			data.updateIn([groupedTrackId, diff.get("type")], ()=> diff.get("value")), livedata
// 		)
// 	: livedata
// ,groupedChangeRequestDiff, uiStateStore, livedataStore))
// .skipRepeats()
// .tap(log("groupedData"))

// .map(cr => cr.get("data").map((o, key) => key === cr.get("trackId") ? o : o.set(cr.get("type"), cr.get("value"))))
// .map(cr => Immutable.Map({type:"groupedTrackChange", data: cr}));

//.map(d => d.set("attribute", d.get("type")).set("type","groupedTrackChange"))


	
	
	
// var groupedCommands = most.combine((changeTo,oscState) => 
// most.from(
// 	oscState
// 	.filter((state,trackId)=> trackId != changeTo.get("trackId") && changeTo.get("value") != state.get(changeTo.get("attribute")))
// 	.toArray()
// 	.map(oscState => changeTo.set("trackId",oscState.get("trackId"))
// 	// Immutable.fromJS(
// 	// 	{trackId: oscState.get("trackId"), 
// 	// 	command: changeTo.get("attribute"), changeTo.get("value")]
// 	// })
// 	))	
// ,groupedChangeRequest,groupedTracksState.sampleWith(groupedChangeRequest))

// .map(s => Immutable.Map({trackId: }))
// .tap(log("preFlatMap"))

// .flatMap(s => s)
// .skipRepeats()
// .tap(log("postFlatMap"));
// var mergedChanges = most.merge(clickedLoopCommands, groupedCommands);

// addLiveDataSource(clickedLoopCommands);

// function concatOscCmd(cmdList, cmd) {
//     console.log("cmd before",cmd.toJS());
// 	var trackId=parseInt(cmd.get("trackId"));
	
// 	var prevEntry = cmdList.findEntry(c => c.get("temporary") && c.get("type") === cmd.get("type") && parseInt(c.get("trackId")) == trackId);
// 	if (prevEntry) {
// 		console.log("replacing ",prevEntry[0], prevEntry[1].toJS());
// 		let res= cmdList.set(prevEntry[0], cmd);
// 		console.log("after",res.toJS());
// 		return res;
// 	}
// 	console.log("cmdList before", cmdList.toJS());
// 	var prevData = cmdList.size > 0 ? cmdList.last().getIn(["data",trackId]) : cmd.getIn(["prevData",trackId]);
// 	var prevLoopEnd = prevData.get("loop_end",0);
// 	var prevLoopStart= prevData.get("loop_start",8192);
// 	var value = cmd.get("value");
// 	var type = cmd.get("type");
// 	var loopCommand= Immutable.List();
// 	var nextData =cmd.get("data");
// 	if (type === "loop_start" &&  value >= prevLoopEnd)
// 		loopCommand = loopCommand.push(cmd.merge({
// 				value: 8192,
// 				trackId,
// 				type: "loop_end",
// 				temporary: true	
// 			})
// 		);	
// 	if (type === "loop_end" &&  value <= prevLoopStart)
// 		loopCommand = loopCommand.push(
// 			cmd.merge({
// 				value: 0, trackId,
// 				type: "loop_start",
// 				temporary: true,
// 			})
// 		);
// 	if (loopCommand.size >= 1 && !cmdList.find(c => c.get("type") === "looping"))
// 		loopCommand = Immutable.List([cmd.merge({
// 				value: 1,
// 				trackId : trackId,
// 				type: "looping"
// 			})]).concat(loopCommand);
			


// 	// if (!prevEntry) {
// 		loopCommand = loopCommand.push(cmd);
// 	//,cmdList.toJS(), "after",cmdList.concat(loopCommand).toJS());
	
	
// 	cmdList = cmdList.concat(loopCommand);
// 		console.log("cmdList after", cmdList.toJS());

	
// 	return cmdList;
// }


var clickedLoopAction = 
actionStream.tap(log("actionStream")).filter(a => a.get("type") === "clickedBeat");


export var clickedLoopCommands = clickedLoopAction.map((action)=>
	{	
		// console.log("tracks",tracks.toJS());
        var newStart = Math.floor(action.get("beat")/16)*16;
        var newEnd = (Math.floor(action.get("beat")/16)+1)*16;
    	var commands= //(newStart > liveData.getIn([action.get("trackId"),"loop_end"])) ?		
		[
			["looping",1],
            // ["loop_start",-4096],
            // ["loop_end",4096],
			["loop_end",newEnd],
			["loop_start",newStart] 
		]
        // :
        // [
		// 	["looping",1],
		// 	["loop_start",newStart], 
		// 	["loop_end",newEnd]
		// ];
            
		return most.from(commands.map(c=>Immutable.Map({trackId: Number(action.get("trackId")), type: c[0], value:c[1]})));// tracks.update(action.get("trackId"), track => commands.reduce((track, command) => track.set(command[0], command[1]), track))
	}).flatMap(f=>f).tap(log("clickedLoopCommands"));
    
    



var hashMe= a => ""+a.get("trackId")+"_"+a.get("value")+"_"+a.get("type");

// addLiveDataSource(groupedChangeRequest);

// addLiveDataSource(clickedLoopCommands);

var groupAttributes = Immutable.Seq.of("loop_start","loop_end","looping","pitch","gain");

var groupedLiveData = livedataStore.combine((liveData, uiState)=>  liveData.filter((v,trackId)=> uiState.get("groupedTracks").contains(trackId)).map((track,trackId) => {
    console.log("trk",track.toJS());
    return track.filter((_,k) => groupAttributes.contains(k));
    }),uiStateStore);

function tomDiff(prev,next,path=Immutable.List()) {
    if (prev===undefined)
        prev= Immutable.Map();
    // console.log("diffing1",prev,next);
    // console.log("diffing", prev.toJS ? prev.toJS() :prev, next.toJS ? next.toJS() :next );
    var res=  prev === next ?
        most.empty()
    :
        most.from(next.keySeq().filter(k => next.get(k) !== prev.get(k)).toArray())
        .flatMap(k => {
            let res = next.get(k).keySeq ? tomDiff(prev.get(k), next.get(k),path.concat([k])) : most.of(Immutable.Map({path:path.concat([k]), value:next.get(k), previousValue:prev.get(k)}));
            return res;
        });
    // console.log("res",res);
    return res;
};

var grouedOscCommands = groupedLiveData
.combinePrevious(tomDiff)
// .tap(log("groupedLiveData1"))
.flatMap(f => f)
.combine((groupDiff, uiState) => most.from(uiState.get("groupedTracks")
.map(trackId => Immutable.Map({trackId,path:groupDiff.get("path"), type: groupDiff.getIn(["path",1]), value:groupDiff.get("value")}))
.toArray())
,uiStateStore)
.flatMap(f => f)
.filter(f => f.get("value") != 4096 && f.get("value")!= -4096)
.tap(log("groupedLiveData"))
// .drain();


var mergedCommands = clickedLoopCommands
.merge(grouedOscCommands)
.combine((oscCommand, liveData)=> {
    var type = oscCommand.get("type");
    var trackId =oscCommand.get("trackId");
    var value = oscCommand.get("value");
    var prevValue = liveData.getIn([trackId, type]);
    if (prevValue == value)
        return most.empty();
    if (type !== "loop_start" && type !== "loop_end")
        return most.of(oscCommand);
    var command = most.of(oscCommand);
    if (type === "loop_start" && liveData.getIn([trackId,"loop_end"])<value)
       // cmds.push(Immutable.Map({trackId, type:"loop_end", value: value+256}));
       command = command.delay(200);
    if (type === "loop_end" && liveData.getIn([trackId,"loop_start"])>value)
//        cmds.push(Immutable.Map({trackId, type:"loop_start", value: value-256}));
       command = command.delay(200);
 
 //   cmds.push(oscCommand);
    return command;
}
,livedataStore)
.flatMap(f=>f);


var store = mergedCommands
// .filter(f => f.get("type"))
// .tap(log("mergedCommands"))
.map(tc => 
		Immutable.Map({
			trackId: parseInt(tc.get("trackId")),
			args: Immutable.List([tc.get("type"), tc.get("value")])		
		})
	).tap(log("oscOutputcommand"));
    


oscOutput.plug(store.tap(log("plugged")));

export default store;
 
// oscDiff2(
// 	// clickedLoopCommands, groupedChangeRequest,
// // livedataStore
// // groupedChangeRequestDiff(
//     liveDataInAbleton,livedataStore
 
//  ,{grouped:true})
// //  .skip(1)

// 	// .merge(oscDiff(groupedChangeRequest, {grouped:true}))
// // .flatMap(diff => )
// .tap(log("diff2.2"))
// .map(diff2 => diff2
	
// 	.filter(diff=> (diff.get("operation")=== "replace" || diff.get("operation")==="add") && diff.get("type") && diff.get("type") !== "playingPosition" )
	
// 	.reduce((loopCommands,cmd) => 
// 		loopCommands.update(cmd.get("trackId"), (prevList) => concatOscCmd(prevList || Immutable.List(), cmd))
// 	, Immutable.Map())//.flatten()
// 	// .map(log("diff3"))
// )

// .tap(log("diff334"))
// .flatMap(a => most.from(a.flatten(1).toArray()))
// .skipRepeatsWith((a,b) => hashMe(a) === hashMe(b))
// // .flatMap(c => most.from(c.entrySeq().map(e => e[1])))
// // .filter(diffAccum => diffAccum.size>0)
// // .tap(log("diff444"))
// // .flatMap(commands => {
// // 	// most.from([])
// // 	var loop_start = loopCommands.get("loop_start");
// // 	var loop_end = loopCommands.get("loop_end");
// // 	var cmds = [];
// // 	if (loop_start.get("value") > loop_end.get("prevVal"))
// // 		cmds = cmds.concat([loop_end, loop_start]);
// // 	else
// // 		cmds = cmds.concat([loop_start, loop_end]);
// // 	return most.from(cmds);			
// // })
// // .msp(diff2 =>)
// // .flatMap(diff => diff.get("type") === "loop_start" ? most.from([diff.set("type","loop_end").set("value",8196),diff]).zip(m => m, most.periodic(3).take(2))  
// // 				: (diff.get("type")==="loop_end" ?  most.from([diff.set("type","loop_start").set("value",-8196)]).zip(m => m, most.periodic(3).take(2)) : most.of(diff)) )
// // .flatMap(o => most.from(o.entrySeq().map(e=>e[1])))
// // .flatMap(o => most.from(o.toArray()))//.entrySeq().map(e=>e[1])))
// .tap(log("preOscOut"))
// .filter(o => o.get("trackId") && o.get("type") && o.get("operation") !== "add")
// .tap(log("preOscOut"))
// .map(tc => 
// 		Immutable.Map({
// 			trackId: parseInt(tc.get("trackId")),
// 			args: Immutable.List([tc.get("type"), tc.get("value")])		
// 		})
// 	).tap(log("oscOutputcommand")).multicast()
// 	;
		
