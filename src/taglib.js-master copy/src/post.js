// taglib function wrappers

files = {}

function addTaglibFile(file, content) {
  var fs = require("fs");
  var ptr = _malloc(1);
  files[ptr] = {
    file: file,
    content: content,
    position: 0
  }

  if (content) {
    files[ptr].length = content.byteLength;
  } else {
    files[ptr].length = fs.statSync(file.path).size;
  }

  return ptr;
};

function getTaglibFile(ptr) {
  return files[ptr];
}

function removeTaglibFile(ptr) {
  if (!files[ptr]) {
    return;
  }

  files[ptr] = null;
  _free(ptr);
}

function guessFormat(fname) {
  if (/\.mp3$/i.test(fname)) {
    return "mpeg";
  }

  if (/\.ogg$/i.test(fname)) {
    return "ogg/vorbis";
  }

  if (/\.mp4$/i.test(fname)) {
    return "mp4";
  }

  if (/\.aac$/i.test(fname)) {
    return "mp4";
  }

  if (/\.m4a$/i.test(fname)) {
    return "mp4";
  }

  if (/\.wav$/i.test(fname)) {
    return "wav";
  }
  
  if (/\.aif$/i.test(fname)) {
    return "aiff";
  }
  
  if (/\.aiff$/i.test(fname)) {
    return "aiff";
  }
  return null;
}

function readFile(file, format, content) {
  var strArray;

  var _file = addTaglibFile(file, content);

  var allocString = function (s) {
    var strArray = intArrayFromString(s);
    var _ptr = _malloc(strArray.length);
    Module.HEAPU8.subarray(_ptr, _ptr+strArray.length).set(strArray);
    setValue(_ptr+strArray.length+1, 0, "i8");
    return _ptr;
  }

  var _filename = allocString(unescape(encodeURIComponent(file.name)));
  var formatGuess = format || guessFormat(file.name);
  if (formatGuess === null) {
    console.error("(tagLib.js) couldn't determine format for file", file);
    console.error("try supplying the format parameter to readFile");
    return {error: "noFormatFound"};
  }
  
  
  var _format = allocString(formatGuess);

  var _taglib = _taglib_js_open(_format, _filename, _file);
  _free(_format);
  _free(_filename);

  _taglib_js_get_metadata(_taglib, _file);
  _taglib_js_get_audio_properties(_taglib, _file);

  var data = getTaglibFile(_file);

  removeTaglibFile(_file);
  _taglib_js_close(_taglib);

  var ret = {};
  if (data.metadata) {
    ret.metadata = data.metadata;
  }
  if (data.audio) {
    ret.audio = data.audio;
  }

  return ret;
};


function syncTaglibRead(file, format, cb) {
  // var reader = new FileReader;
  
  setTimeout(function() {cb(readFile(file,format));},0);
  // reader.onload = function (e) {
  //   cb(readFile(file, format, e.target.result));
  // };
  // reader.readAsArrayBuffer(file);
};

// if (typeof window != "undefined") {
  File.prototype.readTaglibMetadata = function (args, cb) {
    if (!cb) {
      cb = args;
    }
    args = args || {};
    var path = args.path;
    var format = args.format;


    return syncTaglibRead(this, format, cb);
    
  };
// } else {
//   self.readFile = readFile;
// }
  module.exports.File = File;
}).call(context)})();
