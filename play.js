// @ts-check

async function render() {
  const events = await fetch("./output.json")
    .then((response) => response.json());

  console.log("num events: - ", events.length);

  // is this right?
  const startTime = events[0].startTime;
  const stopTime = events[events.length - 1].stopTime;

  const duration = stopTime - startTime;

  console.log("duration (seconds) - ", duration);

  // was this the sample rate when recording?
  const sampleRate = 44100;

  const offlineContext = new OfflineAudioContext(
    2,
    duration * sampleRate,
    sampleRate,
  );

  let distinct_file_names = new Set();

  for (const event of events) {
    distinct_file_names.add(event.filename);
  }

  console.log("distinct_file_names", "\n", distinct_file_names);

  const soundBank = new Map();

  console.log("loading files into sound bank - ", performance.now());

  for (const filename of distinct_file_names) {
    const buffer = await fetch("./sounds/" + filename)
      .then((response) => response.arrayBuffer())
      .then((ab) => offlineContext.decodeAudioData(ab));

    soundBank.set(filename, buffer);
  }

  console.log("finished loading files into sound bank - ", performance.now());

  console.log("scheduling playback - ", performance.now());

  const out = offlineContext.createDynamicsCompressor();
  out.connect(offlineContext.destination);

  for (const event of events) {
    const duration = event.stopTime - event.startTime;
    schedulePlayback(
      offlineContext,
      soundBank.get(event.filename),
      event.playbackRate,
      event.startTime,
      duration,
      out,
      event.pan,
    );
  }

  console.log("start rendering - ", performance.now());

  const result = await offlineContext.startRendering();

  console.log("done rendering - ", performance.now());

  return result;
}

/**
 * @param {OfflineAudioContext} audioContext
 * @param {AudioBuffer} buffer
 * @param {number} speed
 * @param {number} when
 * @param {number} duration
 * @param {AudioNode} out
 * @param {number} pan
 */
function schedulePlayback(
  audioContext,
  buffer,
  speed,
  when,
  duration,
  out,
  pan,
) {
  const sourceNode = audioContext.createBufferSource();
  sourceNode.playbackRate.value = speed;
  sourceNode.loop = true;
  sourceNode.buffer = buffer;

  const panner = audioContext.createStereoPanner();
  panner.pan.value = pan;

  const gain = audioContext.createGain();

  sourceNode.connect(panner).connect(gain).connect(out);
  try {
    if (Number.isNaN(duration)) return; // why?
    sourceNode.start(when, 0, duration);
    scheduleEnvelope(
      gain,
      { start: when, end: when + duration, ramp: 0.1 },
    );
  } catch (e) {
    console.error(e);
  }
}

/*
 *const scheduleEnvelope = (
  gainNode: GainNode,
  envelope: {
    start: number;
    end: number;
    ramp: number;
  },
) => {
  gainNode.gain.setValueAtTime(0, envelope.start);
  gainNode.gain.linearRampToValueAtTime(1, envelope.start + envelope.ramp);
  gainNode.gain.setValueAtTime(1, envelope.end - envelope.ramp);
  gainNode.gain.linearRampToValueAtTime(0, envelope.end);
};

 */
function scheduleEnvelope(
  gainNode,
  envelope,
) {
  gainNode.gain.setValueAtTime(0, envelope.start);
  gainNode.gain.linearRampToValueAtTime(1, envelope.start + envelope.ramp);
  gainNode.gain.setValueAtTime(1, envelope.end - envelope.ramp);
  gainNode.gain.linearRampToValueAtTime(0, envelope.end);
}

function play(buffer) {
  const ac = new AudioContext();
  const source = ac.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(ac.destination);
  ac.resume();
  source.start();
}

// @ts-ignore
window.test = () =>
  render().then((result) => {
    console.log("playing - ", performance.now());
    play(result);
  });
