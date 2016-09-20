import React from 'react';
import component from "./utils/immComponent";
// import { dom } from 'react-reactive-class';
import * as most from 'most';
import Immutable from "immutable";
// import Waveform from "./waveform";

import logger from "./utils/streamLog";

import {VictoryPie,VictoryLabel} from "victory";
import transposedNote from "./utils/transposedNote";
import keysToColors from "./api/keysToColors";
import openKeySequence from "./api/openKeySequence.js";

import tinyColor from "tinycolor2";

const labelProps={};

const innerRadius = 85;
const labelRadius=105;

const radiusProp=innerRadius/labelRadius;

const ConnectNodes = ({start, end, thickness, transpose}) =>{
    const gradientId = `gradient_${start.datum.note}_${end.datum.note}`;
    return <g> 
    <linearGradient id={gradientId} x1={start.x*1/radiusProp} y1={start.y*1/radiusProp} x2={end.x*radiusProp} y2={end.y*radiusProp} gradientUnits="userSpaceOnUse">
     <stop offset="0%" style={{stopColor:start.datum.color, stopOpacity:0.8}}  />
     <stop offset="100%" style={{stopColor:end.datum.color,stopOpacity:0.6}}  />
     </linearGradient>
        <path id={"path_"+gradientId} fill="transparent" d={`M ${start.x*radiusProp} ${start.y*radiusProp} Q 0 0 ${end.x*radiusProp} ${end.y*radiusProp}`}  stroke={`url(#${gradientId})`} strokeWidth={12*thickness} />
    <text  fontFamily="Verdana" fontSize="10px" fill="white" x={55} dy={5}>
    <textPath href={"#path_"+gradientId} >
    {""+(transpose>0?"+":"")+transpose}&rarr;
    </textPath>
  </text>

    </g>};

class KeyLabel extends React.Component {

  renderLabel() {
      labelProps[keysToColors(this.props.datum.note)] = this.props;
     
    //   console.log("labelprops",this.props,labelProps);
      const data = this.props.datum;
      const scaleProp = 1.5;
    var textX=this.props.x*scaleProp;
    var textY=this.props.y*scaleProp;
    return <g>{data.playing ? 
        [-1,1]
            .map(transpose => [transpose, keysToColors(transposedNote(data.note,transpose))])
            .map(([transpose,color]) => [transpose,labelProps[color]])
            .filter(([transpose,d]) => d)
            .map(([transpose,destNote]) => <ConnectNodes key={`conn_${data.note}_${destNote.datum.note}`} start={this.props} end={destNote} thickness={1/Math.abs(transpose)} transpose={transpose} />)
        : null
        }
        <text {...this.props} style={{strokeWidth: "0.4px", stroke: "none", fill: "black",  fontFamily:"Arial", fontSize:"10px"}}>
            {data.keyLabel}
        </text>
        {data.playing && data.artist ?  
            <text {...this.props} x={textX} y={textY+0} style={{strokeWidth: "0.4px", stroke: "none", fill: "rgb(250,250,250)",  fontFamily:"Arial", fontSize:"10px"}}> 
            {data.artist}
            </text>
      
        : null}
                {data.playing && data.title ?  
            <text {...this.props} x={textX} y={textY+12} style={{strokeWidth: "0.4px", stroke: "none", fill: "rgb(210,210,210)",  fontFamily:"Arial", fontSize:"9px"}}> 
            {data.title}
            </text>
      
        : null}
        </g>;
  }

  render() {
    return this.renderLabel();
  }
}

const liveDataInterested = ["transposedKey", "playing", "name"]

function trackPlaying(tracks,note) {
    return tracks.find((track) => keysToColors(track.getIn(["liveData","transposedKey"])) == keysToColors(note) && track.getIn(["liveData","playing"]));
}

const getNoteColor = note => tinyColor(keysToColors(transposedNote(note,0)))./*lighten(10).*/toHexString();


const DynamicKeyWheel = component(({tracks}) => {
console.log("DynamicKeyWheel tracks",tracks);    
return <VictoryPie innerRadius={innerRadius} width={350} 
    labelRadius={labelRadius}
    animate={{duration:500}}
    data={
        openKeySequence.map(note => 
        {
            const playing = trackPlaying(tracks,note);
            const name = playing ? playing.getIn(["fileData","id3Metadata","title"]) || playing.getIn(["liveData","name"]): null;
            const artist = playing ? playing.getIn(["fileData","id3Metadata","artist"]) :null;
            return   {
                x: note,
                y: playing ? 2:1,
                note,
                playing: playing ? true : false,
                color: getNoteColor(note),
                keyLabel:""+note+"/"+transposedNote(note,9)+"m",
                title: playing && name.slice(0,Math.min(name.length,20)) || null,
                artist: playing && artist.slice(0,Math.min(name.length,20)) || null
        }})
    }
    
    style={{labels:{
                fontWeight: (data)=>data.y > 1 ? "bold":"normal", 
                fontFamily:"arial",
                fill: data => getNoteColor(data.note),//'rgb(100,100,100)',
                // padding:"10px",
                fontSize:"9px",
                opacity:1, 
                strokeWidth:(data) => data.y > 1 ? "1px":"0.4px",
                // stroke:"white"
            },
            
            data:{
                strokeWidth:"1.5px",
                stroke:(data) => data.playing ? "rgba(255,255,255,0.8)":"rgba(0,0,0,0)"
            }}}
    labelComponent={
        <KeyLabel  textAnchor="middle" verticalAnchor="middle" />
       
      
        // <text />
    }        
    colorScale={openKeySequence.map(getNoteColor)}

/>});


export default component(({tracks}) => <DynamicKeyWheel tracks={
    tracks.map(track => 
        track.update("liveData",(liveData) => 
            liveData.filter((v,k) => liveDataInterested.includes(k))
        )
    )
} />);