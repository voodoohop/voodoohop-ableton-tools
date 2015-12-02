import { createStore } from 'redux';
import rootReducer from '../reducers';
import Subject from '../utils/subject.js';

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState);

  const state$ = new Subject(store.getState());
  store.subscribe(() => {
    state$.push(store.getState());
  });

  // store.state$ = state$.startWith();
  return store;
}
