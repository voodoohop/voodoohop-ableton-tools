Ableton Live DJing and Harmonic Mixing addons
------------------

[![Video demo](http://img.youtube.com/vi/DGWDu8ECST0/0.jpg)](http://www.youtube.com/watch?v=DGWDu8ECST0)

Want to beta test my Ableton Live DJing and harmonic mixing addons?

- shows the waveforms of tracks playing in a convenient floating window
- reads the warp markers of the audio files and shows the properly warped waveform with the aligned playing positions
- if you have a software like Mixed in Key or the free Keyfinder it will read the key tags and color the waveforms accordingly
- transposing the clips in live will change the color of the waveform allowing you to quickly match the audio harmonically
- harmonic wheel showing relationship between playing songs and how pitching them will change their harmony
- choose between different key notations (camelot, open key and traditional)
- midi-mappable zoom of the waveforms
- apart from the tracks that are currently playing it will also show the waveform and harmony of the clip currently selected in live's detail view
- can update the color and name of the selected clip inside the live set, reflecting its harmony
- the waveform display contains an inner waveform which visualizes the low end portion of the audio
- shows live's loop points

and more which i forgot...

sorry **mac only** for now

-------------------------------
Instructions:

Unzip the archive and open the application.

It will show two draggable devices.

1. The Voodohoop Live Tools Master which you should put on your Master track
2. The Voodoohop Track Sender which you should put on every track you want to monitor.

![device drag Screenshot][devicedrag]

***

The Master device lets you control general parameters, such as zoom, desired type of key notation and transmits the currently selected clip to the App.

![Master Device Screenshot][masterdevice]

***

The Track Sender Device transmits information about the currently playing clip to the Voodoohop Live Tools application which then analyses and continuously displays it.

***

To hide and show the window from anywhere you can press Ctrl-Shift-V.

In order for the program to read the warp markers correctly you need to hit the little "save" button on the clip's detail view. Otherwise it will display 120.00bpm and not show the waveform correctly.

![working Screenshot][working]



Download:
--------------
https://goo.gl/forms/EK0lCZdkX5KXA1Q03

Sorry for the file size. I will reduce it at some point. 

***

Please give me feedback.

If you are interested in participating in development send me a message. The application is written with node.js and react. A small Max for Live device sends the data from the live set to the application.

thanks to the feedback from a bunch of you and some spare time i managed to improve the Voodoohop Live Tools. 

contact: thomas@voodoohop.com


[devicedrag]: https://github.com/voodoohop/voodoohop-ableton-tools/blob/master/screenshot_device_drag_sm.png?raw=true "Voodoohop Live Tools opening screenshot"
[working]: https://github.com/voodoohop/voodoohop-ableton-tools/blob/master/screenshot_working.png?raw=true "Voodoohop Live Tools working screenshot"
[masterdevice]: https://github.com/voodoohop/voodoohop-ableton-tools/blob/master/screenshot_master_device.png?raw=true "Voodoohop Live Tools working screenshot"
