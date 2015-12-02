import { stateStream, updateState, buildInitialState } from './src/state-manager';
import React from 'react';
import Root from './src/components/root';
import merge from 'ramda/src/merge';
import { getActionStream } from './src/events/action';

const on = getActionStream(stateStream);

const increment = ({ state }) => merge({ count: state.count + 1 });
const decrement = ({ state }) => merge({ count: state.count - 1 });

on('increment').map(incrementCount).observe(updateState);
on('descrement').map(decrement).observe(updateState);

stateStream
  .tap(console.log.bind(console))
  .observe(state =>
    React.render(
      <Root {...state}></Root>,
      document.getElementById('container')
    )
  );

updateState(buildInitialState());
