const StreamingClass = class {
  constructor() {
    this.streamDatas = {}; // id: data
    this.streamCutoffs = {}; // id: int
  }
  // get method
  get = (id) => {
    let streamData = this.streamDatas[id];
    let cutoff = this.streamCutoffs[id];
    return { streamData, cutoff };
  };
  // set method
  set = (id, data, cutoff, timeout = 300000) => {
    this.streamDatas[id] = data;
    this.streamCutoffs[id] = cutoff;
    // set timer to clear the memory
    setTimeout(() => {
      this.unset(id);
    }, timeout);
  };
  // update method
  update = (id, data) => {
    this.streamDatas[id] = data;
  };
  // unset method
  unset = (id) => {
    delete this.streamDatas[id];
  };
};
let streamingClass = new StreamingClass();

export default streamingClass;
