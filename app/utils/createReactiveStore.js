import most from 'most';

import Subject from "../utils/subject";
import Immutable from "immutable";

export default function createStore(reducer, initState) {
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  const initAction ={type: '@@reactive-tom-redux/INIT_' + (new Date()).getTime()};
  const listeners = [];
  const dispatcher$ = Subject();

  let currentReducer = reducer;
  let state = currentReducer(initState, initAction);

  function callListeners() {
    listeners.forEach(listener => listener());
  }

  function dispatch(action) {
    dispatcher$.push(action);
    return action;
  }

  function subscribe(listener) {
    listeners.push(listener);

    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }

  function replaceReducer(newReducer) {
    currentReducer = newReducer;
    dispatcher$.push(initAction);
  }

  function reduce(action) {
    if (!(typeof action === "object")) {
      throw new Error('Actions must be  objects.');
    }

    state = currentReducer(state, action);

    return state;
  }

  const state$ = dispatcher$.map(reduce).multicast().startWith(state);

  // must call state$.subscribe() to start life cycle
  state$.observe(
    callListeners,
    err => { throw err; }
  );

  return {
    state$,
    dispatcher$,
    getState: () => state,
    dispatch,
    subscribe,
    getReducer: () => currentReducer,
    replaceReducer
  };
}