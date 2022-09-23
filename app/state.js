import { throttle } from "./utils";

let state = {};

const getInitialState = (INITIAL_STATE) => {
  const storedState = JSON.parse(window.localStorage.getItem("state"));
  if (storedState) {
    setState(storedState);
  } else {
    console.log("No saved state.");
    setState(INITIAL_STATE);
  }
};
const getState = () => state;
const setState = (newState) => {
  state = Object.assign({}, state, newState);
  saveState();
};
const resetState = (INITIAL_STATE) => {
  window.localStorage.removeItem("state");
  setState(INITIAL_STATE);
};
const saveState = throttle(() => {
  window.localStorage.setItem("state", JSON.stringify(state));
}, 1000);

export { getInitialState, getState, setState, resetState };
