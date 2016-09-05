
import 'babel-polyfill';
import { jsdom } from 'jsdom';


global.document = jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.navigator = global.window.navigator;

window.localStorage = window.sessionStorage = {
  getItem(key) {
    return this[key];
  },
  setItem(key, value) {
    this[key] = value;
  },
  removeItem(key) {
    this[key] = undefined;
  },
};
>>>>>>> 9d0782912ae4100825089e1678a684966bedee59
