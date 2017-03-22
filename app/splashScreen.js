import React from "react";

import component2 from "./utils/immComponent";

import { remote, ipcRenderer } from "electron";

import path from "path";
const getResourcePath = (filename) => (process.env["NODE_ENV"] === "development" &&
  path.normalize(path.dirname(process.mainModule.filename) + "/..") + "/" + filename) || process.resourcesPath + "/" + filename;


const getDraggableVoodoo = ({message, amxdPath, disabled = false}) => <div className={`ui segment inverted vertical ${disabled ? "disabled" : ""}`}>
  <img style={{ WebkitAppRegion: "no-drag" }}
    onDragStart={(event) => {
      event.preventDefault();
      ipcRenderer.send('dragStart', {
        maxForLiveDevice: "track",
        path: getResourcePath(amxdPath),
        icon: getResourcePath("voodoohop_transparent_black_icon.png")
      });
      // console.log("dragStart",event); 
    }
    } className={`ui centered image ${disabled ? "" : "hoverOpaque"}`} width="70" src="../images/voodoohop_transparent_white.png" />
  <div className="ui pointing label inverted small" style={{ background: "none", border: "1px solid white" }}>
    {message}
  </div>
</div>;


export default component2(({foundMasterPlugin, foundTrackPlugin}) =>
  <div>
    <div className="ui inverted text container center aligned">
      <h2 className="ui header inverted">Voodoohop Live Tools</h2>
      {getDraggableVoodoo({ message: "Drag to tracks you want to monitor", amxdPath: "Voodoohop Track Sender.amxd", disabled: foundTrackPlugin })}
      {getDraggableVoodoo({ message: "Drag to your master track", amxdPath: "Voodoohop Live Tools Master.amxd", disabled: foundMasterPlugin })}
    </div>
    <div className="ui icon inverted warning message ">
      <img className="ui mini image" src="../images/live_logo.png" />
      <div className="content" style={{ padding: "4px" }} >
        {foundMasterPlugin ? "Waiting for track to monitor..." : (foundTrackPlugin ? "Waiting for master plugin..." : "Awaiting connection to Live...")}
      </div>
    </div>
  </div>);




            //   <h2 className="ui header">Dogs Roles with Humans</h2>
            //     <p>blabla</p>
            //     <p></p>