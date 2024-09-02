[source events](./event-log.json) - produced by logging note start/stop events from https://kurtsmurf.github.io/smpl/

[transformed events](./output.json) - consolidate start/end events from source into unified events with starting and ending times. [Script](./convert.js)

[use the events](./play.js) to reproduce the original performance in an OfflineWebAudioContext saving the result to an audio buffer.

logs:

```log
test()
Promise {<pending>}
play.js:7 num events: -  663
play.js:15 duration (seconds) -  390.4319274376417
play.js:32 distinct_file_names 
 Set(40) {'badknock.wav', 'badfragment.wav', 'badloop.wav', 'badlooptwo.wav', 'pump2.wav', …}
play.js:36 loading files into sound bank -  7192.89999961853
play.js:46 finished loading files into sound bank -  7670.799999713898
play.js:48 scheduling playback -  7670.799999713898
play.js:66 start rendering -  7688.199999809265
play.js:70 done rendering -  52213.7999997139
play.js:123 playing -  52214
```

~45 seconds to render 390 seconds of audio sourced from 663 events

CPU: Intel i5, 2.70GHz × 4

audio sources manually copied into [./sounds](./sounds) (ignored by git - not included)