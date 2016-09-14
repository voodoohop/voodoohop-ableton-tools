
import {livedataStore, metadataStore, uiStateStore, midiClipStore, remoteClipUpdater, globalHarmonyStore} from ".";

import Immutable from "immutable";

import {generateMidiMergeEventHack} from "./mididataLinker";

import {combine} from "most";

import log from "../utils/streamLog";

var appState = combine((liveData, metaData, midiData, uiState, remoteClipUpdater) =>
    Immutable.Map({
        uiState, tracks: liveData
            .map((data, trackId) => {
                // console.log("track combining",data.toJS(),metaData.toJS());

                return Immutable.Map({
                    liveData: data, fileData: (data.get("file_path") ?
                        metaData.get(data.get("file_path")) : null),
                    remoteClipUpdater: remoteClipUpdater.get(trackId),
                    midiData: midiData.get(trackId) || null, trackId: trackId
                })
                    .filter(v => v !== null && v !== undefined)
            })
    })
    , livedataStore, metadataStore, midiClipStore, uiStateStore, remoteClipUpdater)


import transposeStateKey from "../utils/transposeStateKey";

const debouncedState = appState.throttledDebounce(50);
const finalState = transposeStateKey(debouncedState)
    .tap(log("state")).multicast();


generateMidiMergeEventHack(finalState);

export default finalState;