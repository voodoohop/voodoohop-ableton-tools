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
 
var createInputstreamTransform = (transform, transforms) =>{
  return (inputStream) => {
    // console.log("is",transform,inputStream);
    return (
      transform.depends.length === 0 ?
      (inputStream.map(transform.transform))
      :
      most.zip(
        (...dependsValues) => (transform.transform(...dependsValues)),
        ...(transform.depends.map(dep => transforms[dep](inputStream)))
        )).delay(1)
        // .map(f => (f instanceof Promise) ? f : new Promise(resolve => resolve(f))).flatMap(f => most.fromPromise(f)
         .map(f => f ===undefined ? most.empty() : ((f instanceof Promise) ? most.fromPromise(f) : (f.hasOwnProperty("source") ? f : (f.hasOwnProperty(Symbol.iterator) ? most.from(f) : most.of(f)) )))
        //  .flatMap(f => f
        // // .flatMapError(e => {
        // //   console.error("error_",e);
        // //   return most.of(Immutable.Map({error:e}));
        // // })
        // )    
           
 ;
  }
};

export var registerTransform = (transform) => {
  var dbCached = transform;//dbCachedTransform(transform);
  transforms[dbCached.name] = createInputstreamTransform(dbCached, transforms);
};

export var getTransformed = (requiredTransforms, inputStream) => {
  // console.log("getTransformed", requiredTransforms, transforms);
  return most.zip((...transformed) => transformed.reduce((o,n,i)=> o.set(requiredTransforms[i], n),Immutable.Map()),...requiredTransforms.map(t => transforms[t](inputStream)));
}

registerTransform({ name: "path", transform: input => new Promise(resolve => resolve(input)), depends: [] })