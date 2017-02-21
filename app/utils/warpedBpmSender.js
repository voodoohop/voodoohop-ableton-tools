import { oscOutput } from './oscInOut';

import combinedState from '../store/combinedState';

// import metadata from "../store/";

import log from './streamLog';

import * as most from 'most';

import { Map, fromJS } from 'immutable';

// import { warpMarkerBeatMap } from "../transforms/warpMarkerMapper";


// warpMarkerBeatMap(most.from(warpMarkers.get("warpMarkers").toArray()))

oscOutput.plug(combinedState
  .flatMap(state =>
    most.from(state.get('tracks').map((track, trackId) =>
      ({ warpMarkers: track.getIn(['fileData', 'warpMarkers']), playingPosition: track.getIn(['liveData', 'playingPosition']), trackId })
    ).toArray())
      .filter(({warpMarkers, playingPosition }) => playingPosition !== undefined && warpMarkers !== undefined)
      .map(({ warpMarkers, playingPosition, trackId }) =>
        ({ bpm: warpMarkers.get('warpMarkers').findLast(warpMarker => warpMarker.get('beats') < playingPosition).get("sourceBpm"), trackId })
      )
  )
  .tap(log('warpedBpmCombined'))
  .map(({ trackId, bpm }) => Map({ trackId, args: fromJS(["warpedBpm", bpm]) }))
);

