// @ts-check
const rawEvents = require("./event-log.json");

const active = new Map();
const output = [];

let start = Number.POSITIVE_INFINITY;
let stop = 0;

rawEvents.forEach((rawEvent) => {
  if (rawEvent.action === "start") {
    if (active.has(rawEvent.key)) return;

    const event = {
      playbackRate: rawEvent.playbackRate,
      pan: rawEvent.pan,
      filename: rawEvent.filename,
      startTime: rawEvent.time,
      stopTime: undefined,
    };

    active.set(rawEvent.key, event);
    output.push(event);

    start = Math.min(start, event.startTime);
  } else if (rawEvent.action === "stop") {
    const activeEvent = active.get(rawEvent.key);

    if (!activeEvent) return;

    activeEvent.stopTime = rawEvent.time;

    active.delete(rawEvent.key);

    stop = Math.max(stop, rawEvent.time);
  }
});

require("fs/promises").writeFile(
  "./output.json",
  JSON.stringify(output, null, 2),
);

console.log(start, stop);
