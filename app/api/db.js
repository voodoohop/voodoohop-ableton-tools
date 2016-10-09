import nedb from 'nedb';

import * as most from 'most';
import _ from "lodash";

// import promisify from "es6-promisify";

import Imm from "immutable";

import log from "../utils/streamLog";
import os from "os";

const pjson = require("../../package.json");


const db = new nedb({filename: `${os.homedir()}/.VoodoohopLiveTools_v${pjson.version}.db`/*+Math.random()*/, autoload: true});

// window.PouchDB = pouch;
// var remoteDB = new PouchDB('http://localhost:5984/myremotedbtomtom')

// pouch.replicate.to(remoteDB).on('complete', function () {
//   // yay, we're done!
//   console.log("replicated to couchDB");
// }).on('error', function (err) {
//   // boo, something went wrong!`
// });
// Congratulations, all changes from the localDB have been replicated to the remoteDB.


console.log("got nedb",db);
const dbFind = (...args) => 
    new Promise((resolve,reject) =>             
            db.find(...args, (err,docs) => {
                console.log("got docs",docs,"error",err);
                if (err) reject(err) 
                    else 
                    resolve(docs);
                return;               
            })
        );

// export db;

// export var storeStream(name, stream);

// export var db = {
//     get: () => new Promise((resolve,reject) => resolve(null)), 
//     upsert: () => new Promise(resolve => resolve(null))
// }

import {defaultsDeep} from "lodash";

const checkNoError = item => !item.find(val => val && val.get && val.get("error"));

function addToImmStore(storeName,store, item, key) {
    // if (!item.has(key) && item.has("type"))
    //     return store.setIn()
    // log("addToImmStore"))(store,item,key);

    const storePrefix = storeName+"_";
    // if (item.has(key)) {
        const mergedStore = store.mergeDeep(Imm.Map({[key]:item}));
        const dbKey = storePrefix+key;
        // console.log("upserting",item.toJS());
        if (checkNoError(item))
            db.update({_id: dbKey}, mergedStore.get(key).set("_id",dbKey).toJS(), {upsert:true});
        return mergedStore;
    // };
}

export function dataStore(storeName, newMetadataStreamFunc, keyFunc = (item)=>item.get("path")) {
    const storePrefix = storeName+"_";
    const regex = new RegExp(`/^${storePrefix}/`);
    const preSaved = most.fromPromise(dbFind({
        // _id:regex
        })).map(allDocs => 
            allDocs.reduce((store,doc) => 
                store.set(doc["_id"].replace(storePrefix,""),Imm.fromJS(doc))
                , Imm.Map()) 
            );


    // allDocs({
    //     include_docs: true,
    //     startkey: storeName,
    //     endkey: storeName+'\uffff'}
    
    // ))
    
    return preSaved
        .tap(log("presavedDocs"))
        .flatMap(saved => { 
            const memStore = newMetadataStreamFunc(saved).tap(log("memStoreToDB"))
                            .scan((store,item) => addToImmStore(storeName,store,item,keyFunc(item)), saved).skip(1);
            return memStore.startWith(saved);
    })
    .tap(log("DataStore"));
        //throttledDebounce(500,memStore);    
}

export function invalidateCache(key) {
    console.log("removing",key,"from cache");
    return new Promise(resolve=>db.remove({_id:key}, (err,doc) => resolve(key)));
}

export function cache(key, cacheMissFunc) {
    return new Promise((resolve,reject) => {
        db.findOne({_id: key},(err,doc) => doc ? 
            resolve(Imm.fromJS(doc)) : 
            cacheMissFunc(key)
                .then(res => invalidateCache(key).then(() => db.insert(res.set("_id", key).toJS(), (err,doc) => {
                    if (err) {
                        console.error("cache insert error",err);
                        reject(err);
                    }
                    else
                        resolve(res);
                    
                })))
                .catch(e => {
                    console.error("cacheMiss calculation failure",e);
                    reject(e);
                })
        );
    });
}

// cache("blabla", function() {
//     console.log("calculated cache");
//     return new Promise(resolve => resolve(Imm.Map({val:"cachedValue"})));
// }).then(cachedVal => console.log("cacheTest", cachedVal));


// cache("blabla", function() {
//     console.log("calculated cache");
//     return new Promise(resolve => resolve(Imm.Map({val:"cachedValue"})));
// }).then(cachedVal => console.log("cacheTest", cachedVal));
