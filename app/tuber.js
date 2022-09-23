import { getState } from "./state";

async function tuberLoop() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
  const audioContext = new AudioContext();
  const mediaStreamAudioSourceNode =
    audioContext.createMediaStreamSource(stream);
  const analyserNode = audioContext.createAnalyser();
  mediaStreamAudioSourceNode.connect(analyserNode);

  const pcmData = new Float32Array(analyserNode.fftSize);
  const onFrame = () => {
    // Todo "analyze frequency-domain data, and restrict to human voice frequencies"
    analyserNode.getFloatTimeDomainData(pcmData);
    let sumSquares = 0.0;
    for (const amplitude of pcmData) {
      sumSquares += amplitude * amplitude;
    }
    const volume = Math.sqrt(sumSquares / pcmData.length);
    let { delay } = tuberState;
    const { volumeThreshold, delayThreshold } = getState();
    if (volume > volumeThreshold) {
      delay = 1;
    } else if (delay > 0) {
      delay -= 0.02;
    }
    tuberState = {
      state: delayThreshold < delay ? "open" : "closed",
      volume,
      delay,
    };
    renderTuber();
    window.requestAnimationFrame(onFrame);
  };
  window.requestAnimationFrame(onFrame);
}

let tuberState = {
  volume: 0,
  delay: 0,
};

const $volumeMeter = document.getElementById("volumeMeter");
const $delayMeter = document.getElementById("delayMeter");
const $tuber = document.getElementById("tuber");

const renderTuber = () => {
  $tuber.dataset.state = tuberState.state;
  $volumeMeter.value = tuberState.volume;
  $delayMeter.value = tuberState.delay;
};

export { tuberLoop };
