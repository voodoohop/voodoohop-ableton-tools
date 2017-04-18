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

import { Connector } from "./utils/createReactiveClass";

import debugModeInDev from "./debugMode";

import actionStream from './api/actionSubject';

const heightChanged = (height) => actionStream.push(Immutable.Map({ type: "containerHeightChanged", value: height }));

class AppRenderer extends React.Component {
    render() {
        const state = this.props.state;
        // console.log("size",state.get("tracks").size);

        const foundMasterPlugin = state.getIn(['tracks', 'selectedClip'])
            ? true
            : false;
        const foundTrackPlugin = state.get('tracks') && state
            .get('tracks')
            .find((_, trackId) => trackId !== 'selectedClip')
            ? true
            : false;
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
                    {process.env.NODE_ENV !== 'development' || !debugModeInDev
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
finalState.observe((state) => {
    render(
        <div>
            <UpdateNotifier />
            <AppRenderer state={state} />]
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
