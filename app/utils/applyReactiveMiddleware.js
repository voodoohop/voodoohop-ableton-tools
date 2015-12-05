import most from 'most';
import Subject from './subject';
import compose from './compose';

function createNewDispatch(middleware, store) {
  const dispatchFunctions = middleware.map(m => m(store));
  dispatchFunctions.push(store.dispatch);

  return compose(...dispatchFunctions);
}

function createNewDispatcher(middleware, store) {
  const newDispatch = createNewDispatch(middleware, store);
  const newDispatcher$ = Subject();
  newDispatcher$.observe(newDispatch);

  return newDispatcher$;
}

export default function applyMiddleware(...middleware) {
  return (createStore) => (reducer, initState) => {
    const store = createStore(reducer, initState);
    const newDispatcher$ = createNewDispatcher(middleware, store);

    store.dispatcher$ = newDispatcher$;
    store.dispatch = (action) => {
      newDispatcher$.push(action);
      return action;
    };

    return store;
  };
}