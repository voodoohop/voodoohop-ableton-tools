taglib.js
=========

This repository provides a build of the taglib metadata reading library in JavaScript.

Taglib API
----------

The API should be quite straight-forward:

```
var file = // Request a File object

// Synchronous API, no arguments
file.readTaglibMetadata(function (data) {
  console.log("File metadata:", data);
});

// Synchronous API, forcing format
file.readTaglibMetadata({format: "ogg/vorbis"}, function (data) {
  console.log("File metadata:", data);
});

// Asynchonous API, also forcing format
file.readTaglibMetadata({
    worker: true,
    path: "http://localhost:8000/taglib.js",
    format: "mp4"
  }, function (data) {
    console.log("File metadata:", data);
});
```

Typical output is:

```
{
  "metadata": {
    "album": "Live At The Harlem Square Club, 1963: One Night Stand",
    "artist": "Sam Cooke",
    "date": "1963",
    "genre": "R&B",
    "title": "Twistin' the Night Away",
    "tracknumber": "5"
  },
  "audio": {
    "length": 259,
    "bitrate": 256,
    "channels": 2,
    "samplerate": 44100
  }
}
```

#### Format

Default format detection is based on file name and is quite simplistic:

```
function guessFormat(fname) {
  if (/\.mp3$/i.test(fname)) {
    return "mpeg";
  }

  if (/\.ogg$/i.test(fname)) {
    return "ogg/vorbis";
  }

  if (/\.mp4$/i.test(fname)) {
    return "mp4";
  }

  if (/\.aac$/i.test(fname)) {
    return "mp4";
  }

  if (/\.m4a$/i.test(fname)) {
    return "mp4";
  }

  if (/\.wav$/i.test(fname)) {
    return "wav";
  }
}
```

This is also the list of accepted formats for now. It should, however, be rather easy to add more formats
[supported by TagLib](http://taglib.github.io/api/namespaceTagLib.html).

If you force the format, the library should also work on blobs without a name.

#### Asynchronous API

The synchronous API will load the entire file in memory. Using the asynchronous API, the library
will only read parts of the file required to read metadata. It is thus the recommended API if you
plan on using the library with big files.

Does it work?
-------------

Certainly so! Check the `examples/` directory.

Author
------

Romain Beauxis <toots@rastageeks.org>

Code derived from libmp3lame-js by:
Andreas Krennmair <ak@synflood.at>

License
-------

taglib.js is published under the license terms as taglib, i.e. is the
GNU Lesser General Public License.
