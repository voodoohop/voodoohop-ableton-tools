import { EventEmitter } from 'events';

class Dispatcher extends EventEmitter {
  action (type, data) {
    this.emit('action', { type, data });
  }
}

export default (new Dispatcher());
