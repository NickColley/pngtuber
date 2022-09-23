function throttle(fn, threshhold = 250, scope) {
  var last, deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date(),
      args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}
const VOLUME_THRESHOLD = 0.05;
const DELAY_THRESHOLD = 0.8;
const setState = throttle((state) => {
  window.localStorage.setItem("volumeThreshold", state.volumeThreshold);
  window.localStorage.setItem("delayThreshold", state.delayThreshold);
}, 1000);
const resetState = () => {
  window.localStorage.removeItem("volumeThreshold");
  window.localStorage.removeItem("delayThreshold");
  volumeThreshold.value = VOLUME_THRESHOLD;
  delayThreshold.value = DELAY_THRESHOLD;
};
const getInitialState = () => {
  volumeThreshold.value =
    window.localStorage.getItem("volumeThreshold") || VOLUME_THRESHOLD;
  delayThreshold.value =
    window.localStorage.getItem("delayThreshold") || DELAY_THRESHOLD;
};
const showControls = () => {
  controls.removeAttribute("hidden");
};
const hideControls = () => {
  controls.setAttribute("hidden", true);
};
reset.onclick = resetState;
window.onfocus = showControls;
window.onblur = hideControls;
window.onmouseover = showControls;
async function main() {
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
    const value = Math.sqrt(sumSquares / pcmData.length);
    if (value > volumeThreshold.value) {
      delayMeter.value = 1;
    } else if (delayMeter.value > 0) {
      delayMeter.value -= 0.02;
    }
    const state = delayThreshold.value < delayMeter.value ? "open" : "closed";
    volumeMeter.value = value;
    tuber.dataset.state = state;
    setState({
      volumeThreshold: volumeThreshold.value,
      delayThreshold: delayThreshold.value,
    });
    window.requestAnimationFrame(onFrame);
  };
  window.requestAnimationFrame(onFrame);
}
main();
getInitialState();
hideControls();
