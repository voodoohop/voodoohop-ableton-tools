

// require('babel-runtime/core-js/promise').default = require('bluebird');
// global.Promise = require("bluebird");
// var njstrace = require('njstrace').inject();
// Promise.onPossiblyUnhandledRejection(function (error) {
//     throw error;
// });
import "./utils/streamPrototypeExtensions";

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import './app.global.css';

import {mapStackTrace} from "sourcemapped-stacktrace";

import KeyWheel from "./keyWheel";


import Immutable from "immutable";

// import Dock from "react-dock";
import ObjectInspector from 'react-json-tree';

import transit from 'transit-immutable-js';


import actionSubject from "./api/actionSubject";

// actionSubject.observe(a => console.log("actionSubject", (a.toJS && a.toJS()) || a)).catch(e => console.error(e));

import * as most from 'most';

import importMetadata from "./utils/importAudioMetadata.js";

// import "./utils/recursiveMetadataImporter";

import keysToColors from "./api/keysToColors";


import PlayingTracks from "./playingTracksView";

import log from "./utils/streamLog";
import UpdateNotifier from "./updateNotifier";

var installDevTools = require("immutable-devtools");

import createReactiveClass from "./utils/createReactiveClass";

installDevTools(Immutable);



// RemoteDev Extension: Apply default options & start remotedev-server
//  require('remotedev-extension')({
//    port: 5678,
//    runserver: true
//  });
// import elasticsearch from 'elasticsearch';
// var client = new elasticsearch.Client({
//   host: 'http://localhost:9200'
// });



// var remote = require("remote");
// var BrowserWindow = remote.require("browser-window");
// var windows = BrowserWindow.getAllWindows();
// console.log("windows",windows);
// Look for the popup window and then...
// windows[1].openDevTools();


// window.actionStream = actionSubject;
// window.Imm = Immutable;
// window.most = most;

// function unhandledRejectionsWithSourceMaps(Promise) {
// 	Promise.onPotentiallyUnhandledRejection = function(r) {
// 		// setTimeout(function() {
// 			if(!r.handled) {
// 				throw r.value;
// 			}
// 		// }, 0);
// 	};

// 	Promise.onPotentiallyUnhandledRejectionHandled = function(r) {
// 		setTimeout(function() {
// 			console.log('Handled previous rejection', String(r.value));
// 		}, 0);
// 	};
// }
// unhandledRejectionsWithSourceMaps(when.Promise);
// var storyboard = require("storyboard");
// var wsServer = require("storyboard/lib/listeners/wsServer");
// storyboard.addListener(wsServer,{port:8090});

import finalState from "./store/combinedState";

import "./api/oscMetadataServer";

import "./utils/clipColorer";

import SplashScreen from "./splashScreen";

import {ipcRenderer} from "electron";

class AppRenderer extends React.Component {
    render() {
        const state = this.props.state;
        // console.log("size",state.get("tracks").size);


        const foundMasterPlugin = state.getIn(["tracks","selectedClip"]) ? true : false;
        const foundTrackPlugin = state.get("tracks") && state.get("tracks").find((_,trackId) => trackId !== "selectedClip") ? true:false;
        // console.log("preUiState",state.get("uiState"));
        return foundMasterPlugin && foundTrackPlugin ? 
            <div>
            <PlayingTracks availableTracks={state.get("tracks") } uiState={state.get("uiState") } />
            <div style={{ width: "90%", left: "5%", position: "relative" }}>
                <KeyWheel uiState={state.get("uiState")} tracks={state.get("tracks")}  />
            </div>
            { process.env["NODE_ENV"] !== "development" ?
                <div /> : <div> <ObjectInspector style={{ color: "white" }} data={state} initialExpandedPaths={["*", "*", "*"]} /> </div>
            }
        </div> :
        <SplashScreen foundMasterPlugin={foundMasterPlugin} foundTrackPlugin={foundTrackPlugin} />;
        
    }
}
finalState.observe(state => {
    ipcRenderer.send("state", transit.toJSON(state));
    render(
        <div>
        <UpdateNotifier />
        <AppRenderer state={state} />
        </div>
        ,
        document.getElementById('root')
    )

})
    .catch(e => {
        console.error(e);
        // console
        console.trace();
    });

    // <ObjectInspector style={{color:"white"}} data={ state.toJS() } initialExpandedPaths={["*","*","*"]} />
