import actionStream from '../api/actionSubject';

import * as most from 'most';

import Immutable from 'immutable';

import livedataStore from './livedataStore';
import uiStateStore from './uiStateStore';
// import {addLiveDataSource} from "./livedataStore";

import { oscDiff2 } from '../utils/oscStateDiff';

import log from '../utils/streamLog';

import Subject from '../utils/subject';

import { oscOutput } from '../utils/oscInOut';


console.log('liveDataStore', livedataStore);

let clickedLoopAction = actionStream.filter(a => a.get('type') === 'clickedBeat');

export let clickedLoopCommands = clickedLoopAction.map((action) => {
  // console.log("tracks",tracks.toJS());
  let newStart = Math.floor(action.get('beat') / 16) * 16;
  let newEnd = (Math.floor(action.get('beat') / 16) + 1) * 16;
  let commands = // (newStart > liveData.getIn([action.get("trackId"),"loop_end"])) ?
    [
      [
        'looping', 1
      ],
      // ["loop_start",-4096], ["loop_end",4096],
      [
        'loop_end', newEnd
      ],
      ['loop_start', newStart]
    ];
  // : [ 	["looping",1], 	["loop_start",newStart], 	["loop_end",newEnd] ];

  return most.from(commands.map(c => Immutable.Map({
    trackId: Number(action.get('trackId')),
    type: c[0],
    value: c[1]
  }))); // tracks.update(action.get("trackId"), track => commands.reduce((track, command) => track.set(command[0], command[1]), track))
})
  .flatMap(f => f)
  .tap(log('clickedLoopCommands'));

let hashMe = a => '' + a.get('trackId') + '_' + a.get('value') + '_' + a.get('type');

// addLiveDataSource(groupedChangeRequest);
// addLiveDataSource(clickedLoopCommands);

let groupAttributes = Immutable
  .Seq
  .of('loop_start', 'loop_end', 'looping', 'pitch', 'gain');

let groupedLiveData = livedataStore.combine((liveData, uiState) => liveData.filter((v, trackId) => uiState.get('groupedTracks').contains(trackId)).map((track, trackId) => {
  console.log('trk', track.toJS());
  return track.filter((_, k) => groupAttributes.contains(k));
}), uiStateStore);

function tomDiff(prev, next, path = Immutable.List()) {
  if (prev === undefined)
    prev = Immutable.Map();

  // console.log("diffing1",prev,next); console.log("diffing", prev.toJS ?
  // prev.toJS() :prev, next.toJS ? next.toJS() :next );
  let res = prev === next
    ? most.empty()
    : most.from(next.keySeq().filter(k => next.get(k) !== prev.get(k)).toArray()).flatMap((k) => {
      const res = next
        .get(k)
        .keySeq
        ? tomDiff(prev.get(k), next.get(k), path.concat([k]))
        : most.of(Immutable.Map({
          path: path.concat([k]),
          value: next.get(k),
          previousValue: prev.get(k)
        }));
      return res;
    });
  // console.log("res",res);
  return res;
}

const grouedOscCommands = groupedLiveData.combinePrevious(tomDiff)
  // .tap(log("groupedLiveData1"))
  .flatMap(f => f)
  .combine((groupDiff, uiState) => most.from(uiState.get('groupedTracks').map(trackId => Immutable.Map({
    trackId,
    path: groupDiff.get('path'),
    type: groupDiff.getIn(['path', 1]),
    value: groupDiff.get('value')
  })).toArray()), uiStateStore)
  .flatMap(f => f)
  .filter(f => f.get('value') != 4096 && f.get('value') != -4096)
  .tap(log('groupedLiveData'));
// .drain();

const mergedCommands = clickedLoopCommands
  .merge(grouedOscCommands)
  .multicast();

const mergedCommands2 = mergedCommands.combine((oscCommand, liveData) => {
  const type = oscCommand.get('type');
  const trackId = oscCommand.get('trackId');
  const value = oscCommand.get('value');
  const prevValue = liveData.getIn([trackId, type]);
  if (prevValue === value)
    return most.empty();
  let command = most.of(oscCommand);

  if (type !== 'loop_start' && type !== 'loop_end')
    return most.of(oscCommand);
  if (type === 'loop_start' && liveData.getIn([trackId, 'loop_end']) <= value)
    // cmds.push(Immutable.Map({trackId, type:"loop_end", value: value+256}));
    command = command.delay(20);
  if (type === 'loop_end' && liveData.getIn([trackId, 'loop_start']) >= value)
    //        cmds.push(Immutable.Map({trackId, type:"loop_start", value:
    // value-256}));
    command = command.delay(20);

  //   cmds.push(oscCommand);
  return command;
}, livedataStore.sampleWith(mergedCommands)).flatMap(f => f);

const store = mergedCommands2
  // .filter(f => f.get("type")) .tap(log("mergedCommands"))
  .map(tc => Immutable.Map({
    trackId: parseInt(tc.get('trackId')),
    args: Immutable.List([
      tc.get('type'),
      tc.get('value')
    ])
  })).tap(log('oscOutputcommand'));

oscOutput.plug(store.tap(log('plugged')));

export default store;
