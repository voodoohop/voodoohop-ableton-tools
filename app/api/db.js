import nedb from 'nedb';

import * as most from 'most';
import _ from "lodash";

import Imm from "immutable";

import log from "../utils/streamLog";
import os from "os";

const pjson = require("../../package.json");


const db = new nedb({ filename: `${os.homedir()}/.VoodoohopLiveTools_v${pjson.version}.db`/*+Math.random()*/, autoload: true });

console.log("got nedb", db);
const dbFind = (...args) =>
    new Promise((resolve, reject) =>
        db.find(...args, (err, docs) => {
            console.log("got docs", docs, "error", err);
            if (err) reject(err)
            else
                resolve(docs);
            return;
        })
    );


import { defaultsDeep } from "lodash";

const checkNoError = item => !item.find(val => val && val.get && val.get("error"));

function addToImmStore(storeName, store, item, key) {

    const storePrefix = storeName + "_";

    const mergedStore = store.mergeDeep(Imm.Map({ [key]: item }));
    const dbKey = storePrefix + key;

    if (checkNoError(item))
        db.update({ _id: dbKey }, mergedStore.get(key).set("_id", dbKey).toJS(), { upsert: true });
    return mergedStore;

}

const dotRegexp = new RegExp("\\.", 'g');
const dollarRegexp = new RegExp("\\$", 'g');
const sanitizeKey = (unprocessedKey) => unprocessedKey.replace(dotRegexp, "_").replace(dollarRegexp, "_");

const sanitizeKeys = immMap => immMap.mapKeys(sanitizeKey).map(v => v instanceof Object && v.mapKeys ? sanitizeKeys(v) : v);

export function invalidateCache(unprocessedKey) {
    const key = sanitizeKey(unprocessedKey);
    console.log("removing", key, "from cache");
    return new Promise(resolve => db.remove({ _id: key }, (err, doc) => resolve(key)));
}

export function cache(unprocessedKey, cacheMissFunc) {
    log("getting from cache")(unprocessedKey);
    const key = unprocessedKey;//sanitizeKey(unprocessedKey);
    return new Promise((resolve, reject) => {
        db.findOne({ _id: key }, (err, doc) => doc ?
            resolve(Imm.fromJS(doc)) :
            cacheMissFunc(key)
                .then(sanitizeKeys)
                .then(res => invalidateCache(key).then(() => db.insert(res.set("_id", key).toJS(), (err, doc) => {
                    if (err) {
                        console.error("cache insert error", err, key);
                        console.error('tried inserting', res.toJS());
                        reject(err);
                    }
                    else
                        resolve(res);

                })))
                .catch(e => {
                    console.error("cacheMiss calculation failure", e);
                    reject(e);
                })
        );
    });
}
