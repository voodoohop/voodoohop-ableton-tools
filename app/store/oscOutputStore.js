
import actionStream from "../api/actionSubject";

import most from "most";

import Immutable from "immutable";
export default actionStream.filter(a => a.get("type") === "clickedBeat")
.flatMap(action => 
	most.from(		
		[
			["looping",1],
			["loop_start",Math.floor(action.get("beat")/16)*16], 
			["loop_end",Math.ceil(action.get("beat")/16)*16]
		].map(command =>
		Immutable.Map({
			trackId: action.get("trackId"),
			port: 4000+action.get("trackId")
						
		}).set("args", Immutable.List(command)))
	));
		
