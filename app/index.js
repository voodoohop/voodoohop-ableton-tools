// require('babel-runtime/core-js/promise').default = require('bluebird');
// global.Promise = require("bluebird"); var njstrace =
// require('njstrace').inject(); Promise.onPossiblyUnhandledRejection(function
// (error) {     throw error; });
import './utils/streamPrototypeExtensions';
import './utils/warpedBpmSender';

import React from 'react';
import { render } from 'react-dom';

import ReactHeight from "react-height";
import './app.global.css';

import KeyWheel from './keyWheel';

import Immutable from 'immutable';

// import Dock from "react-dock";
import ObjectInspector from 'react-json-tree';

import { parse } from "querystring";
import transit from 'transit-immutable-js';

// actionSubject.observe(a => console.log("actionSubject", (a.toJS && a.toJS())
// || a)).catch(e => console.error(e));

import './utils/importAudioMetadata.js';

// import "./utils/recursiveMetadataImporter";

import PlayingTracks from './playingTracksView';

import log from './utils/streamLog';
import UpdateNotifier from './updateNotifier';

let installImmutableDevTools = require('immutable-devtools');
console.log("installing immutable devtools extension");
installImmutableDevTools(Immutable);

import finalState from './store/combinedState';

import { uiStateStore } from './store';
import './api/oscMetadataServer';

import './utils/clipColorer';

import SplashScreen from './splashScreen';

import { ipcRenderer } from 'electron';

import debugModeInDev from "./debugMode";

import actionStream from './api/actionSubject';

const heightChanged = (height) => actionStream.push(Immutable.Map({ type: "containerHeightChanged", value: height }));

class AppRenderer extends React.Component {
    render() {
        const state = this.props.state;
        // console.log("size",state.get("tracks").size);

        const foundMasterPlugin = state.getIn(['tracks', 'selectedClip', 'liveData', 'deviceVersion']) >= 0.8;
        const trackPlugin = state.get('tracks') && state
            .get('tracks')
            .find((_, trackId) => trackId !== 'selectedClip');
        const foundTrackPlugin = trackPlugin && trackPlugin.getIn(['liveData', 'deviceVersion']) >= 0.8;
        // console.log("preUiState",state.get("uiState"));
        return foundMasterPlugin && foundTrackPlugin
            ?
            <ReactHeight onHeightReady={heightChanged}>
                <div>
                    {
                        state.getIn(["uiState", "showWaveforms"]) ?
                            <PlayingTracks
                                availableTracks={state.get('tracks')}
                                uiState={state.get('uiState')}
                            /> : null
                    }
                    {
                        state.getIn(["uiState", "showKeywheel"]) ?
                            <div
                                style={{
                                    width: '90%',
                                    left: '5%',
                                    position: 'relative'
                                }}
                            >
                                <KeyWheel keyNotation={state.getIn(['uiState', 'keyNotation'])} tracks={state.get('tracks')} />
                            </div> : null
                    }
                    {process.env.NODE_ENV !== 'development' || !debugModeInDev || true
                        ? <div />
                        : <div>
                            <ObjectInspector
                                style={{
                                    color: 'white'
                                }}
                                data={state}
                                initialExpandedPaths={['*', '*', '*']}
                            />
                        </div>
                    }
                </div>
            </ReactHeight>
            : <SplashScreen
                foundMasterPlugin={foundMasterPlugin}
                foundTrackPlugin={foundTrackPlugin}
            />;
    }
}

const queryParams = parse((window.location.search || "").replace("?", ""));
console.log("queryparams", queryParams);
const supportsVibrancy = parseInt(queryParams.supportsVibrancy) === 1;
finalState.observe((state) => {
    render(
        <div style={{ backgroundColor: supportsVibrancy ? "transparent" : "black", padding: "8px" }}>
            <UpdateNotifier />
            <AppRenderer state={state} />
        </div>, document.getElementById('root'));
}).catch((e) => {
    console.error(e);
    // console
    console.trace();
});
uiStateStore
    .skipImmRepeats()
    .map(transit.toJSON)
    .observe(jsonState => ipcRenderer.send('state', jsonState));
// <ObjectInspector style={{color:"white"}} data={ state.toJS() }
// initialExpandedPaths={["*","*","*"]} />
