var most = require("most");
var Stream = require('most').Stream;

import Immutable from "immutable";

import {db} from "./db";

Stream.prototype.collect = function () {
  return this.reduce((xs, x) => { xs.push(x); return xs; }, []);
};


// most.from([1, 2, 3, 4]).collect().then(x=>
//   console.log("collectTest", x));



export var transforms = {};

function saveToDb(path, transformName, transformFunc, inputs, resolve, reject) {
    var res= transformFunc(...inputs);
            if (!(res instanceof Promise)) {
              var resOld = res;
              res = new Promise(resolve => resolve(resOld));
            }            
            res.then(result => {
              db.upsert(path, doc => {
                doc[transformName] = result && result.toJS ? result.toJS():result;
                console.log("upserting doc",{path,transformName,inputs});
                resolve(result);
                return doc;
              });
             
             
            },result => {
              db.upsert(path, doc => {
                doc[transformName] = {error: result && result.toJS ? result.toJS():result};
                console.log("upserting error doc",doc[transformName],path);
                reject(result);
                return doc;
              });
            
            });
}
import {mapStackTrace} from "sourcemapped-stacktrace";
var dbCachedTransform = (transform) => {
    if (transform.depends.length === 0 || transform.noCache)
      return transform;
    return ({
      name: transform.name,
      depends: transform.depends.concat(["path"]),
      transform: (...inputs) => {
       var path= inputs.pop();
       
       
      //  return res;
      return new Promise((resolve,reject) => 
        db.get(path).then((doc) => {
          if (!doc[transform.name]) {
            saveToDb(path, transform.name, transform.transform, inputs,resolve,reject);
            return;
          } else
            resolve(Immutable.fromJS(doc[transform.name]));
        })
        .catch( () => {
            saveToDb(path, transform.name, transform.transform, inputs,resolve,reject);
          
            // return;
                      
         }
        ));
      //  if (res instanceof Promise) {
      //   return res.then(resval => {
      //     var jsonRes = (resval instanceof Object) && (typeof resval.toJS ==="function") ? resval.toJS() : resval;
      //     console.log("---dbinsert", path, transform.name,jsonRes);
      //     return resval
      //   }); 
      //  }
      //  else
      //   return res;
      }
     });
  };
 
 function mostify(f, transform=null) {
   console.log("mostifying",(f && f.toJS && f.toJS())||f);
   var res= f ===undefined ? most.empty() : ((f instanceof Promise) ? most.fromPromise(f) : (f.hasOwnProperty("source") ? f : (f.hasOwnProperty(Symbol.iterator) && ! (f instanceof String) ? most.from(f) : most.of(f)) ));
   
   return res.flatMapError(e => {
                  
            //      if (e && e.stack)
            //  mapStackTrace(e.stack,st => console.error("error_",st));
          
          // else
          console.error("error1_",transform,e);
          return most.of(Immutable.Map({error:e}));
        })
 }
 
var createInputstreamTransform = (transform, transforms) =>{
  return (inputStream) => {
    // console.log("is",transform,inputStream);
    return (
      transform.depends.length === 0 ?
       inputStream.flatMap(e => mostify(e,transform)).map(transform.transform).flatMapError(e => {
        // if (e && e.stack)
        //      mapStackTrace(e.stack,st => console.error("error_",st));
          
        //   else
          console.error("error1_",transform, e);
          return most.of(Immutable.Map({error:e}));
        })
      :
      most.zip(
        (...dependsValues) => (transform.transform(...dependsValues)),
        ...(transform.depends.map(dep => transforms[dep](inputStream)))
        ))//.delay(1)
        // .map(f => (f instanceof Promise) ? f : new Promise(resolve => resolve(f))).flatMap(f => most.fromPromise(f)
         
         .flatMap(e => mostify(e,transform)
 
        ).multicast();
  }
};

export var registerTransform = (transform) => {
  var dbCached = transform;//dbCachedTransform(transform);
  transforms[dbCached.name] = createInputstreamTransform(dbCached, transforms);
};

export var getTransformed = (requiredTransforms, inputStream) => {
  // console.log("getTransformed", requiredTransforms, transforms);
  return most.zip((...transformed) => transformed.reduce((o,n,i)=> o.set(requiredTransforms[i], n),Immutable.Map()),...requiredTransforms.map(t => transforms[t](inputStream)))
    // .multicast();
}

registerTransform({ name: "path", transform: input => input, depends: [] })