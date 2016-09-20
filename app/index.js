

// require('babel-runtime/core-js/promise').default = require('bluebird');
// global.Promise = require("bluebird");
// var njstrace = require('njstrace').inject();
// Promise.onPossiblyUnhandledRejection(function (error) {
//     throw error;
// });

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import './app.global.css';


// import "./utils/fixWhenErrorLog";

// import './app.css';
// import './photontom.global.css';

// import DevTools from "./containers/DevTools";
import {mapStackTrace} from "sourcemapped-stacktrace";

import KeyWheel from "./keyWheel";
// import logger from "./utils/streamLog";


import Immutable from "immutable";

// import Dock from "react-dock";
import ObjectInspector from 'react-json-tree';


import actionSubject from "./api/actionSubject";

// actionSubject.observe(a => console.log("actionSubject", (a.toJS && a.toJS()) || a)).catch(e => console.error(e));

import * as most from 'most';

import importMetadata from "./utils/importAudioMetadata.js";

// import "./utils/recursiveMetadataImporter";

import keysToColors from "./api/keysToColors";


import PlayingTracks from "./playingTracksView";

import log from "./utils/streamLog";

import ProcessingStatus from "./processingStatus";
import CpuUsage from "./cpuUsage";

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


window.actionStream = actionSubject;
window.Imm = Immutable;
window.most = most;

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

import  "./api/oscMetadataServer";

class AppRenderer extends React.Component {
    render() {
      var state = this.props.state;  
      return <div>
            <div style={{ position: "fixed", bottom: "0px", right: "0px", backgroundColor: "rgba(0,0,0,0.1)" }}>
                <CpuUsage usage={state.getIn(["uiState", "cpuUsage"]) } />
            </div>
            <PlayingTracks availableTracks={state.get("tracks") } uiState={state.get("uiState") } />
            <KeyWheel tracks={state.get("tracks") } />
            { process.env["NODE_ENV"] !== "development" ?
                <div /> : <div> <ObjectInspector style={{ color: "white" }} data={state} initialExpandedPaths={["*", "*", "*"]} /> </div>
            }
        </div>;
    }
}
finalState.observe(state => {

    render(
        <AppRenderer state={state} />
     ,
        document.getElementById('root')
    )

})
.catch(e => {
    console.error(e);
    // console
    console.trace();
});

    // <ProcessingStatus state={state} uiState={state.get("uiState")} />
    // <ObjectInspector style={{color:"white"}} data={ state.toJS() } initialExpandedPaths={["*","*","*"]} />
