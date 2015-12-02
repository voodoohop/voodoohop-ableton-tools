import distpatcher from './dispatcher';
import { fromEvent } from 'most';
import curry from 'ramda/src/curry';

export function action(type, data={}) {
  return () => distpatcher.action(type, data);
}

const streamOfAllActions = fromEvent('action', distpatcher);

export const getActionStream = curry((stateStream, actionType) => {
  let streamFilteredByType = streamOfAllActions
    .filter(
      ({ type }) => type === actionType
    ).map(({ data }) => data);

  return streamFilteredByType
    .sample(
      (actionData, state) => {
        return { action: actionData, state }
      },
      streamFilteredByType,
      stateStream
    );
});
