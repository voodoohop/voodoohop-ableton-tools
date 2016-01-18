import PouchDB from "pouchdb";
import upsert from "pouchdb-upsert";
PouchDB.plugin(upsert);

import Subject from "../utils/subject";
import most from "most";
import _ from "lodash";

import Imm from "immutable";

import log from "../utils/streamLog";
export var pouch = new PouchDB("thomashMusicMusicNow"/*+Math.random()*/);
window.PouchDB = pouch;
// var remoteDB = new PouchDB('http://localhost:5984/myremotedbtomtom')

// pouch.replicate.to(remoteDB).on('complete', function () {
//   // yay, we're done!
//   console.log("replicated to couchDB");
// }).on('error', function (err) {
//   // boo, something went wrong!
// });
// Congratulations, all changes from the localDB have been replicated to the remoteDB.


console.log("got pouch",pouch);

import throttledDebounce from "../utils/throttledDebounce";

export var fetchOrProcess = (sourceDataStream, extractor) => sourceDataStream.flatMap(key => {
	console.log("getting key from pouch",key);
	return most.fromPromise(pouch.get(key)).flatMapError(e => { 
		console.log("returning from error",e);
		// processInputStream.push(key);
		return most.fromPromise(extractor(key)).tap(data => pouch.put(data.set("path",key).toJS(),key));
	})
	}).map(o => Imm.fromJS(o));
	
	
export var db = pouch;

// export var storeStream(name, stream);

// export var db = {
//     get: () => new Promise((resolve,reject) => resolve(null)), 
//     upsert: () => new Promise(resolve => resolve(null))
// }

import {defaultsDeep} from "lodash";

function addToImmStore(storeName,store, item, key) {
    // if (!item.has(key) && item.has("type"))
    //     return store.setIn()
    
    // if (item.has(key)) {
        console.log("upserting",item.toJS());
        db.upsert(storeName+"_"+key, doc => {
				if (doc === null)
                    doc = {};
                var mergedDoc = Imm.fromJS(doc).mergeDeep(item);
                console.log("merged",mergedDoc.toJS());
                return mergedDoc.toJS();
              });
        return store.mergeDeep(Imm.Map().set(key,item))
    // };
}

export function dataStore(storeName, stream, keyFunc = (item)=>item.get("path")) {
    
    return most.fromPromise(db.allDocs({
        include_docs: true,
        startkey: storeName,
        endkey: storeName+'\uffff'}
    
    )).tap(log("allDocs")).flatMap(allDocs => { 
        var saved = allDocs.rows.reduce((store,row) => store.set(row.id.replace(storeName+"_",""),Imm.fromJS(row.doc)),Imm.Map());
     console.log("presaved",saved.toJS(),allDocs);
    var memStore = stream.tap(log("memStoreToDB"))
    .scan((store,item) => addToImmStore(storeName,store,item,keyFunc(item)), saved).skip(1);
    return memStore.startWith(saved);
    });
        //throttledDebounce(500,memStore);    
}