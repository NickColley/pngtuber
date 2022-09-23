import { tuberLoop } from "./tuber";
import { getInitialState, getState, setState, resetState } from "./state";

const INITIAL_STATE = {
  volumeThreshold: 0.1,
  delayThreshold: 0.8,
  showControls: false,
};

const $resetButton = document.getElementById("reset");
const $volumeThresholdRange = document.getElementById("volumeThreshold");
const $delayThresholdRange = document.getElementById("delayThreshold");
const $controls = document.getElementById("controls");

const renderUI = () => {
  const state = getState();
  if (state.showControls) {
    $controls.removeAttribute("hidden");
  } else {
    $controls.setAttribute("hidden", true);
  }
  $volumeThresholdRange.value = state.volumeThreshold;
  $delayThresholdRange.value = state.delayThreshold;
};

getInitialState(INITIAL_STATE);
renderUI();
tuberLoop();

$resetButton.addEventListener("click", () => {
  resetState(INITIAL_STATE);
  renderUI();
});
$volumeThresholdRange.addEventListener("change", () => {
  setState({ volumeThreshold: $volumeThresholdRange.value });
  renderUI();
});
$delayThresholdRange.addEventListener("change", () => {
  setState({ delayThreshold: $delayThresholdRange.value });
  renderUI();
});

window.addEventListener("focus", () => {
  setState({ showControls: true });
  renderUI();
});
window.addEventListener("blur", () => {
  setState({ showControls: false });
  renderUI();
});
window.addEventListener("mouseover", () => {
  setState({ showControls: true });
  renderUI();
});
