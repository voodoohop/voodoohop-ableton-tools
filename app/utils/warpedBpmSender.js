import { oscOutput } from './oscInOut';

import combinedState from '../store/combinedState';

// import metadata from "../store/";

import log from './streamLog';

import * as most from 'most';

import { Map, fromJS } from 'immutable';

import bpmPitchChange from './bpmPitchChange';

const findWarpMarkerBpm = (warpMarkers, playingPosition) => {
  if (!warpMarkers)
    return null;
  const lastMarker = warpMarkers.findLast(warpMarker => warpMarker.get('beats') < playingPosition);
  return lastMarker && lastMarker.get("sourceBpm");
};

oscOutput.plug(combinedState
  .map(state =>
    state.get('tracks').map((track, trackId) =>
      ({ warpMarkers: track.getIn(['fileData', 'warpMarkers']), playingPosition: track.getIn(['liveData', 'playingPosition']), pitch: track.getIn(['liveData', 'pitch']) || 0, trackId })
    )
      .filter(({ warpMarkers, playingPosition, trackId }) => playingPosition !== undefined && warpMarkers !== undefined && trackId !== "selectedClip")
      .map(({ warpMarkers, playingPosition, trackId, pitch }) =>
        ({ bpm: bpmPitchChange(findWarpMarkerBpm(warpMarkers.get('warpMarkers'), playingPosition), pitch), trackId })
      )
      .filter(({ bpm }) => bpm !== undefined)
  ).skipStringifiedRepeats()
  .flatMap(w => most.from(w.toArray()))
  .tap(log('warpedBpmCombined'))
  .map(({ trackId, bpm }) => Map({ trackId, args: fromJS(["warpedBpm", bpm]) }))
);


// transmit if warp markers were saved
oscOutput.plug(combinedState
  .map(state =>
    state.get('tracks')
      .map((track, trackId) =>
        ({ trackId, saved: track.getIn(['fileData', 'warpMarkers', 'markersSaved'], "unknown") })
      )
  )
  .tap(ms => console.log("warpSavved", JSON.stringify(ms)))
  // .tap(log('warpSavedBeforeSkip2'))
  .skipStringifiedRepeats()
  .tap(ms => console.log("warpSavvedNoReps", JSON.stringify(ms)))

  .flatMap(w => most.from(w.toArray()))
  .filter(({ saved }) => saved !== "unknown")
  .tap(log('warpSaved'))
  .map(({ trackId, saved }) => Map({ trackId, args: fromJS(["warpSaved", saved ? 1 : 0]) }))
);
