const AudioGen = {
  ctx: null,
  enabled: true,
  _ensureCtx() {
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    } catch (e) {
      this.enabled = false;
      return null;
    }
  },
  _beep(freq, duration, type = 'sine', vol = 0.15) {
    if (!this.enabled) return;
    try {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) { /* ignore */ }
  },
  tap() { this._beep(600, 0.05, 'square', 0.08); },
  land() { this._beep(300, 0.1, 'sine', 0.2); },
  perfect() {
    this._beep(880, 0.08, 'triangle', 0.18);
    setTimeout(() => this._beep(1175, 0.1, 'triangle', 0.18), 60);
    setTimeout(() => this._beep(1568, 0.15, 'triangle', 0.18), 130);
  },
  fail() {
    this._beep(220, 0.2, 'sawtooth', 0.25);
    setTimeout(() => this._beep(110, 0.3, 'sawtooth', 0.25), 80);
  },
  milestone() {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => this._beep(f, 0.15, 'triangle', 0.2), i * 100);
    });
  },
};
