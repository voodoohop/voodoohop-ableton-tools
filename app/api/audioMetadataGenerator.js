

import * as most from 'most';

const Stream = most.Stream;


import {toJSON as immToJson, fromJSON as immFromJson} from "transit-immutable-js";

import log from "../utils/streamLog";
import Immutable from "immutable";

const logger = log("bufferedThrottleLog");

Stream.prototype.collect = function () {
    return this.reduce((xs, x) => { xs.push(x); return xs; }, []);
};

Stream.prototype.skipImmRepeats = function () {
    return this.skipRepeatsWith(Immutable.is);
};

Stream.prototype.combinePrevious = function (functor) {
    return this.loop((prev, next) => (prev === null) ? { seed: next, value: null } : { seed: next, value: functor(prev, next) }, null).skip(1)
};

Stream.prototype.throttledDebounce = function (interval) {
    // console.log("thisIs",this);
    var shared = this.scan((withId, data) => ({ data, id: withId.id + 1 }), { id: 0 }).skip(1).multicast();
    return shared.throttle(interval).merge(shared.debounce(interval))
        .skipRepeatsWith((a, b) => a.id === b.id)
        .map(d => d.data).multicast();
};

// var storyboard=require("storyboard");

// var getSources = (context) =>
//   context.source ? [context.source] : context.sources || [];

// var getSinks = (context) =>
//   context.sink ? [context.sink] : context.sinks || [];

// var findParentLogger = (source,displayName) => {
//     var sources = (source.loggerStory && source.loggerStory) || getSources(source).map(s => findParentLogger(s,displayName));
//     if (sources.length===0)
//         sources = [storyboard.mainStory];
//     var result = lodash.uniq(lodash.flatten(sources));
//     var primaryParent = result.shift();
//     return primaryParent.child({title:displayName,extraParents:result});
//    // .child({src: source.loggerDisplayName}))
//     //return sources;
// }
// var lodash=require("lodash");

// var hasChildLogger = (context) => context.loggerStory || getSinks(context).filter(hasChildLogger).length > 0;

// Stream.prototype.log = function(displayName) {
// //     this.loggerDisplayName = displayName;
// //    this.loggerStory = findParentLogger(this,displayName);


//  console.log("loggerThis",this);
//    var res= this.tap(data => {
//     let childLogger=getSinks(res).filter(hasChildLogger).length > 0;
//      console.log("loggingThis",data,childLogger,res);
//        res.loggerStory.warn(displayName,{attachInline:(data.toJS && data.toJS())||data });
//          if (!childLogger)   {
//             console.log("loggingClosing"); 
//             res.loggerStory.close();
//          }
//    });

//   res.loggerDisplayName = displayName;
//    res.loggerStory =  findParentLogger(res,displayName);


//  return res;
// }

Stream.prototype.bufferedThrottle = function (interval, streamName = null) {
    // return this;
    if (!streamName)
        streamName = Math.floor(Math.random() * 1000);
    let totalScheduled = 0;
    return this.loop((nextScheduled, newData) => {
        // const newQueue= timedQueue.get("queue").push(newData);
        const timeNow = new Date().getTime();
        const delay = Math.max(interval - (timeNow - nextScheduled), 0);

        totalScheduled++;
        logger({ streamName, totalScheduled, timeNow, delay, delta: nextScheduled - timeNow });
        if (delay <= 0)
            return { value: most.of(newData), seed: timeNow };
        return { value: most.of(newData).delay(delay), seed: timeNow + delay };
    }
        , 0)
        .flatMap(v => v)
        .tap(() => { totalScheduled--; logger({ totalScheduled, streamName }); })
    //  .tap(() => )
    //  .multicast();
    // var queue=[];
    // var finished=false;
    // this.observe((item)=> {
    //     // console.log("bufferedThrottle new item",item);
    //     queue.push(item);
    // }).then(()=>finished=true);
    //return most.create((add,end,error))



    // return most.periodic(interval,true).flatMap(() => (queue.length === 0 ? (finished?most.empty():most.never()):most.of(queue.shift())));
}

function tomStreamDiff(stream) {
    return stream.combinePrevious(tomDiff);//.flatMap(f=>f);
}

function tomDiff(prev, next, path = Immutable.List(), newDocument = null) {
    if (prev === undefined)
        prev = Immutable.Map();

    if (newDocument === null)
        newDocument = next;
    // console.log("diffing1",prev,next);
    console.log("diffing", prev.toJS ? prev.toJS() : prev, next.toJS ? next.toJS() : next);
    var res = prev.is(next) ?
        most.empty()
        :
        most.from(next.keySeq().filter(k => next.get(k) !== prev.get(k)).toArray())
            .flatMap(k => {
                let res = next.get(k).keySeq ? tomDiff(prev.get(k), next.get(k), path.concat([k]), newDocument) : most.of(Immutable.Map({ newDocument, path: path.concat([k]), value: next.get(k), previousValue: prev.get(k) }));
                return res;
            });
    // console.log("res",res);
    return res;
};

Stream.prototype.immutableDiff = function () {
    return tomStreamDiff(this);
}

var tst = most.from([1, 2, 3, 4, 5, 10, 11, 12, 14, 515, 800]).delay(3000).bufferedThrottle(300)
    .throttledDebounce(1100);

tst.observe(i => console.log("bufferedThrottle", i));
tst.collect().then(values => {
    if (values[values.length - 1] !== 800) console.error("warning throttled debounce not working");
});
// most.from([1, 2, 3, 4]).collect().then(x=>
//   console.log("collectTest", x));



export var transforms = {};

import {mapStackTrace} from "sourcemapped-stacktrace";

function mostify(f, transform = null) {
    // return f.hasOwnProperty("source") ?f:most.of(f);
    //    console.log("mostifying",(f && f.toJS && f.toJS())||f);
    var res = f === undefined || f === null ? most.of(Immutable.Map({ error: "got falsy value from transfrom " + transform.name })) : ((f instanceof Promise) ? most.fromPromise(f) : (f.hasOwnProperty("source") ? f.take(1) : (f.hasOwnProperty(Symbol.iterator) && !(f instanceof String) ? most.from(f) : most.of(f))));

    return res.flatMapError(e => {
        console.error("error1_", transform);


        console.error(e);
        return most.of(Immutable.Map({ error: e }));
    })
}

var cachedWithInputStream = Immutable.Set();

function getCachedWithInputStream(transformName, inputStream, creator) {
    var cached = cachedWithInputStream
        .find(e => e.transformName === transformName && e.inputStream === inputStream)
    if (cached)
        return cached.transform;
    var newTransform = { transformName, inputStream, transform: creator() };
    cachedWithInputStream = cachedWithInputStream.add(newTransform);
    return newTransform.transform;
}

var createInputstreamTransform = (transform, transforms) => {
    return (inputStream) => {

        // console.log("is",transform,inputStream);
        return getCachedWithInputStream(transform.name, inputStream, () =>
            transform.depends.length === 0 ?
                inputStream.flatMap(e => mostify(e, transform))
                    .map(transform.transform).flatMapError(e => {
                        // if (e && e.stack)
                        //      mapStackTrace(e.stack,st => console.error("error_",st));

                        //   else
                        console.error("error1_", transform, e);
                        console.error(e);
                        return most.of(Immutable.Map({ error: e }));
                    }).multicast()
                :
                most.zip(
                    (...dependsValues) => (transform.transform(...dependsValues)),
                    ...(transform.depends.map(dep => transforms[dep](inputStream))
                    ))//.delay(1)
                    // .map(f => (f instanceof Promise) ? f : new Promise(resolve => resolve(f))).flatMap(f => most.fromPromise(f)

                    .flatMap(e => mostify(e, transform))
                    .flatMapError(e => {
                        // if (e && e.stack)
                        //      mapStackTrace(e.stack,st => console.error("error_",st));

                        //   else
                        console.error("error1_", e);

                        console.error(e);
                        return most.of(Immutable.Map({ error: e }));
                    })
                    .multicast()
        )
    }
};

export var registerTransform = (transform) =>
    transforms[transform.name] = createInputstreamTransform(transform, transforms);



export var getTransformed = (requiredTransforms, inputStream) => {
    // console.log("getTransformed", requiredTransforms, transforms);
    return most.zip((...transformed) => transformed.reduce((o, n, i) =>
        o.set(requiredTransforms[i], n), Immutable.Map()), 
        ...requiredTransforms.map(t => transforms[t](inputStream)
        .flatMapError(e => {
            console.error("error1_", e);
            return most.of(Immutable.Map({ error: e }));
        })))
        .multicast();
}

registerTransform({ name: "path", transform: input => input, depends: [] });