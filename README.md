Ableton Live DJing and harmonic mixing addons
------------------

important! you need to follow the link to download the application. the device i uploaded here won't do anything by itself.

someone want to beta test my Ableton Live DJing and harmonic mixing addons?

- shows the waveforms of tracks playing in a convenient floating window
- reads the warp markers of the audio files and shows the properly warped waveform with the aligned playing positions
- if you have a software like mixed in key or the free keyfinder it will read the key tags and color the waveforms accordingly
transposing the clips in live will change the color of the waveform allowing you to quickly match the audio harmonically
- harmonic wheel showing relationship between playing songs and how pitching them will change their harmony
- and more which i forgot...

and more which i forgot...

sorry mac only for now

-------------------------------
Instructions:

In the following .zip archive there is one application and a Max for Live device.

The Max for Live device is meant to be put on each track in your Live set you want to monitor. It sends the information about the currently playing clip to the Voodoohop Live Tools application which then analyses the metadata etc.

Sorry about the file size. I will reduce it at some point. 

Sometimes you have to restart the Voodoohop Live Tools when it just shows "loading..." for example. Just click on the window and hit Apple-R.

To hide and show the window from anywhere you can press Ctrl-Shift-V.

In order for the program to read the warp markers correctly you need to hit the little "save" button on the clip's detail view. Otherwise it will display 120.00bpm and not show the waveform correctly.

Download:
--------------
https://goo.gl/forms/EK0lCZdkX5KXA1Q03
--------------

Please give me feedback. Let me know if the transposing changes the color properly for example.

If you are interested in participating in development send me a message. The application is written with node.js and react. A small Max for Live device sends the data from the live set to the application.


thanks to the feedback from a bunch of you and some spare time i managed to improve the Voodoohop Live Tools. 

- a number of bugs have been fixed
- it now should reliably read the mostly used audio formats (.wav, .flac, .aiff, .mp3, .ogg). 
- it interprets the key information of all three major formats (openkey, camelot, beatport and regular chord notation)
- doesn't freeze anymore when encountering an audio format it cannot process
- if it can't find the key tag inside the audio file it will try and parse it from the filename
- experimental feature: it shows an inner waveform that represents the amplitude of the bass part of the sound
