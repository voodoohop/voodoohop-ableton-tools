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
import {openkeySequence} from "./api/openKeySequence";

import tinyColor from "tinycolor2";

import log from "./utils/streamLog";

import "./api/audioMetadataGenerator";
// const labelProps={};

const innerRadius = 87;
const labelRadius=105;

const radiusProp=innerRadius/labelRadius;

const ConnectNodes = component(({start, end, thickness, transpose}) =>{
    log("connectNodes")({start,end,thickness,transpose});
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

    </g>});




const KeyLabel=component2(({x,y,datum,connectedNotes}) => {
    // if (otherKeyLabels.source)
    //     otherKeyLabels = Immutable.Map();
// console.log("DynamicKeyWheel renderlabel",{x,y,datum,connectedNotes});    
    //   labelProps[keysToColors(props.datum.note)] = props;
    const newData=Immutable.fromJS({datum,x,y});
    // console.log("connectedNotes",connectedNotes);// && connectedNotes.get(keysToColors(datum.note)),newData);

    //  if (!Immutable.is(connectedNotes && connectedNotes.get(keysToColors(datum.note)),newData))
        
        keyLabelModified$.push(newData);
    //   console.log("labelprops",props,labelProps);
      const data = datum;
      const scaleProp = 1.5;
    var textX=x*scaleProp;
    var textY=y*scaleProp;
    return <g key={`keylabel_${data.note}`}>{data.playing && connectedNotes? 
            connectedNotes    
            // .map(({otherKeyLabel}) => otherKeyLabel.toJS())
            .map(({transpose,otherKeyLabel}) => ({transpose,destNote:otherKeyLabel.toJS()}))
            // .map(n => log("destNote")(n))     
            .map(({transpose,destNote}) => <ConnectNodes key={`conn_${data.note}_${destNote.datum.note}`} start={{x,y,datum}} end={destNote} thickness={1/Math.abs(transpose)} transpose={transpose} />)
        : null
        }
        <text textAnchor="middle" x={x} y={y} style={{strokeWidth: "0.4px", stroke: "none", fill: "black", fontWeight:"bold", fontFamily:"Arial", fontSize:data.shortLabel? "15px":"9px"}}>
            {data.keyLabel}
        </text>
        { Immutable.Seq(data.trackInfos).map(({title,artist}, index) => <g key={`detailsTrack_${index}`}>
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
        )
        .filter((track)=> !(track.getIn(["liveData","selectedCLipAlreadyDisplayed"]))).toArray();
}

const getNoteColor = note => tinyColor(keysToColors(transposedNote(note,0)))./*lighten(10).*/toHexString();

const getMixedNoteColor = (note1,note2,mix=50) => tinyColor.mix(getNoteColor(note1),getNoteColor(note2),mix).toHexString();

const TomSlice = component2((props) => {
   return <VictoryAnimation data={props.slice} duration={400}>{(animatedProps)=><Slice {...props} slice={animatedProps} />}</VictoryAnimation>;
});

import Subject from "./utils/subject";
import {Connector} from "./utils/createReactiveClass";

const keyLabelModified$ = Subject();

const allKeyLabels$ = keyLabelModified$.scan((keyLabels, newKeyLabelProps) => keyLabels.update(keysToColors(newKeyLabelProps.getIn(["datum","note"])),props => newKeyLabelProps),Immutable.Map()).skipImmRepeats().debounce(10)
// .tap(log("allKeyLabels$"))
.startWith(Immutable.Map())
.multicast();

const ReactiveKeyLabel = Connector(KeyLabel);

const mapTranspose = (otherKeyLabels, data) =>
        Immutable.fromJS([-1,1])
            .map(transpose => ({transpose, color:keysToColors(transposedNote(data.note,transpose))}))
            .map(({transpose,color}) => ({transpose,otherKeyLabel:otherKeyLabels.get(color)}))
            .filter(({transpose,otherKeyLabel}) => otherKeyLabel);

const TomKeyLabel = component2((props) => {
    // console.log("labelProps",props);
    return <VictoryAnimation duration={500} data={{x:props.x,y:props.y}} >
        {animatedProps => <ReactiveKeyLabel {...props} {...animatedProps} connectedNotes={allKeyLabels$.map((otherKeyLabels) => mapTranspose(otherKeyLabels, props.datum))} />}
    </VictoryAnimation>;
})

const shortenInfo = (info) => (info && (info.slice(0,Math.min(info.length,15)).trim()+(info.length>15?"...":""))) ||  null;

import {getKeyFormatter} from "./api/openKeySequence";

import _ from "lodash";
const DynamicKeyWheel = component(({tracks,keyFormatter,canShortenLabel}) => {
// console.log("DynamicKeyWheel tracks",tracks,uiState);    
// const keyFormatter =;
return <VictoryPie innerRadius={innerRadius} width={350} height={350}
    labelRadius={labelRadius}
    data={
        openkeySequence.map(note => 
        {   const playingTracks = trackPlaying(tracks,note);
            const playing = playingTracks.length > 0;
            const trackInfos = _.uniqWith(playingTracks
            .map(track => ({
                title: shortenInfo(track.getIn(["fileData","id3Metadata","title"]) ),
                artist: shortenInfo(track.getIn(["fileData","id3Metadata","artist"])|| track.getIn(["liveData","name"]))
            })),(a,b)=> a.title=== b.title && a.artist===b.artist);

            return   {
                x: note,
                y: playing ? 2:1,
                note,
                playing,
                shortLabel:canShortenLabel,
                keyLabel:canShortenLabel ? keyFormatter(""+note).replace(/[a-z]/,"") : keyFormatter(""+note)+"/"+keyFormatter(transposedNote(note,9)+"m"),
                trackInfos
        }})
    }
    
    style={{labels:{
                fontWeight: (data)=>data.y > 1 ? "bold":"normal", 
                fontFamily:"arial",
                fill: data => getNoteColor(data.note),//'rgb(100,100,100)',
                opacity:1, 
                strokeWidth:(data) => data.y > 1 ? "1px":"0.4px"
            },
            
            data:{
                strokeWidth:"1.5px",
                stroke:(data) => data.playing ? "rgba(255,255,255,0.8)":"rgba(0,0,0,0)"
            }}}
    labelComponent={<TomKeyLabel  />}
    dataComponent={<TomSlice />}        
    colorScale={openkeySequence.map(getNoteColor)}

/>});


export default component(({tracks,uiState}) => <DynamicKeyWheel tracks={
    tracks.map(track => 
        track.update("liveData",(liveData) => 
            liveData.filter((v,k) => liveDataInterested.includes(k))
        )
    )
} keyFormatter={getKeyFormatter(uiState)} canShortenLabel={uiState.get("keyNotation") !== "trad"}/>);