var most = require("most");
var Stream = require('most').Stream;

import Immutable from "immutable";


Stream.prototype.collect = function () {
  return this.reduce((xs, x) => { xs.push(x); return xs; }, []);
};

Stream.prototype.combinePrevious = function(functor) {
    return this.loop((prev,next) => (prev=== null) ? {seed:next,value:null} :  {seed:next,value:functor(prev,next)},null).skip(1)
};

Stream.prototype.throttledDebounce = function(interval) {
    var shared=this.scan((withId,data)=> ({data, id:withId.id+1}),{id:0}).skip(1).multicast();
    return shared.throttle(interval).merge(shared.debounce(interval))
                .skipRepeatsWith((a,b)=>a.id===b.id)
                .map(d=>d.data);
};

Stream.prototype.bufferedThrottle = function(interval) {
    
    return this.loop((lastEmittedTime,newData)=> {
        // const newQueue= timedQueue.get("queue").push(newData);
        const timeNow = new Date().getTime();
        const delay = Math.max(interval - (timeNow-lastEmittedTime),0);
        // console.log("timeNow",timeNow,"interval",delay,lastEmittedTime);
        return {value: most.of(newData).delay(delay), seed: delay+timeNow};
    }
     ,0)
     .flatMap(v => v)
    ;
    // var queue=[];
    // var finished=false;
    // this.observe((item)=> {
    //     // console.log("bufferedThrottle new item",item);
    //     queue.push(item);
    // }).then(()=>finished=true);
    //return most.create((add,end,error))
    
    
    
    // return most.periodic(interval,true).flatMap(() => (queue.length === 0 ? (finished?most.empty():most.never()):most.of(queue.shift())));
}

var tst=most.from([1,2,3,4,5,10,11,12,14,515,800]).delay(3000).bufferedThrottle(300)
.throttledDebounce(1100);

tst.observe(i=>console.log("bufferedThrottle",i));
tst.collect().then(values => {
    if (values[values.length-1] !== 800) console.error("warning throttled debounce not working");
    });
// most.from([1, 2, 3, 4]).collect().then(x=>
//   console.log("collectTest", x));



export var transforms = {};

import {mapStackTrace} from "sourcemapped-stacktrace";

 function mostify(f, transform=null) {
    // return f.hasOwnProperty("source") ?f:most.of(f);
//    console.log("mostifying",(f && f.toJS && f.toJS())||f);
   var res= f ===undefined  || f === null ? most.of(Immutable.Map({error:"got falsy value from transfrom "+transform.name})): ((f instanceof Promise) ? most.fromPromise(f) : (f.hasOwnProperty("source") ? f : (f.hasOwnProperty(Symbol.iterator) && ! (f instanceof String) ? most.from((f.toArray && f.toArray()) || f) : most.of(f)) ));
   
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
     .multicast();
}

registerTransform({ name: "path", transform: input => input, depends: [] })