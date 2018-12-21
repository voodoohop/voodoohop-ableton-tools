# Voodoohop Harmony and Tempo Tools for Ableton Live

Augments Ableton Live with an intuitive visualization of musical harmony as well as allowing a track’s tempo dynamics to control the master tempo in real-time. This opens up a variety of new, creative possibilities for DJing, playing live sets and even producing.

Download(https://goo.gl/forms/EK0lCZdkX5KXA1Q03v)!

![The interface in split view. It can also be made into a floating window or hidden.](https://cdn-images-1.medium.com/max/2000/1*521WOyO6NBYfPPOZv43Icw.png)*The interface in split view. It can also be made into a floating window or hidden.*

## Harmonic Mixing
> **Harmonic mixing** is a [DJ](https://en.wikipedia.org/wiki/DJ)’s [continuous mix](https://en.wikipedia.org/wiki/Continuous_mix) between two pre-recorded tracks that are most often either in the same key, or their keys are [relative](https://en.wikipedia.org/wiki/Relative_key) or in a [subdominant](https://en.wikipedia.org/wiki/Subdominant)or [dominant](https://en.wikipedia.org/wiki/Dominant_(music)) relationship with one another.
> The primary goal of harmonic mixing is to create a smooth transition between songs. Songs in the same key do not generate a [dissonant](https://en.wikipedia.org/wiki/Consonance_and_dissonance) tone when mixed. This technique enables DJs to create a harmonious and consonant [mashup](https://en.wikipedia.org/wiki/Mashup_(music)) with any [music genre](https://en.wikipedia.org/wiki/Music_genre). (wikipedia)

DJs usually try to create an overall narrative to their sets which rises and falls in intensity. By taking the harmony of different tracks into account the performer can create an additional harmonic narrative to the set and at the same time avoid conflicting or dissonant mixes. The circle of fifths, from music theory, can be used to help the performer map possible paths for their set.
> The **Circle of Fifths** shows the relationships among the twelve tones of the chromatic scale, their corresponding key signatures, and their associated relative minor and major keys. This chart is really helpful when composing melodies and harmonies because it helps you figure out notes that work together and sound the most musical. For DJs, it is just a handy chart that will guide you to choose what tracks will go well together better. (dubspot)

![The harmonic wheel visualization using the traditional chord notation. The closer two clips are the more compatible they should be harmonically. Moving clockwise around the harmonic wheel gives the impression of rising tension. The paths show how transposing the clip by one or two semitones changes its location.](https://cdn-images-1.medium.com/max/2000/1*cZcPlKdVNTwxF_HPW8YPZg.png)*The harmonic wheel visualization using the traditional chord notation. The closer two clips are the more compatible they should be harmonically. Moving clockwise around the harmonic wheel gives the impression of rising tension. The paths show how transposing the clip by one or two semitones changes its location.*

### Why Ableton Live?

Ableton Live is an ideal tool to help explore harmonic mixing since by “warping” of audio tracks it allows modifying their pitch independently of their tempo in real-time.

## Dynamic Tempo Following

Since the dawn of drum machines, sequencing, and MIDI synchronization, electronic music has predominantly worked with fixed tempos that don’t change throughout the duration of a track. The times are changing and these days, modern Digital Audio Workstations such as Ableton Live can map the tempo changes of existing tracks and allow *warping* them in order for them to play in time with the other elements.

This is usually used to transform samples that have varying tempo to a fixed tempo grid in a process called *tempo quantization*. As a result, it has become very easy to remix or edit recordings making them “club-friendly” by quantizing their tempo and adding a pronounced 4/4 kick drum. Whether this is good or bad is subjective but arguably by quantizing all songs to a regular beat most of the tempo dynamics of the original groove are lost. It is similar to when drummers are forced to play along to a fixed click track: they lose a lot of creative freedom.

### Ableton Live to the rescue again?

An often overlooked feature is that it is also possible to make the master tempo follow the tempo changes of one of the audio clips. This essentially makes the tempo of all elements follow the tempo changes of the clip. One could imagine it as all elements of the set being musicians that follow the tempo changes of the drummer. Unfortunately, this feature only works in the *Arrangement Mode *of Ableton Live which is not so interesting for live performances.

The** Voodoohop Live Tools** introduce the concept of tempo following to the *Session Mode *allowing the user to select a track which dictates the tempo changes in real-time during live performances or DJ sets.

![The Track Observer is placed on each track which is going to be monitored by the Voodoohop Live Tools. The application window should show the waveforms and harmonies of the track’s playing clips. By clicking follow Live is instructed to follow the tempo changes of the clips on that specific track.](https://cdn-images-1.medium.com/max/2000/1*WOX3Fc0BUdP6kDZk8nUhUQ.jpeg)*The Track Observer is placed on each track which is going to be monitored by the Voodoohop Live Tools. The application window should show the waveforms and harmonies of the track’s playing clips. By clicking follow Live is instructed to follow the tempo changes of the clips on that specific track.*

## Usage

<center><iframe width="560" height="315" src="https://www.youtube.com/embed/4TBwbnvVHJM" frameborder="0" allowfullscreen></iframe></center>

The waveforms, as well as harmonies of tracks playing, are shown in a convenient floating window which is possible to show and hide using a key-combination or midi controller. Behind the scenes, the warp markers of audio files are read and the properly warped waveforms are shown with aligned playing positions. This allows to time a transition in terms of break-down and drops. A limitation of Ableton Live for DJing has always been the fact that it only shows the Waveform of one track at a time.

If the audio has key information (e.g. tagged by [Mixed in Key](http://www.mixedinkey.com/) or the free [Keyfinder](http://www.ibrahimshaath.co.uk/keyfinder/) ) it will read the key tags, color the waveforms accordingly and display their position on the *circle of fifths. *Mixed in Key seems to have the most accurate key detection algorithm. If Keyfinder is used it is important to configure it to tag the audio files correctly *(see the video which will be posted soon)*.

Transposing the clips in Live will change the color of the waveform and its position on the harmonic wheel allowing you to quickly match the audio harmonically. If two samples are dissonant (on opposite sides of the *circle of fifths*) it is usually possible to pitch them up or down by one or two semitones in order to make their keys match and sound much more harmonic.

![Application Interface: the waveform display contains an inner waveform which visualizes the low-end portion of the audio. Apart from the tracks that are currently playing it will also show the waveform and harmony of the clip currently selected in live’s detail view. If a loop is set this is also overlayed onto the waveforms.](https://cdn-images-1.medium.com/max/2000/1*MAWgzQojpqyOvT1qhmi3yw.jpeg)*Application Interface: the waveform display contains an inner waveform which visualizes the low-end portion of the audio. Apart from the tracks that are currently playing it will also show the waveform and harmony of the clip currently selected in live’s detail view. If a loop is set this is also overlayed onto the waveforms.*

![Choose between different key notations (camelot, open key and traditional), choose to update the color and name of the selected clip inside the live set, midi-mappable zoom of the waveforms](https://cdn-images-1.medium.com/max/2000/1*COssmk3i55ZY-AAS0I5XvQ.jpeg)*Choose between different key notations (camelot, open key and traditional), choose to update the color and name of the selected clip inside the live set, midi-mappable zoom of the waveforms*



*(developed in partnership with [Elliot Fouchy](undefined))*
