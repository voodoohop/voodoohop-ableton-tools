import React from 'react';
import component2 from './utils/immComponent';

import Immutable from 'immutable';

import logger from './utils/streamLog';


import tinycolor from 'tinycolor2';

import keysToColors from './api/keysToColors';

const log = logger('waveform');

const WaveformPoly = component2(({
  durationBeats, gain, waveformData,
  //  chords,
  musicalKey,
  start
}) => {
  // if (!chords)
  let chords = Immutable.fromJS([
    {
      chord: musicalKey,
      startBeat: 0,
      endBeat: durationBeats
    }
  ]);
  // log("waveform args", duration, viewboxWidth, viewboxHeight,
  // waveformData.toJS(), trackId,chords.toString());
  // TODO: make waveforms optionally half length var takeRan ge =
  // (waveSeq,startIndex=0, endIndex=Infinity) => 		waveSeq 			.skipWhile((val,i)
  // => i < startIndex) 			.takeWhile((val,i) => i < endIndex); log("doing
  // waveform2 render", waveformData.get("size"),chords.toString());
  // console.log("wform", trackId, waveformData);
  if (waveformData.get('error')) {
    return (
      <text x="0" y="0" fontFamily="Verdana" fontSize="43">
        {waveformData.get('error')}
      </text>
    );
  }
  //   <div>error: {waveformData.get("error")}</div>; console.log("startBeat")
  if (chords.last().get('endBeat') < durationBeats) {
    chords = chords.push(Immutable.Map({
      chord: null,
      startBeat: chords
        .last()
        .get('endBeat'),
      endBeat: durationBeats
    }));
  }

  const segmentedByChord = chords.map((chord) => {
    const size = waveformData.get('size');
    const startOffset = Math.floor(((chord.get('startBeat')) || 0) * waveformData.get('pixelsPerBeat'));
    const endOffset = Math.floor(chord.get('endBeat')
      ? (chord.get('endBeat')) * waveformData.get('pixelsPerBeat')
      : size);
    if (startOffset < 0 || endOffset < 0) {
      return Immutable.Map({ size: 0 });
    }
    return Immutable.Map({
      chord: chord.get('chord'),
      max: waveformData
        .get('max')
        .slice(startOffset, endOffset), // .map(t=>t*2-1),
      min: waveformData
        .get('min')
        .slice(startOffset, endOffset), // .map(t=>-1),
      startOffset,
      endOffset,
      size: endOffset - startOffset
    });
  }).filter(s => s.get('size') > 0).toArray();

  const pixelsPerBeat = waveformData.get('pixelsPerBeat');
  // var s = segmentedByChord(Immutable.Seq(maxArray)).toJS();
  // log("segmented",segmentedByChord);

  console.timeEnd('renderWaveformTime');
  // var scaleByGain = {transform:"scaleY("+((Math.exp(gain/0.4)-1)/1.5)+")"};
  const scaleTransform = `scaleY(${((Math.exp(gain / 0.4) - 1) / 1.5)})`;
  const horizontalTransform = `translateX(${start}px)`;
  console.log('scaleTransform', scaleTransform);
  return (
    <g style={{
      transform: horizontalTransform
    }}>
      {segmentedByChord.map((segment, i) => {
        let points = segment
          .get('max')
          .map((v, i) => [
            i + segment.get('startOffset'),
            v
          ])
          .concat(segment.get('min').map((v, i) => [
            i + segment.get('startOffset'),
            v
          ]).reverse());

        if (points.size === 0)
          return null;
        points = points
          .concat([points.first()])
          .toArray();
        // log("points",i,points,segment.toJS());
        points = points.map(p => [
          p[0] / pixelsPerBeat,
          (p[1] / 2 + 0.5) * 127
        ].join(','));

        return (<polyline
          style={{
            transform: scaleTransform,
            transformOrigin: 'left center'
          }}
          key={`${segment.get('startOffset')}_${segment.get('endOffset')}`}
          fill={tinycolor(keysToColors(segment.get('chord')))
            .lighten(10)
            .toHexString()}
          points={points.join(' ')}
        />);
      })}
    </g>
  );
});

import _ from 'lodash';

export default component2(({
  waveform,
  chords,
  musicalKey,
  trackId,
  gain,
  style,
  startOffset,
  endOffset
}) => {
  //  log("waveformprops",waveform, chords, musicalKey, trackId, gain); var
  // waveform = props.waveform; log("reactThis",waveform&&waveform.toJS()); var
  // liveData=props.liveData; log("liveData",liveData.toJS());
  if (waveform === undefined || waveform.get('size') < 2)
    return null;
  const durationBeats = waveform.get('size') / waveform.get('pixelsPerBeat');
  // var waveform log("waveformData", waveform,chords,musicalKey,trackId); var
  // chords = props.chords; log("pts",points); var beatToPos = (beat) =>
  // beat;//*waveform.get("pixelsPerBeat")*viewboxWidth/waveform.get("size");
  const start = 1 * (waveform.get('firstBeat')) + startOffset;

  console.time('renderWaveformTime');
  console.log('startBeat', start);
  const compositeStyle = _.defaults({
    // transform:"scaleY("+((Math.exp(gain/0.4)-1)/1.5)+")"
    /* ,transformOrigin:"0% 0%"*/
  }, style);

  const result = (
    <g style={compositeStyle}>
      <WaveformPoly
        gain={gain}
        start={start}
        durationBeats={Math.min(durationBeats, endOffset)}
        musicalKey={musicalKey}
        waveformData={waveform}
        trackId={trackId}
        chords={chords}
      />
    </g>
  );
  // { beatLines.map(x =>   	<line key={x}
  // stroke={tinycolor(color).complement().toHexString()} opacity="0.3"
  // strokeWidth="2" x1={x} x2={x} y1={0} y2={127} />   )}
  console.timeEnd('renderWaveformTime');
  return result;
});
