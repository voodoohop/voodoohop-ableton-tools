import { oscOutput } from './oscInOut';

import combinedState from '../store/combinedState';

// import metadata from "../store/";

import log from './streamLog';

import * as most from 'most';

import { Map, fromJS } from 'immutable';

import bpmPitchChange from './bpmPitchChange';
// import { warpMarkerBeatMap } from "../transforms/warpMarkerMapper";


// warpMarkerBeatMap(most.from(warpMarkers.get("warpMarkers").toArray()))
const findWarpMarkerBpm = (warpMarkers, playingPosition) => {
  const lastMarker = warpMarkers.findLast(warpMarker => warpMarker.get('beats') < playingPosition);
  return lastMarker && lastMarker.get("sourceBpm");
};

oscOutput.plug(combinedState
  .flatMap(state =>
    most.from(state.get('tracks').map((track, trackId) =>
      ({ warpMarkers: track.getIn(['fileData', 'warpMarkers']), playingPosition: track.getIn(['liveData', 'playingPosition']), pitch: track.getIn(['liveData', 'pitch']) || 0, trackId })
    ).toArray())
      .filter(({warpMarkers, playingPosition }) => playingPosition !== undefined && warpMarkers !== undefined)
      .map(({ warpMarkers, playingPosition, trackId, pitch }) =>
        ({ bpm: bpmPitchChange(findWarpMarkerBpm(warpMarkers.get('warpMarkers'), playingPosition), pitch), trackId })
      )
      .filter(({ bpm }) => bpm !== undefined)
  )
  .tap(log('warpedBpmCombined'))
  .map(({ trackId, bpm }) => Map({ trackId, args: fromJS(["warpedBpm", bpm]) }))
);

