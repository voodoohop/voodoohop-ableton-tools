
import {livedataStore, metadataStore, uiStateStore, midiClipStore} from ".";

import Immutable from "immutable";

import {generateMidiMergeEventHack} from "./mididataLinker";

import {combine} from "most";

import log from "../utils/streamLog";

const tracksState = combine((liveData, metaData, midiData) =>
  liveData.map((data, trackId) => {
            //  console.log("track combining",data.toJS(),metaData.toJS());
                
                return Immutable.Map({
                    liveData: data, fileData: (data.get("file_path") ?
                        metaData.get(data.get("file_path")) : null),
                    // remoteClipUpdater: remoteClipUpdater.get(trackId),
                    midiData: midiData.get(trackId) || null, trackId: trackId
                })
                    .filter(v => v !== null && v !== undefined)
            })
    
    , livedataStore, metadataStore, midiClipStore)
    .startWith(Immutable.Map());
    

const appState = combine((tracks,uiState) => Immutable.Map({tracks,uiState}), tracksState, uiStateStore)

import transposeStateKey from "../utils/transposeStateKey";

const debouncedState = appState.throttledDebounce(30);
const finalState = transposeStateKey(debouncedState)
    .tap(log("state")).multicast();


generateMidiMergeEventHack(finalState);

// finalState.observe(log("finalState"));

export default finalState;