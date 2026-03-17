/**
 * 爻影音效引擎 — Web Audio API 纯合成
 * 
 * 设计理念：
 *  - 铜钱摇晃：金属噪声 + 高频撞击泛音
 *  - 铜钱落定：衰减正弦 + 颤音余韵（模拟青铜钟碗）
 *  - 爻成：五声音阶单音（宫商角徵羽）
 *  - 完卦：宫调和弦叠加，低频共鸣
 *  - AI 启动：水晶碗泛音上行
 *  - 页面切换：轻微气流感
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

// 全局静音开关
let muted = false;
export function setMuted(v: boolean) { muted = v; }
export function getMuted() { return muted; }

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.72;
    masterGain.connect(audioCtx.destination);
  }
  // 如果 context 被挂起（浏览器策略），尝试恢复
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function getDest(): AudioNode {
  getCtx();
  return masterGain!;
}

// ── 工具：创建简单的冲激响应（模拟房间混响）──
function createReverb(ctx: AudioContext, duration = 0.4, decay = 2.5): ConvolverNode {
  const convolver = ctx.createConvolver();
  const rate = ctx.sampleRate;
  const length = Math.round(rate * duration);
  const impulse = ctx.createBuffer(2, length, rate);

  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }

  convolver.buffer = impulse;
  return convolver;
}

// ── 工具：五声音阶频率表（C 宫调）──
const PENTATONIC = {
  宫: 261.63,  // C4
  商: 293.66,  // D4
  角: 329.63,  // E4
  徵: 392.00,  // G4
  羽: 440.00,  // A4
  宫高: 523.25, // C5
  商高: 587.33, // D5
  角高: 659.25, // E5
};

// ══════════════════════════════════════════
// 铜钱摇晃音效 — 每次摇晃触发
// 金属碰撞噪声 + 随机性
// ══════════════════════════════════════════
export function playCoinShake(intensity = 1.0) {
  if (muted) return;
  try {
    const ctx = getCtx();
    const dest = getDest();
    const now = ctx.currentTime;

    const hitCount = 2 + Math.floor(Math.random() * 3); // 2-4次撞击

    for (let i = 0; i < hitCount; i++) {
      const delay = i * (0.06 + Math.random() * 0.04);

      // 白噪声 burst（金属摩擦感）
      const bufLen = Math.round(ctx.sampleRate * 0.06);
      const noiseBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let j = 0; j < bufLen; j++) {
        nd[j] = (Math.random() * 2 - 1) * 0.5;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuf;

      // 高通滤波：只留金属高频成分
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1200 + Math.random() * 600;
      hp.Q.value = 0.8;

      // 包络
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0, now + delay);
      noiseGain.gain.linearRampToValueAtTime(0.12 * intensity, now + delay + 0.004);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.07);

      noiseSource.connect(hp);
      hp.connect(noiseGain);
      noiseGain.connect(dest);
      noiseSource.start(now + delay);
      noiseSource.stop(now + delay + 0.08);

      // 金属撞击泛音
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(700 + Math.random() * 500, now + delay);
      osc.frequency.exponentialRampToValueAtTime(180 + Math.random() * 100, now + delay + 0.08);

      oscGain.gain.setValueAtTime(0.08 * intensity, now + delay);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

      osc.connect(oscGain);
      oscGain.connect(dest);
      osc.start(now + delay);
      osc.stop(now + delay + 0.12);
    }
  } catch (e) {
    console.warn("[audio] playCoinShake:", e);
  }
}

// ══════════════════════════════════════════
// 铜钱落定音效 — 出爻时三枚依次落地
// 青铜钟碗余韵：正弦衰减 + 颤音 + 小混响
// ══════════════════════════════════════════
export function playCoinLand(coinIndex = 0) {
  if (muted) return;
  try {
    const ctx = getCtx();
    const dest = getDest();
    const now = ctx.currentTime;

    // 三枚铜钱音高略有差异，营造真实感
    const baseFreqs = [520, 490, 555];
    const freq = baseFreqs[coinIndex % 3];

    // 主音：正弦衰减
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.92, now + 0.8);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.setValueAtTime(0.22, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    // 二次谐波（泛音）
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2.76, now); // 非整数倍泛音，更像金属
    gain2.gain.setValueAtTime(0.06, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    // 短混响
    const reverb = createReverb(ctx, 0.3, 3);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.25;

    osc.connect(gain);
    gain.connect(dest);
    gain.connect(reverb);
    reverb.connect(reverbGain);
    reverbGain.connect(dest);

    osc2.connect(gain2);
    gain2.connect(dest);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 1);
    osc2.stop(now + 0.35);

    // 冲击音（落地瞬间的啪声）
    const impulseBuf = ctx.createBuffer(1, Math.round(ctx.sampleRate * 0.015), ctx.sampleRate);
    const id = impulseBuf.getChannelData(0);
    for (let j = 0; j < id.length; j++) {
      id[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / id.length, 1.5);
    }
    const impulseSource = ctx.createBufferSource();
    impulseSource.buffer = impulseBuf;
    const impGain = ctx.createGain();
    impGain.gain.value = 0.15;
    impulseSource.connect(impGain);
    impGain.connect(dest);
    impulseSource.start(now);
    impulseSource.stop(now + 0.02);
  } catch (e) {
    console.warn("[audio] playCoinLand:", e);
  }
}

// ══════════════════════════════════════════
// 一爻成卦音效 — 五声音阶单音，空灵
// ══════════════════════════════════════════
export function playYaoComplete(yaoIndex = 0) {
  if (muted) return;
  try {
    const ctx = getCtx();
    const dest = getDest();
    const now = ctx.currentTime;

    // 六爻各对应五声音阶的不同音
    const scale = [
      PENTATONIC.宫,
      PENTATONIC.商,
      PENTATONIC.角,
      PENTATONIC.徵,
      PENTATONIC.羽,
      PENTATONIC.宫高,
    ];
    const freq = scale[yaoIndex % scale.length];

    // 主音
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    // 轻微颤音
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibrato.frequency.value = 5.5;
    vibratoGain.gain.value = 3;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    // 八度高音（更空灵）
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.value = freq * 2;
    gain2.gain.setValueAtTime(0.05, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    // 带混响
    const reverb = createReverb(ctx, 0.6, 3);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.4;

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(dest);
    gain2.connect(dest);
    gain.connect(reverb);
    reverb.connect(reverbGain);
    reverbGain.connect(dest);

    osc.start(now);
    osc2.start(now + 0.05);
    vibrato.start(now);
    osc.stop(now + 2);
    osc2.stop(now + 1.5);
    vibrato.stop(now + 2);
  } catch (e) {
    console.warn("[audio] playYaoComplete:", e);
  }
}

// ══════════════════════════════════════════
// 完卦庄严音效 — 宫调四音叠加 + 低频共鸣
// ══════════════════════════════════════════
export function playGuaComplete() {
  if (muted) return;
  try {
    const ctx = getCtx();
    const dest = getDest();
    const now = ctx.currentTime;

    // 宫调四音（C 大调：C3 E3 G3 C4）
    const chord = [130.81, 164.81, 196.00, 261.63];

    chord.forEach((freq, i) => {
      const delay = i * 0.18;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.12, now + delay + 0.08);
      gain.gain.setValueAtTime(0.12, now + delay + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 2.5);

      // 泛音
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.value = freq * 2;
      gain2.gain.setValueAtTime(0, now + delay);
      gain2.gain.linearRampToValueAtTime(0.03, now + delay + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + 1.5);

      const reverb = createReverb(ctx, 1.2, 2);
      const reverbGain = ctx.createGain();
      reverbGain.gain.value = 0.5;

      osc.connect(gain);
      gain.connect(dest);
      gain.connect(reverb);
      reverb.connect(reverbGain);
      reverbGain.connect(dest);

      osc2.connect(gain2);
      gain2.connect(dest);

      osc.start(now + delay);
      osc2.start(now + delay + 0.1);
      osc.stop(now + delay + 3);
      osc2.stop(now + delay + 2);
    });

    // 底鼓（庄重感）
    const drumOsc = ctx.createOscillator();
    const drumGain = ctx.createGain();
    drumOsc.type = "sine";
    drumOsc.frequency.setValueAtTime(80, now);
    drumOsc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
    drumGain.gain.setValueAtTime(0.25, now);
    drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    drumOsc.connect(drumGain);
    drumGain.connect(dest);
    drumOsc.start(now);
    drumOsc.stop(now + 0.6);
  } catch (e) {
    console.warn("[audio] playGuaComplete:", e);
  }
}

// ══════════════════════════════════════════
// AI 解卦启动音 — 水晶碗上行五声音阶
// ══════════════════════════════════════════
export function playAIStart() {
  if (muted) return;
  try {
    const ctx = getCtx();
    const dest = getDest();
    const now = ctx.currentTime;

    const ascend = [
      PENTATONIC.宫,
      PENTATONIC.商,
      PENTATONIC.角,
      PENTATONIC.徵,
      PENTATONIC.羽,
      PENTATONIC.宫高,
    ];

    ascend.forEach((freq, i) => {
      const delay = i * 0.07;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.09, now + delay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.5);

      // 高八度回声
      const echo = ctx.createOscillator();
      const echoGain = ctx.createGain();
      echo.type = "sine";
      echo.frequency.value = freq * 2;
      echoGain.gain.setValueAtTime(0, now + delay + 0.04);
      echoGain.gain.linearRampToValueAtTime(0.03, now + delay + 0.07);
      echoGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4);

      const reverb = createReverb(ctx, 0.4, 2.5);
      const rGain = ctx.createGain();
      rGain.gain.value = 0.35;

      osc.connect(gain);
      echo.connect(echoGain);
      gain.connect(dest);
      echoGain.connect(dest);
      gain.connect(reverb);
      reverb.connect(rGain);
      rGain.connect(dest);

      osc.start(now + delay);
      echo.start(now + delay + 0.04);
      osc.stop(now + delay + 0.6);
      echo.stop(now + delay + 0.5);
    });
  } catch (e) {
    console.warn("[audio] playAIStart:", e);
  }
}

// ══════════════════════════════════════════
// 页面切换音效 — 轻盈气流
// ══════════════════════════════════════════
export function playPageTransition() {
  if (muted) return;
  try {
    const ctx = getCtx();
    const dest = getDest();
    const now = ctx.currentTime;

    const bufLen = Math.round(ctx.sampleRate * 0.25);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / bufLen);
    }

    const source = ctx.createBufferSource();
    source.buffer = buf;

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 800;
    lp.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    source.connect(lp);
    lp.connect(gain);
    gain.connect(dest);
    source.start(now);
    source.stop(now + 0.3);
  } catch (e) {
    console.warn("[audio] playPageTransition:", e);
  }
}

// ══════════════════════════════════════════
// 按钮点击反馈音 — 轻触
// ══════════════════════════════════════════
export function playClick() {
  if (muted) return;
  try {
    const ctx = getCtx();
    const dest = getDest();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch (e) {}
}

// ══════════════════════════════════════════
// 触觉反馈
// ══════════════════════════════════════════
export function vibrate(pattern?: number | number[]) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern ?? [40, 20, 40]);
  }
}

// 强振
export function vibrateStrong() {
  vibrate([60, 30, 80, 30, 60]);
}
