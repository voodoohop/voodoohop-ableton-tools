

import * as most from 'most';

const Stream = most.Stream;


import {toJSON as immToJson, fromJSON as immFromJson} from "transit-immutable-js";

import log from "../utils/streamLog";
import Immutable from "immutable";

const logger = log("bufferedThrottleLog");

const saveError=(e) => {
    if (e instanceof Promise)
        return most.fromPromise(e).flatMap(saveError);
    return most.of(e.get ? e : Immutable.Map({ error: e }));
}
var tst = most.from([1, 2, 3, 4, 5, 10, 11, 12, 14, 515, 800]).delay(3000).bufferedThrottle(300)
    .throttledDebounce(1100);

// tst.observe(i => console.log("bufferedThrottle", i));
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
        console.error("error1_", transform,f);


        console.error(e);
        return saveError(e);
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

const errorInAny = (dependsValues) => dependsValues.find(v => v && v.get && v.get("error"))

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
                        return saveError(e);
                    }).multicast()
                :
                most.zip(
                    (...dependsValues) => (
                        errorInAny(dependsValues) || transform.transform(...dependsValues)),
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
                        return saveError(e);
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
            return saveError(e);
        })))
        .multicast();
}

registerTransform({ name: "path", transform: input => input, depends: [] });