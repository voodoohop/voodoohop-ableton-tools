import PouchDB from "pouchdb";
import upsert from "pouchdb-upsert";
PouchDB.plugin(upsert);

import Subject from "../utils/subject";
import most from "most";
import _ from "lodash";

import Imm from "immutable";

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
// setInterval(()=>
// pouch.allDocs({
//   include_docs: true,
//   attachments: true
// }).then(function (result) {
//   // handle result
//   console.log("allDocs",result);
// }).catch(function (err) {
//   console.log(err);
// })
//,1000);


export var fetchOrProcess = (sourceDataStream, extractor) => sourceDataStream.flatMap(key => {
	console.log("getting key from pouch",key);
	return most.fromPromise(pouch.get(key)).flatMapError(e => { 
		console.log("returning from error",e);
		// processInputStream.push(key);
		return most.fromPromise(extractor(key)).tap(data => pouch.put(data.set("path",key).toJS(),key));
	})
	}).map(o => Imm.fromJS(o));
	
	

export var db = pouch;