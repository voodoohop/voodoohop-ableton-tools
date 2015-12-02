// taglib.js - port of taglib to JavaScript using emscripten
// by Romain Beauxis <toots@rastageeks.org>

(function() {
  var Module;
  var context = {};
  
  var FileAPI = require('file-api')
  , File = FileAPI.File
  , FileList = FileAPI.FileList
  , FileReader = FileAPI.FileReader 
  ;
  
  var fs = require("fs");
  
  
  
  return (function() {
