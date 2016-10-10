
// import "./app/utils/streamPrototypeExtensions";


import {of as mostof, empty as mostempty,  from as mostfrom,Stream} from 'most';

import Immutable from "immutable";
import logger from "./streamLog";

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
        .loop((lastId, current) => ({seed: Math.max(lastId,current.id), value: current.id>lastId ? current:null}) ,-1)
        .filter(n => n !== null)
        .map(d => d.data)
        .multicast();
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
            return { value: mostof(newData), seed: timeNow };
        return { value: mostof(newData).delay(delay), seed: timeNow + delay };
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
    var res = Immutable.is(prev, next) ?
        mostempty()
        :
        mostfrom(next.keySeq().filter(k => next.get(k) !== prev.get(k)).toArray())
            .flatMap(k => {
                let res = next.get(k).keySeq ? tomDiff(prev.get(k), next.get(k), path.concat([k]), newDocument) : mostof(Immutable.Map({ newDocument, path: path.concat([k]), value: next.get(k), previousValue: prev.get(k) }));
                return res;
            });
    // console.log("res",res);
    return res;
};

Stream.prototype.immutableDiff = function () {
    return tomStreamDiff(this);
}
