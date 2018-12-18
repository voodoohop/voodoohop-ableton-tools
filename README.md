Ableton Live DJing and Harmonic Mixing addons
------------------

# Voodoohop Harmony and Tempo Tools for Ableton Live

Augments Ableton Live with an intuitive visualization of musical harmony as well as allowing a track’s tempo dynamics to control the master tempo in real-time. This opens up a variety of new, creative possibilities for DJing, playing live sets and even producing.

download: [https://goo.gl/forms/EK0lCZdkX5KXA1Q03](https://goo.gl/forms/EK0lCZdkX5KXA1Q03)

![The interface in split view. It can also be made into a floating window or hidden.](https://cdn-images-1.medium.com/max/2000/1*521WOyO6NBYfPPOZv43Icw.png)*The interface in split view. It can also be made into a floating window or hidden.*

## Harmonic Mixing
> **Harmonic mixing** is a [DJ](https://en.wikipedia.org/wiki/DJ)’s [continuous mix](https://en.wikipedia.org/wiki/Continuous_mix) between two pre-recorded tracks that are most often either in the same key, or their keys are [relative](https://en.wikipedia.org/wiki/Relative_key) or in a [subdominant](https://en.wikipedia.org/wiki/Subdominant)or [dominant](https://en.wikipedia.org/wiki/Dominant_(music)) relationship with one another.
> The primary goal of harmonic mixing is to create a smooth transition between songs. Songs in the same key do not generate a [dissonant](https://en.wikipedia.org/wiki/Consonance_and_dissonance) tone when mixed. This technique enables DJs to create a harmonious and consonant [mashup](https://en.wikipedia.org/wiki/Mashup_(music)) with any [music genre](https://en.wikipedia.org/wiki/Music_genre). (wikipedia)

DJs usually try to create an overall narrative to their sets which rises and falls in intensity. By taking the harmony of different tracks into account the performer can create an additional harmonic narrative to the set and at the same time avoid conflicting or dissonant mixes. The circle of fifths, from music theory, can be used to help the performer map possible paths for their set.
> The **Circle of Fifths** shows the relationships among the twelve tones of the chromatic scale, their corresponding key signatures, and their associated relative minor and major keys. This chart is really helpful when composing melodies and harmonies because it helps you figure out notes that work together and sound the most musical. For DJs, it is just a handy chart that will guide you to choose what tracks will go well together better. (dubspot)

![The harmonic wheel visualization using the traditional chord notation.](https://cdn-images-1.medium.com/max/2000/1*cZcPlKdVNTwxF_HPW8YPZg.png)*The harmonic wheel visualization using the traditional chord notation.*

### Why Ableton Live?

Ableton Live is an ideal tool to help explore harmonic mixing since by “warping” of audio tracks it allows modifying their pitch independently of their tempo in real-time.

<center><iframe width="560" height="315" src="https://www.youtube.com/embed/4TBwbnvVHJM" frameborder="0" allowfullscreen></iframe></center>

## Dynamic Tempo Following

Since the dawn of drum machines, sequencing and MIDI synchronization electronic music has predominantly worked with fixed tempos that don’t change throughout the duration of a track. These days, modern Digital Audio Workstations such as Ableton Live can map the tempo changes of existing tracks and allow “warping” them in order for them to play in time with the other elements.

shows the waveforms of tracks playing in a convenient floating window

* reads warp markers of audio files and shows the properly warped waveform with the aligned playing positions

* if the audio has key information (e.g. tagged by [Mixed in Key](http://www.mixedinkey.com/) or the free [Keyfinder](http://www.ibrahimshaath.co.uk/keyfinder/) ) it will read the key tags and color the waveforms accordingly

* transposing the clips in Live will change the color of the waveform allowing you to quickly match the audio harmonically

* harmonic wheel shows relationship between playing songs and how pitching them will change their harmony

* choose between different key notations (camelot, open key and traditional)

![](https://cdn-images-1.medium.com/max/2000/1*LfkRW_hAb7BUqAL4d1TU1g.png)

* midi-mappable zoom of the waveforms

* apart from the tracks that are currently playing it will also show the waveform and harmony of the clip currently selected in live’s detail view

* can update the color and name of the selected clip inside the live set, reflecting its harmony

* the waveform display contains an inner waveform which visualizes the low end portion of the audio

* shows live’s loop points

![Playing clip Bpm: Current tempo of clip being played, Ramp time: time to reach the clip’s Bpm, Follow: lock live’s tempo to the playing clip’s tempo](https://cdn-images-1.medium.com/max/2000/1*jMEo47eWM5l5w4zDBvNKHg.png)*Playing clip Bpm: Current tempo of clip being played, Ramp time: time to reach the clip’s Bpm, Follow: lock live’s tempo to the playing clip’s tempo*

*(developed in partnership with [Elliot Fouchy](undefined))*


[![Video demo](http://img.youtube.com/vi/DGWDu8ECST0/0.jpg)](http://www.youtube.com/watch?v=DGWDu8ECST0)

Want to beta test my Ableton Live DJing and harmonic mixing addons?

- shows the waveforms of tracks playing in a convenient floating window
- reads warp markers of audio files and shows the properly warped waveform with the aligned playing positions
- if the audio has key information (e.g. tagged by [Mixed in Key](http://www.mixedinkey.com/) or the free [Keyfinder](http://www.ibrahimshaath.co.uk/keyfinder/) ) it will read the key tags and color the waveforms accordingly
- transposing the clips in Live will change the color of the waveform allowing you to quickly match the audio harmonically
- harmonic wheel shows relationship between playing songs and how pitching them will change their harmony
- choose between different key notations (camelot, open key and traditional)
- midi-mappable zoom of the waveforms
- apart from the tracks that are currently playing it will also show the waveform and harmony of the clip currently selected in live's detail view
- can update the color and name of the selected clip inside the live set, reflecting its harmony
- the waveform display contains an inner waveform which visualizes the low end portion of the audio
- shows live's loop points

and more which i forgot...

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
