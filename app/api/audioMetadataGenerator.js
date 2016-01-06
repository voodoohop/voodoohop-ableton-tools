var most = require("most");
var Stream = require('most').Stream;

import Immutable from "immutable";


Stream.prototype.collect = function () {
  return this.reduce((xs, x) => { xs.push(x); return xs; }, []);
};

Stream.prototype.combinePrevious = function(functor) {
    return this.loop((prev,next) => (prev=== null) ? {seed:next,value:null} :  {seed:next,value:functor(prev,next)},null).skip(1)
};


// most.from([1, 2, 3, 4]).collect().then(x=>
//   console.log("collectTest", x));



export var transforms = {};

import {mapStackTrace} from "sourcemapped-stacktrace";

import actionStream from "../api/actionSubject";

 function mostify(f, transform=null) {
   console.log("mostifying",(f && f.toJS && f.toJS())||f);
   var res= f ===undefined ? most.empty() : ((f instanceof Promise) ? most.fromPromise(f) : (f.hasOwnProperty("source") ? f : (f.hasOwnProperty(Symbol.iterator) && ! (f instanceof String) ? most.from(f) : most.of(f)) ));
   
   return res.flatMapError(e => {
          console.error("error1_",transform,e);
          return most.of(Immutable.Map({error:e}));
        })
 }
 
 var cachedWithInputStream = Immutable.Set();
 
 function getCachedWithInputStream(transformName, inputStream, creator) {
     var cached= cachedWithInputStream
        .find(e => e.transformName === transformName && e.inputStream === inputStream) 
    if (cached)
        return cached.transform;
    var newTransform = {transformName, inputStream, transform: creator()};
    cachedWithInputStream= cachedWithInputStream.add(newTransform);
    return newTransform.transform;
 }
 
var createInputstreamTransform = (transform, transforms) => {
  return (inputStream) => {
      
    // console.log("is",transform,inputStream);
    return getCachedWithInputStream(transform.name, inputStream, () =>
      transform.depends.length === 0 ?
       inputStream.flatMap(e => mostify(e,transform))
       .map(transform.transform).flatMapError(e => {
        // if (e && e.stack)
        //      mapStackTrace(e.stack,st => console.error("error_",st));
          
        //   else
          console.error("error1_",transform, e);
          return most.of(Immutable.Map({error:e}));
        }).multicast()
      :
      most.zip(
        (...dependsValues) => (transform.transform(...dependsValues)),
        ...(transform.depends.map(dep => transforms[dep](inputStream))
        ))//.delay(1)
        // .map(f => (f instanceof Promise) ? f : new Promise(resolve => resolve(f))).flatMap(f => most.fromPromise(f)
         
        .flatMap(e => mostify(e,transform))
         .multicast()
    )}
};

export var registerTransform = (transform) => 
  transforms[transform.name] = createInputstreamTransform(transform, transforms);



export var getTransformed = (requiredTransforms, inputStream) => {
  // console.log("getTransformed", requiredTransforms, transforms);
  return most.zip((...transformed) => transformed.reduce((o,n,i)=> o.set(requiredTransforms[i], n),Immutable.Map()),...requiredTransforms.map(t => transforms[t](inputStream)))
    // .multicast();
}

registerTransform({ name: "path", transform: input => input, depends: [] })