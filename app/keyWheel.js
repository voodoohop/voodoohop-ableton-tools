import React from 'react';
import component from "./utils/immComponent";
import component2 from "omniscient";
// import { dom } from 'react-reactive-class';
import * as most from 'most';
import Immutable from "immutable";
// import Waveform from "./waveform";

import logger from "./utils/streamLog";

import {VictoryPie,VictoryLabel,Slice,VictoryAnimation} from "victory";
import transposedNote from "./utils/transposedNote";
import keysToColors from "./api/keysToColors";
import openKeySequence from "./api/openKeySequence.js";

import tinyColor from "tinycolor2";

const labelProps={};

const innerRadius = 87;
const labelRadius=105;

const radiusProp=innerRadius/labelRadius;

const ConnectNodes = ({start, end, thickness, transpose}) =>{
    const gradientId = `gradient_${start.datum.note}_${end.datum.note}`;
    return <g> 
    <linearGradient id={gradientId} x1={start.x*1/radiusProp} y1={start.y*1/radiusProp} x2={end.x*radiusProp} y2={end.y*radiusProp} gradientUnits="userSpaceOnUse">
     <stop offset="0%" style={{stopColor:getNoteColor(start.datum.note), stopOpacity:1}}  />
    <stop offset="25%" style={{stopColor: getMixedNoteColor(start.datum.note,end.datum.note,25), stopOpacity:0.9}} />
   
    <stop offset="50%" style={{stopColor: getMixedNoteColor(start.datum.note,end.datum.note), stopOpacity:0.55}} />
    <stop offset="75%" style={{stopColor: getMixedNoteColor(start.datum.note,end.datum.note,75), stopOpacity:0.8}} />

     <stop offset="100%" style={{stopColor:getNoteColor(end.datum.note),stopOpacity:1}}  />
     </linearGradient>
        <path id={"path_"+gradientId} fill="transparent" d={`M ${start.x*radiusProp} ${start.y*radiusProp} Q 0 0 ${end.x*radiusProp} ${end.y*radiusProp}`}  stroke={`url(#${gradientId})`} strokeWidth={12*thickness} />
    <text  fontFamily="Arial" fontSize="10px" fill="rgba(255,255,255,0.8)" fontWeight="bold" x={55} dy={3}>
    <textPath href={"#path_"+gradientId} >
    {""+(transpose>0?"+":"")+transpose} &rarr;
    </textPath>
  </text>

    </g>};

const KeyLabel=component2(props => {
console.log("DynamicKeyWheel renderlabel");    
      labelProps[keysToColors(props.datum.note)] = props;
     
    //   console.log("labelprops",props,labelProps);
      const data = props.datum;
      const scaleProp = 1.5;
    var textX=props.x*scaleProp;
    var textY=props.y*scaleProp;
    return <g key={`keylabel_${data.note}`}>{data.playing ? 
        [-1,1]
            .map(transpose => [transpose, keysToColors(transposedNote(data.note,transpose))])
            .map(([transpose,color]) => [transpose,labelProps[color]])
            .filter(([transpose,d]) => d)
            .map(([transpose,destNote]) => <ConnectNodes key={`conn_${data.note}_${destNote.datum.note}`} start={props} end={destNote} thickness={1/Math.abs(transpose)} transpose={transpose} />)
        : null
        }
        <text textAnchor="middle" x={props.x} y={props.y} style={{strokeWidth: "0.4px", stroke: "none", fill: "black", fontWeight:"bold", fontFamily:"Arial", fontSize:"10px"}}>
            {data.keyLabel}
        </text>
        { data.trackInfos.map(({title,artist}, index) => <g key={`detailsTrack_${index}`}>
        {artist ?  
            <text key={"artistlabel_"+index} textAnchor="middle"  x={textX} y={textY+0+index*30} style={{strokeWidth: "0.4px", stroke: "none", fill: "rgb(250,250,250)",  fontFamily:"Arial", fontSize:"10px"}}> 
            {artist}
            </text>
        : null}
        {title ?  
            <text key={"titlelable_"+index}  textAnchor="middle" x={textX} y={textY+12+index*30} style={{strokeWidth: "0.4px", stroke: "none", fill: "rgb(210,210,210)",  fontFamily:"Arial", fontSize:"9px"}}> 
            {title}
            </text>
        : null}
        </g>) }
        </g>;
  });

const liveDataInterested = ["transposedKey", "playing", "name"]

function trackPlaying(tracks,note) {
    return tracks
        .filter((track) => 
            keysToColors(track.getIn(["liveData","transposedKey"])) == keysToColors(note) && track.getIn(["liveData","playing"])
        ).toArray();
}

const getNoteColor = note => tinyColor(keysToColors(transposedNote(note,0)))./*lighten(10).*/toHexString();

const getMixedNoteColor = (note1,note2,mix=50) => tinyColor.mix(getNoteColor(note1),getNoteColor(note2),mix).toHexString();

const TomSlice = component2((props) => {
    // console.log("sliceprops",props);
   return <VictoryAnimation data={props.slice} duration={500}>{(animatedProps)=><Slice {...props} slice={animatedProps} />}</VictoryAnimation>;
});

const TomKeyLabel = component2((props) => {
    // console.log("labelProps",props);
    return <VictoryAnimation duration={500} data={{x:props.x,y:props.y}} >
        {animatedProps => <KeyLabel {...props} {...animatedProps} />}
    </VictoryAnimation>;
})

const shortenInfo = (info) => (info && (info.slice(0,Math.min(info.length,15)).trim()+(info.length>15?"...":""))) ||  null;

const DynamicKeyWheel = component(({tracks}) => {
// console.log("DynamicKeyWheel tracks",tracks);    
return <VictoryPie innerRadius={innerRadius} width={350} 
    labelRadius={labelRadius}
    //  animate={{duration:500}}//, easing:"linearInOut", onEnd: (props,animInfo)=> console.log("animEnd",props,animInfo)}}
    data={
        openKeySequence.map(note => 
        {   const playingTracks = trackPlaying(tracks,note);
            const playing = playingTracks.length > 0;
            // const name = playing ? ;
            // const artist = playing ? playing.getIn(["fileData","id3Metadata","artist"]) :null;
            const trackInfos = playingTracks.map(track => ({
                title: shortenInfo(track.getIn(["fileData","id3Metadata","title"]) ),
                artist: shortenInfo(track.getIn(["fileData","id3Metadata","artist"])|| track.getIn(["liveData","name"]))
            }))
            return   {
                x: note,
                y: playing ? 2:1,
                note,
                playing,
                keyLabel:""+note+"/"+transposedNote(note,9)+"m",
                trackInfos
                // title: playing && name.slice(0,Math.min(name.length,20)) || null,
                // artist: playing && artist && artist.slice(0,Math.min(name.length,20)) || null
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
    labelComponent={<TomKeyLabel  />}
    dataComponent={<TomSlice />}        
    colorScale={openKeySequence.map(getNoteColor)}

/>});


export default component(({tracks}) => <DynamicKeyWheel tracks={
    tracks.map(track => 
        track.update("liveData",(liveData) => 
            liveData.filter((v,k) => liveDataInterested.includes(k))
        )
    )
} />);