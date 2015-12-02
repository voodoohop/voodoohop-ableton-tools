import { EventEmitter } from 'events';
import { fromEvent } from 'most';
import compose from 'ramda/src/compose';

const eventEmitter = new EventEmitter();

export const stateStream = fromEvent('update', eventEmitter);
export const updateState = eventEmitter.emit.bind(eventEmitter, 'update');
export const buildInitialState = () => {
  return {
    count: 0
  };
};
