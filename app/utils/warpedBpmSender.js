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

