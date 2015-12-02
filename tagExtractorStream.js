var IPCStream = require('electron-ipc-stream');

var taglib = require("thomash-node-audio-metadata");

module.exports = function(mainWindow) {
     var tagExtractStream = new IPCStream('metadataExtractRequest', mainWindow);
     var tagExtractResultStream = new IPCStream('metadataExtractResult', mainWindow);
     tagExtractStream.on("data", (path) => {
       console.log("file:",f);
       var f =new taglib.File(path);
       f.readTaglibMetadata(metadata => {
         console.log("got results",path);
         tagExtractResultStream.write({path: path, metadata: metadata.metadata, audio:metadata.audio});
       })
       
     }); 
	 
}