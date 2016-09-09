import log from "../utils/streamLog";

import diff from "immutablediff";
import Immutable from "immutable";
import * as most from 'most';

function doDiff(stream,options) {
       return stream.map(a => diff(a.get("original"),a.get("compare")))
		// .tap(log("oscDiffDiff"))
		.flatMap(diffs => {
			// console.time("diffs0",diffs[0].toJS());
			// console.log("diffs0",diffs[0].toJS());
			var 	mapped=	// .map(diffs => (
			diffs[0]//.filter(diff =>/* diff.get("op") === "add" ||*/ diff[0].get("op") === "replace")
					.map(diff => Immutable.Map({
						operation:diff.get("op"), 
						data: diffs[1],
						value: Number.isNaN(Number(diff.get("value"))) ? diff.get("value") : 
							Number(diff.get("value")), 
						trackId:diff.get("path").split("/")[1], 
						type: diff.get("path").split("/")[2]})
					).map(d => d.set("prevData", diffs[2]))
					// .map(d=> d.set("prevValue",d.getIn(["prevData").get(d.get("type"))))

					
					// .map(diff => diff.set("prevValue", diff.get("data").getIn([])))
			return options.grouped ? most.of(Immutable.
			fromJS(mapped)):most.from(mapped);
			// most.from(4
		})
		.tap(log("oscDiffDiff2"));
}

var trackState = (oscState, options={}) => 
	doDiff(oscState.loop((prev,next) => {
		// console.log("diffing",prev.toJS(),next.toJS());
			return ({value: [Immutable.Map({original: prev, compare: next}), next, prev], seed: next});
		},Immutable.Map())
		.skip(1),options);


export default trackState;

export function oscDiff2(a,b,options={}) {
    return doDiff(most.combine((original,compare) => Immutable.Map({original,compare}),a,b),options);    
}