import React from "react";

import component2 from "./utils/immComponent";

import { Connector } from "./utils/createReactiveClass";

import * as most from "most";

import hold from "@most/hold";

import log from "./utils/streamLog";
import { ipcRenderer } from "electron";
import Subject from "./utils/subject";
// console.log("most",most);
const pjson = require("../package.json");

const platformURL = () => process.platform === "darwin" ?
  "https://www.dropbox.com/s/rtpz5p8oorkmbqh/VoodoohopLiveTools-mac.zip?dl=1" :
  "https://www.dropbox.com/s/pv611fs2uvdsd69/VoodoohopLiveTools-win.zip?dl=1";

const UpdateNotifier = Connector(component2(({updateResponse, downloadStatus}) => updateResponse ?
  (
    <div className="ui info message inverted ">

      <i className="close icon" onClick={cancelSubject.push}></i>
      <div className="header" style={{ marginBottom: "5px" }}>
        <h3>Update Available: <span style={{ color: "#aaa" }}>{updateResponse.version}</span></h3>
        {updateResponse.lastUpdateDescription}
      </div>
      <button className={`ui primary button tiny inverted ${downloadStatus && downloadStatus.start ? "disabled loading" : ""}`}
        onClick={() => {
          ipcRenderer.send("downloadUpdate", { url: platformURL() });
          // progressSubject.push({start:true});
        } }>

        Download
 </button>
    </div>)
  : null));

import fetch from "node-fetch";

const updateURL = "https://raw.githubusercontent.com/voodoohop/voodoohop-ableton-tools/master/package.json";

const cancelSubject = Subject();

const progressSubject = Subject();

ipcRenderer.on("downloadUpdateRes", (e, res) => {
  console.log("got", res);
  progressSubject.push(res);
  cancelSubject.push(res);
});

const updateResponse = hold(most.fromPromise(fetch(updateURL)).tap(log("got fetch res"))
  .flatMap(res => most.fromPromise(res.json())).tap(log("got fetch json"))
  .filter(jsonRes => jsonRes.version > pjson.version)
  .flatMapError(error => {
    console.error("getting new version error", error);
    return most.empty();
  })).merge(cancelSubject.constant(false));//.merge(progressSubject);

export default () => <UpdateNotifier updateResponse={updateResponse} downloadStatus={progressSubject} />;