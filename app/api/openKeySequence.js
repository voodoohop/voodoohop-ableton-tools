export const openkeySequence = [
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "Gb",
  "Db",
  "Ab",
  "Eb",
  "Bb",
  "F"
];

export const camelotToKey = {
  "11b": "A",
  "8a": "Am",
  "6b": "A#",
  "3a": "A#m",
  "1b": "B",
  "10a": "Bm",
  "8b": "C",
  "5a": "Cm",
  "3b": "C#",
  "12a": "C#m",
  "10b": "D",
  "7a": "Dm",
  "5b": "D#",
  "2a": "D#m",
  "12b": "E",
  "9a": "Em",
  "7b": "F",
  "4a": "Fm",
  "2b": "F#",
  "11a": "F#m",
  "9b": "G",
  "6a": "Gm",
  "4b": "G#",
  "1a": "G#m"
}

export const openKeyToKey = {
  "4d": "A",
  "1m": "Am",
  "11d": "A#",
  "8m": "A#m",
  "6d": "B",
  "3m": "Bm",
  "1d": "C",
  "8d": "C#",
  "5m": "C#m",
  "3d": "D",
  "12m": "Dm",
  "10d": "D#",
  "7m": "D#m",
  "5d": "E",
  "2m": "Em",
  "12d": "F",
  "9m": "Fm",
  "7d": "F#",
  "4m": "F#m",
  "2d": "G",
  "11m": "Gm",
  "9d": "G#",
  "6m": "G#m"
}

import keysToColors from "./keysToColors";

// import {invert} from "lodash"; const camelotToColors =
// invert(camelotToKey).map((camelot,key) => keysToColor)

const keysToCam = {
  "c": "8b",
  "am": "8a",
  "g": "9b",
  "em": "9a",
  "d": "10b",
  "bm": "10a",
  "a": "11b",
  "gbm": "11a",
  "f#m": "11a",
  "e": "12b",
  "dbm": "12a",
  "c#m": "12a",
  "b": "1b",
  "abm": "1b",
  "g#m": "1a",
  "gb": "2b",
  "f#": "2b",
  "d#m": "2a",
  "ebm": "2a",
  "db": "3b",
  "c#": "3b",
  "bbm": "3a",
  "a#m": "3a",
  "ab": "4b",
  "g#": "4b",
  "fm": "4a",
  "eb": "5b",
  "d#": "5b",
  "cm": "5a",
  "bb": "6b",
  "a#": "6b",
  "gm": "6a",
  "f": "7b",
  "dm": "7a"
};

const camToOpenKey = {
  "8b": "1d",
  "8a": "1m",
  "9b": "2d",
  "9a": "2m",
  "10b": "3d",
  "10a": "3m",
  "11b": "4d",
  "11a": "4m",
  "12b": "5d",
  "12a": "5m",
  "1b": "6d",
  "1a": "6m",
  "2b": "7d",
  "2a": "7m",
  "3b": "8d",
  "3a": "8m",
  "4b": "9d",
  "4a": "9m",
  "5b": "10d",
  "5a": "10m",
  "6b": "11d",
  "6a": "11m",
  "7b": "12d",
  "7a": "12m"
}

export const keysToCamelot = (key) => key
  ? keysToCam[key.toLowerCase()]
  : "undefined";

export const keysToOpenkey = (key) => camToOpenKey[keysToCamelot(key)];

// const logInOut = (notation,keyFormatter) => (key) => {     const result =
// keyFormatter(key);     console.log("formatting key", key, "result:",
// result,"notation:",notation,keyFormatter);     // console.trace();     return
// result; }
const identity = (key) => key;

export const getKeyFormatter = (keyNotation) => {

  const notation = keyNotation || "trad";
  if (notation === "camelot")
    return keysToCamelot;
  if (notation === "openkey")
    return keysToOpenkey;
  return identity;//.replace("b", '\u266D').replace("#", '\u266F');
}


import uiState from "../store/uiStateStore";

export const keyFormatter$ = uiState
  .map(state => getKeyFormatter(state.get("keyNotation")))
  .skipImmRepeats();