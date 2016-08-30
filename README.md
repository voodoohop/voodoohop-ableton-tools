Voodoohop Live Tools
- shows the waveforms of tracks playing in your live in a convenient floating window
- reads the warp markers of the audio files and shows the properly warped waveform
- if you have a software like mixed in key or the free keyfinder it will read the scale tags and color the waveforms accordingly
- transposing the clips in live will change the color of the waveform allowing you to quickly match tracks harmonically
and more which i forgot...

sorry mac only for now

Instructions
-------------------

In the following .zip archive there is one application and a Max for Live device.

The Max for Live device is meant to be put on each track in your Live set you want to monitor. It sends the information about the currently playing clip to the Voodoohop Live Tools application which then analyses the metadata etc.

Sorry about the file size. I will reduce it at some point.

Sometimes you have to restart the Voodoohop Live Tools when it just shows "loading..." for example. Just click on the window and hit Apple-R.

To hide and show the window from anywhere you can press Ctrl-Shift-V.

In order for the program to read the warp markers correctly you need to hit the little "save" button on the clip's detail view. Otherwise it will display 120.00bpm and not show the waveform correctly.

Please give me feedback. Let me know if the transposing changes the color properly for example.

If you are interested in participating in development send me a message. The application is written with node.js and react. A small Max for Live device sends the data from the live set to the application.


Download
----------------
http://bit.ly/VoodoohopLiveTools
