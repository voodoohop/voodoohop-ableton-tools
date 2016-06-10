import React from 'react';
import component from "omniscient";
// import { dom } from 'react-reactive-class';
import most from "most";
import Immutable from "immutable";
// import Waveform from "./waveform";

import logger from "./utils/streamLog";
import { tree } from 'd3-state-visualizer';

import Waveform from "./waveform";
const viewboxWidth=1000, viewboxHeight=200

 

  
export default component(({uiState, state}) => 
  <div style={{backgroundColor:"lightGrey",opacity:0.1}}>
  

    <div className="ui container">
    <div className="ui content">
       <b>lastMetadata</b> {uiState.get("lastMetadataLoad")}<br/>
       <svg preserveAspectRatio="none"
					width={"300"}  height={"80"}
					viewBox={[0,0,viewboxWidth, viewboxHeight].join(" ")}><Waveform waveform={uiState.getIn(["lastMetadata","waveform"])} trackId="lastWform" /></svg>
        <small>{uiState.getIn(["lastMetadata","path"])}</small>
    </div>
    </div>
</div>
) 