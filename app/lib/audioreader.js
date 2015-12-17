/*!
	AudioReader version 0.6.0 ALPHA

	By Epistemex (c) 2015
	www.epistemex.com

	MIT License (this header required)
*/

/**
 * Play a AIFF, CAFF, IFF, AU, WAVE audio files from an url or from a buffer.
 *
 *     AudioReader("http://some.audio/file.ext").then(function(result) {
 *
 *         // play the sample buffer
 *         var aCtx = result.audioContext,          // get shared audio context
 *             source = aCtx.createBufferSource();  // create a playback buffer
 *
 *         source.buffer = result.buffer;           // set our sample data
 *         source.connect(aCtx.destination);        // default output
 *         source.start(0);                         // play - voila!
 *     });
 *
 * If AudioContext is not found in the browser an error is thrown
 * (un-prefixing is applied internally).
 *
 * @param {string|ArrayBuffer} input - url or an existing ArrayBuffer with file data loaded into it
 * @param {AudioContext} [audioCtx] - optionally provide an AudioContext. If none is provided one will be created
 * @returns {Promise} - Returns a promise
 * @static
 */


export default function AudioReader(input, audioCtx) {

	"use strict";

	var Actx = (window.AudioContext || window.webkitAudioContext);

	if (!Actx || !window.Promise)
		throw "Outdated browser";

	return new Promise(function(resolve, reject) {

		// is input a string?
		typeof input === "string" ? loadXHR(input).then(parse, reject) : parse(input);

		function parse(buffer) {

			var view = new DataView(buffer),
				format = detect(view),
				forced = ["aiff", "iff", "au"];

			audioCtx = audioCtx || new Actx();

			// chrome bug: decodeAudioData accepts (A)IFF as valid format but hangs, so force exceptions
			if (forced.indexOf(format) < 0) {
				try {
					audioCtx.decodeAudioData(
						buffer.slice(0),
						function(abuffer) {

							var len = abuffer.length,
								channels = abuffer.numberOfChannels,
								time = abuffer.duration,
								rate = abuffer.sampleRate;

							resolve({
								audioContext    : audioCtx,
								buffer          : abuffer,
								createPlayObject: playObject,
								channels        : channels,
								rate            : rate,
								time            : time,
								bits            : (((time * channels * rate) / len) | 0) * 8,
								frames          : len,
								type            : format || "browser",
								compression     : "",
								internal		: true
							})
						},
						// if decoder couldn't decode this format, use our custom parser
						customParser
					)
				}
				catch(err) {
					//todo check this stage...
					reject(err.message)
				}
			}
			else
				customParser();

			// ---------------------------------------------------------

			function customParser() {

				var chunks, result, type;

				if (format === "au") {
					type = checkAUHeader(view, format);

					if (type.type) {
						chunks = [
							{fourcc: 0xff000011, size: 12, offset: 12},
							{fourcc: 0xff000012, size: type.size - type.offset, offset: type.offset}
						];
						result = parseChunks(audioCtx, view, type, chunks);
						result.buffer ? resolve(result) : reject(result.error);
					}
				}
				else {
					type = checkChunkHeader(view, format, true);

					if (type.type) {
						chunks = getChunks(view, type.lsb, (type.type === "caff"));
						if (chunks.length < 2) reject("Invalid file");

						//todo make async so we can use timeout/webworker for long files
						result = parseChunks(audioCtx, view, type, chunks);
						result.buffer ? resolve(result) : reject(result.error);
					}
				}

				reject(type.error)
			}
		}
	});

	/**
	 * This parses the file header to determine which file format we
	 * are dealing with. Provide a DataView from the already loaded
	 * buffer. An object is returned with type, size and error.
	 * If file is too small or type = null or undefined then the format
	 * is not supported (check error).
	 * @param {DataView} view - data-view with offset 0 on the file buffer
	 * @param {string} format - file type (iff, aiff, au, ...)
	 * @param {boolean} [skipSize=false] - skips size checking for non-conventional chunk formats (ie. caff)
	 * @returns {*}
	 * @private
	 */
	function checkChunkHeader(view, format, skipSize) {
		return skipSize ? {
			type: format,
			size: -1,
			lsb: (format === "wave")
		} :
		getSize(view, format, 4, 8, (format === "wave"), view.buffer.byteLength)
	}

	function checkAUHeader(view, format) {
		var offset = view.getUint32(4),
			res = getSize(view, format, 8, offset, false, view.buffer.byteLength);

		res.offset = offset;
		return res;
	}

	function getSize(view, format, pos, dlt, lsb, wanted) {

		var size = view.getUint32(pos, lsb) + dlt;

		// special AU/CAFF case
		if (size === 0xffffffff) size = view.buffer.byteLength - pos;

		if (size !== wanted) return {
			error: "Invalid size"
		};

		return {
			type: format,
			size: size,
			lsb: lsb
		}
	}

	function getChunks(view, lsb, ext) {

		var pos = ext ? 8 : 12,				// special caff (64-bit size field) support
			max = 10,
			len = view.buffer.byteLength,
			chunks = [],
			fourcc, size, offset;

		try {
			while(pos < len && max--) {

				fourcc = view.getUint32(pos);
				size = ext ? view.getUint32(pos + 8, lsb) : view.getUint32(pos + 4, lsb);
				offset = (ext ? 12 : 8);

				chunks.push({
					fourcc: fourcc,
					size: size,
					offset: pos + offset
				});

				pos += size + offset;
			}
		}
		catch(err) {console.log(err)}

		return chunks;
	}

	function parseChunks(actx, view, type, chunks) {

		var i, chunk, pos, cSize,
			aBuffer, channels, rate, bits, frame, frames, format, formats, time,
			comp = null,
			ccFmt = 0x666D7420,		// WAVE
			ccCOMM = 0x434F4D4D,
			ccData = 0x64617461,	// AIFF / CAFF
			ccSSND = 0x53534E44,
			ccVHDR = 0x56484452,	// IFF 8SVX
			ccCHAN = 0x4348414E,
			ccBODY = 0x424F4459,
			ccAUHEAD = 0xff000011,	// AU virtual chunks
			ccAUDATA = 0xff000012,
			ccCFDESC = 0x64657363,
			errCmpr = "Unsupported format"
			;

		// get sample data information
		for(i = 0; chunk = chunks[i++];) {

			pos = chunk.offset;
			cSize = chunk.size;

			if (chunk.fourcc === ccFmt) {

				formats = [-2, 1]; //, 6, 7, 0x101, 0x102];

				format = view.getInt16(pos, true);
				if (formats.indexOf(format) < 0) return {
					error: errCmpr
				};
				//else if (format === 6) comp = "alaw";
				//else if (format === 7) comp = "ulaw";

				bits = view.getUint16(pos + 14, true);
				channels = view.getUint16(pos + 2, true);
				rate = view.getUint32(pos + 4, true);

			}
			else if (chunk.fourcc === ccCOMM) {

				channels = view.getInt16(pos);
				frames = view.getInt32(pos + 2);
				bits = view.getInt16(pos + 6);
				rate = ieee754ext(new Uint8Array(view.buffer, pos + 8, 10));
			}
			else if (chunk.fourcc === ccVHDR) {

				// fibonacci-delta not supported
				if (view.getUint8(pos + 15) !== 0) return {
					error: errCmpr
				};

				frames = view.getUint32(pos);
				rate = view.getUint16(pos + 12);
				channels = 1;
				bits = 8;
			}
			else if (chunk.fourcc === ccCHAN) {
				// for stereo-iff, use chan chunk to override
				channels = view.getUint8(pos) === 6 ? 2 : 1;
			}
			else if (chunk.fourcc === ccAUHEAD) {

				format = view.getUint32(pos);
				if ((format < 1 || format > 5) && format !== 27) return {
					error: errCmpr
				};

				if (format === 1) {
					comp = "ulaw";
					bits = 8;
				}
				else if (format === 27) {
					comp = "alaw";
					bits = 8;
				}
				else {
					bits = (format - 1) * 8;
				}

				rate = view.getUint32(pos + 4);
				channels = view.getUint32(pos + 8);
			}
			else if (chunk.fourcc === ccCFDESC) {
				rate = view.getFloat64(pos);

				formats = [0x6C70636D, 0x756C6177, 0x616C6177];	// lpcm, ulaw, alaw
				format = view.getUint32(pos + 8);
				if (formats.indexOf(format) < 0) return {
					error: errcomp
				};

				if (format === 0x756C6177) comp = "ulaw";
				else if (format === 0x616C6177) comp = "alaw";

				channels = view.getUint32(pos + 24);
				bits = view.getUint32(pos + 28);
			}
		}

		frame = (rate * channels * bits) / 8;
		if (!frames) frames = Math.ceil(cSize / frame) * rate;

		// get samples - expect one chunk only
		for(i = 0; chunk = chunks[i++];) {

			pos = chunk.offset;
			cSize = chunk.size;

			if (chunk.fourcc === ccData) {
				aBuffer = convert(actx, view, cSize, pos, channels, rate, bits, frames, true);
			}
			else if (chunk.fourcc === ccSSND) {
				cSize -= 8;	// SSND chunks include block size and offset
				pos += 8;
				aBuffer = convert(actx, view, cSize, pos, channels, rate, bits, frames, false);
			}
			else if (chunk.fourcc === ccBODY) {
				//todo possible need to support the SEQN/FADE chunks if sequence data
				aBuffer = convert(actx, view, cSize, pos, channels, rate, bits, frames, false);
			}
			else if (chunk.fourcc === ccAUDATA) {
				aBuffer = convert(actx, view, cSize, pos, channels, rate, bits, frames, false, comp);
			}
		}

		time = frame ? cSize / frame : 0;

		return aBuffer ? {
			audioContext: actx,
			buffer: aBuffer,
			type: type.type,
			channels: channels,
			rate: rate,
			bits: bits,
			time: time,
			frames: frames,
			compression: comp ? comp : "",
			createPlayObject: playObject
		} : {
			error: "Error creating audio buffer"
		}
	}

	function convert(actx, view, length, offset, channels, rate, bits, frames, lsb, comp) {

		try {
			var aBuffer = actx.createBuffer(channels, frames, rate),
				pos, t, i, j,
				block = view.buffer.byteLength - offset,
				chArr = [],
				dlt = bits / 8,
				dithers = [0,1,2,3,3,2,1,0],
				dither = AudioReader.dither,
				calls = [dither ? get8Dlsb : get8lsb, get16lsb, get24P, get32lsb,
						 dither ? get8Dmsb : get8msb, get16msb, get24P, get32msb],
				ci, get;

			// using compression?
			if (comp) {
				if (comp === "ulaw") {
					get = getUlaw;
				}
				else if (comp === "alaw") {
					get = getAlaw;
				}
			}
			else {
				ci = ((bits / 8) - 1) + (lsb ? 0 : 4);
				get = calls[ci];
			}

			// build channel array
			for(i = 0; i < channels; i++)
				chArr.push(aBuffer.getChannelData(i));

			pos = offset;
			i = t = 0;

			if (length > block) length = block;

			while(i < length) {
				for(j = 0; j < channels;) {
					chArr[j++][t] = get(pos + i);
					i += dlt;							// data buffer position
				}
				t++;									// channel buffer position
			}

			return aBuffer;
		}
		catch(err) {
			console.log(err);
			return null
		}

		function get8lsb(pos) {
			var s = view.getInt8(pos, true);
			return s < 0 ? s / 128 : s / 127
		}

		function get8msb(pos) {
			var s = view.getInt8(pos);
			return s < 0 ? s / 128 : s / 127
		}

		function get16lsb(pos) {
			var s = view.getInt16(pos, true);
			return  s < 0 ? s / 32768 : s / 32767
		}

		function get16msb(pos) {
			var s = view.getInt16(pos);
			return  s < 0 ? s / 32768 : s / 32767
		}

		function get24P(pos) {
			return ((view.getInt32(pos, true) & 0xffffff) << 8) / 8388607
		}

		//function get24U(pos) {return (view.getInt32(pos, true)}
		function get32lsb(pos) {
			var s = view.getInt32(pos, true);
			return s < 0 ? s / 2147483648 : s / 2147483647
		}

		function get32msb(pos) {
			var s = view.getInt32(pos);
			return s < 0 ? s / 2147483648 : s / 2147483647
		}

		function get8Dlsb(pos) {
			var b = view.getInt8(pos, true) << 8;
			b = b & ~dithers[b % 8];
			return b < 0 ? b / 32768 : b / 32767
		}

		function get8Dmsb(pos) {
			var b = view.getInt8(pos) << 8;
			b = b & ~dithers[b % 8];
			return b < 0 ? b / 32768 : b / 32767
		}

		function getUlaw(pos) {
			return ulaw2norm(view.getUint8(pos))
		}

		function getAlaw(pos) {
			return alaw2norm(view.getUint8(pos))
		}

		function ulaw2norm(sample) {
			sample = ~sample;
			var i = ((sample & 0xf) << 3) + 0x84;
			i <<= (sample & 0x70) >> 4;
			sample = sample & 0x80 ? 0x84 - i : i - 0x84;
			return  sample < 0 ? sample / 32768 : sample / 32767;
		}

		function alaw2norm(a_val) {

			var t;
			var seg;

			a_val ^= 0x55;

			t = (a_val & 0xf) << 4;
			seg = (a_val & 0x70) >> 4;

			switch (seg) {
				case 0:
					t += 8;
					break;
				case 1:
					t += 0x108;
					break;
				default:
					t += 0x108;
					t <<= seg - 1;
			}
			t = (a_val & 0x80) ? t : -t;
			return  t < 0 ? t / 32768 : t / 32767;
		}

	}

	function playObject() {
		var src = this.audioContext.createBufferSource();
		src.buffer = this.buffer;
		src.connect(this.audioContext.destination);
		if (!src.start) src.start = src.noteOn;
		return src;
	}

	function ieee754ext(byteArray) {

		var sign = (byteArray[0] & 128),
			exp = (((byteArray[0] & 127) << 8) | byteArray[1]) - 16383,
			sum = 0, i = 2, b,
			len = byteArray.length;

		for (; i < len; i++) {
			for (b = 7; b >= 0; b--) {
				if (byteArray[i] & (1 << b)) {
					sum += exp < 0 ? 1 / (Math.pow(2, -exp)) : Math.pow(2, exp);
				}
				exp--;
			}
		}

		return sign ? sum * -1 : sum;
	}

	/**
	 * Loads a file as ArrayBuffer from the specified url. The method
	 * returns a promise.
	 * @param {string} url - file to load
	 * @returns {Promise}
	 * @private
	 */
	function loadXHR(url) {

		return new Promise(function(resolve, reject) {
			try {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", url);
				xhr.responseType = "arraybuffer";
				xhr.onerror = function() {reject("Network error.")};
				xhr.onload = function() {
					if (xhr.status === 200) {resolve(xhr.response)}
					else {reject("Loading error:" + xhr.statusText)}
				};
				xhr.send();
			}
			catch(err) {reject(err.message)}
		});
	}

	/**
	 * Simple format detection to filter supported formats
	 * @param view
	 * @returns {string}
	 */
	function detect(view) {

		if (view.buffer.byteLength < 64) return null;

		var head = view.getUint32(0),
			mark = view.getUint32(8);

		switch(head) {
			case 0x464F524D:
				if (mark === 0x41494646) return "aiff";
				if (mark === 0x38535658) return "iff";
				break;
			case 0x52494646:
				if (mark === 0x57415645) return "wave";
				break;
			case 0x4F676753:
				return "ogg";
			case 0x664C6143:
				return "flac";
			case 0x2E736E64:
				return "au";
			case 0x63616666:
				return "caff";
		}

		// mp3
		if (head & 0xffffff00 === 0x49443300)	// simple non-secure test, but if it happen to be a ID chunk at the start, why not..
			return "mp3";

		//todo need to parse buffer to detect frames for mp3 0xfff/0xffe, calc frame size, check next...

		return null
	}
}

/**
 * Enable dithering of 8-bit data. Enabled (true) by default.
 * @type {boolean}
 */
AudioReader.dither = true;
