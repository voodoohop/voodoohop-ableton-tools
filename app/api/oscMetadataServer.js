import { oscInputStream, oscOutput } from "../utils/oscInOut";

import { getPathPromise } from "../store/metadataStore";


import { Map, fromJS } from "immutable";

import actionStream from "./actionSubject";

import { from } from "most";

import log from "../utils/streamLog";

const loadingMetadata = oscInputStream
    // .tap(([cmd,data]) => console.log("cmd,data",cmd,data))
    .filter(([cmd, value]) => cmd == "get_metadata")
    .map(([_, path]) => path)
    // .tap(log("getMetadataPath"))
    // .flatMap(
    //     path => metadataStore.map(metadata => Map({path, metadata:metadata.getIn([path,"id3Metadata"])})).skipImmRepeats()
    // )
    .tap(log("getMetadataRequested"))
    .multicast();

// const needToLoad = loadingMetadata.filter(d => !d.get("metadata")).map((d) => Map({action: "loadMetadata", path: d.get("path")}))

// actionStream.plug(needToLoad);

oscOutput.plug(loadingMetadata
    .map(path => getPathPromise(path))

    .tap(log("pathPromise metadataServer"))
    .await()
    // .map(d => d.get("metadata"))
    .filter(d => d.get("id3Metadata"))
    .flatMap(d => from(d.get("id3Metadata")
        .set("warpBpm", d.getIn(["warpMarkers", "baseBpm"]))
        // .set("transposedKey", d.getIn(["liveData", "transposedKey"]))
        .map((val, key) => Map({ trackId: "got_metadata", args: fromJS([d.get("path"), key, val]) })).toArray()))

    .tap(log("sendingBack"))
);



    // .combine(
    //     (path,metadata) => metadata.contains(path) ? 
    //         most.of(metadata.get(path))
    //         :

    //         , metadataStore)

    // ;