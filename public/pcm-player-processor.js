class PCMPlayerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.port.onmessage = (event) => {
      if (event.data && event.data.samples) {
        console.log("Received audio message");
        const incomingSamples = event.data.samples;
        for (let i = 0; i < incomingSamples.length; i++) {
          this.buffer.push(incomingSamples[i]);
        }
      }
    };
  }

  process(inputs, outputs) {
    const output = outputs[0];
    const channel = output[0];
    for (let i = 0; i < channel.length; i++) {
      channel[i] = this.buffer.length ? this.buffer.shift() : 0;
    }
    if (this.buffer.length < 256) {
      // 2*128, a threshold to request more data
      this.port.postMessage({ bufferSpaceAvailable: true });
    }
    return true;
  }
}

registerProcessor("pcm-player-processor", PCMPlayerProcessor);
