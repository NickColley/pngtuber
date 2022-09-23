import { throttle } from "./utils";
const INITIAL_STATE = {
  volumeThreshold: 0.1,
  delayThreshold: 0.8,
  showControls: false,
};
let state = {};
let tuberState = {
  volume: 0,
  delay: 0,
};

const $resetButton = document.getElementById("reset");
const $volumeThresholdRange = document.getElementById("volumeThreshold");
const $delayThresholdRange = document.getElementById("delayThreshold");
const $volumeMeter = document.getElementById("volumeMeter");
const $delayMeter = document.getElementById("delayMeter");
const $tuber = document.getElementById("tuber");

const getInitialState = () => {
  try {
    const storedState = JSON.parse(window.localStorage.getItem("state"));
    setState(storedState);
  } catch (error) {
    console.log("No saved state.");
    setState(INITIAL_STATE);
  }
};
const setState = (newState) => {
  state = Object.assign({}, state, newState);
  renderUI();
  saveState();
};
const resetState = () => {
  window.localStorage.removeItem("state");
  setState(INITIAL_STATE);
};
const saveState = throttle(() => {
  window.localStorage.setItem("state", JSON.stringify(state));
}, 1000);

const renderUI = () => {
  if (state.showControls) {
    controls.removeAttribute("hidden");
  } else {
    controls.setAttribute("hidden", true);
  }
  $volumeThresholdRange.value = state.volumeThreshold;
  $delayThresholdRange.value = state.delayThreshold;
};

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
    const { volumeThreshold, delayThreshold } = state;
    if (volume > volumeThreshold) {
      delay = 1;
    } else if (delay > 0) {
      delay -= 0.02;
    }
    setTuberState({
      state: delayThreshold < delay ? "open" : "closed",
      volume,
      delay,
    });
    window.requestAnimationFrame(onFrame);
  };
  window.requestAnimationFrame(onFrame);
}
const setTuberState = (newState) => {
  tuberState = Object.assign({}, tuberState, newState);
  renderTuber();
};
const renderTuber = () => {
  $tuber.dataset.state = tuberState.state;
  $volumeMeter.value = tuberState.volume;
  $delayMeter.value = tuberState.delay;
};

getInitialState();
renderUI();
tuberLoop();

$resetButton.addEventListener("click", resetState);
$volumeThresholdRange.addEventListener("change", () =>
  setState({ volumeThreshold: $volumeThresholdRange.value })
);
$delayThresholdRange.addEventListener("change", () =>
  setState({ delayThreshold: $delayThresholdRange.value })
);

window.addEventListener("focus", () => setState({ showControls: true }));
window.addEventListener("blur", () => setState({ showControls: false }));
window.addEventListener("mouseover", () => setState({ showControls: true }));
