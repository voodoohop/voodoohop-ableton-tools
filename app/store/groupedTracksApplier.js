import log from "../utils/streamLog";
import Immutable from "immutable";
import uiStateStore from "./uiStateStore";

export default (dataInput) => dataInput
.tap(log("groupedChange1"))

// most.empty()
	.combine((data, uiState) => {
		var masterTrackId=uiState.get("groupedTracks").first();
        if (masterTrackId === undefined)
            return Immutable.Map({data});
		console.log("masterTrackId",masterTrackId);
		return Immutable.Map({master: data.get(masterTrackId).filter((v,k)=>k.startsWith("loop")),slaves: uiState.get("groupedTracks").delete(masterTrackId), data});//.filter((e) => ("loop")).toList();
	}, uiStateStore/*.filter(ui => ui.get("groupedTracks").size>1)*/)
    .tap(log("groupedChange2"))
    // .filter(d=>d!==undefined)
    
//    most.empty() .startWith(Immutable.Map({master: null, slaves: Immutable.Set()}))
    
    .map((d) => 
       !d.has("master") 
       ? d.get("data")
       : d.get("data").mapEntries((entry) => {
        var trackId=entry[0];
        var data = entry[1];
        console.log("datadata",data);
        return d.get("slaves").has(trackId) 
            ? [trackId, data.mergeDeep(d.get("master"))]
            : [trackId,data];   
        }))
    .tap(log("groupedChange"));