
import diff from "immutablediff";

var trackState = (oscState) => oscState.loop((prev,next) => ({value: diff(prev,next), seed: next}),Immutable.List()).flatMap(diffs => 
	most.from(diffs.filter(diff => diff.get("op") === "add" || diff.get("op") === "replace")
					.map(diff => Immutable.Map({args: diff.get("value"), type: diff.get("path").split("/")[1]}))
	)
);


export default (playingTracks) => playingTracks.loop((prev,next) => ({value: diff(prev,next), seed: next}),Immutable.List()).flatMap(diffs => 
	most.from(diffs.filter(diff => diff.get("op") === "add")
					.map(diff => diff.get("path").split("/")[1])
					.map(trackId => 
						trackState(playingTracks.map(tracks => tracks.getIn([trackId,"liveData"])))
						.map(trackOscDiff => trackOscDiff.set("port", 4000+trackId))
					)
	)
).join();