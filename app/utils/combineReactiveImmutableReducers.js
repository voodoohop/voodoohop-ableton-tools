import Immutable from "immutable";

function pickReducer(reducers) {
  return Object.keys(reducers).reduce((result, key) => {
    if (typeof reducers[key] === 'function') {
      result[key] = reducers[key];
    }

    return result;
  }, {});
}

export default function combineReducers(reducers) {
  const finalReducers = pickReducer(reducers);
  const keys = Object.keys(finalReducers);

  return (state = Immutable.Map(), action = undefined) => {
    return keys.reduce((result, key) => {
    //   result;
      return result.set(key, finalReducers[key](state.get(key), action));
    }, Immutable.Map());
  };
}