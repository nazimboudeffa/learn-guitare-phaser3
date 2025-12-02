// src/audio.js
import { PitchDetector } from "pitchy";

let audioContext = null;
let analyser = null;
let rafId = null;
let detector = null;
let sourceNode = null;
let streamRef = null;

export async function startAudio(onPitch, { fftSize = 8192 } = {}) {
  console.log("startAudio called")
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("getUserMedia non supporté par ce navigateur.");
  }
  // Create/resume audio context
  audioContext = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
  console.log("Sample rate:", audioContext.sampleRate);
  if (audioContext.state === "suspended") {
    try { 
      await audioContext.resume(); 
    } catch (e) { 
      console.error("Error resuming audioContext:", e); 
    }
  }

  // Request mic
  streamRef = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  sourceNode = audioContext.createMediaStreamSource(streamRef);

  analyser = audioContext.createAnalyser();
  analyser.fftSize = fftSize;
  sourceNode.connect(analyser);

  // Create PitchDetector for Float32Array (Pitchy v4)
  detector = PitchDetector.forFloat32Array(audioContext.sampleRate);

  const buffer = new Float32Array(analyser.fftSize);
  const requiredLength = audioContext.sampleRate;
  let bigBuffer = new Float32Array(requiredLength);
  let bigBufferOffset = 0;

  function loop() {
    if (audioContext.state === "suspended") {
      audioContext.resume();
      console.log("AudioContext resumed");
    }
    console.log("loop running", bigBufferOffset);
    analyser.getFloatTimeDomainData(buffer);

    // Accumulate samples into bigBuffer
    let remaining = requiredLength - bigBufferOffset;
    if (remaining > 0) {
      let toCopy = Math.min(buffer.length, remaining);
      bigBuffer.set(buffer.slice(0, toCopy), bigBufferOffset);
      bigBufferOffset += toCopy;
      console.log("Accumulating:", bigBufferOffset, "/", requiredLength);
    }

    // When bigBuffer is full or over, call pitch detection
    if (bigBufferOffset >= requiredLength) {
      console.log("bigBufferOffset before detection:", bigBufferOffset);
      // slice to exact size if overflow
      const slice = bigBuffer.slice(0, requiredLength);
      const [pitch, clarity] = detector.findPitch(slice, audioContext.sampleRate) || [0, 0];
      console.log("findPitch result:", pitch, clarity);
      if (typeof onPitch === "function") {
        onPitch({ pitch: pitch || 0, clarity: clarity || 0 });
      }
      bigBufferOffset = 0; // reset for next batch
    }

    rafId = requestAnimationFrame(loop);
  }

  loop();

  return {
    stop: stopAudio
  };
}

export function stopAudio() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (analyser) {
    analyser.disconnect?.();
    analyser = null;
  }
  if (sourceNode) {
    sourceNode.disconnect?.();
    sourceNode = null;
  }
  if (streamRef) {
    const tracks = streamRef.getTracks?.();
    if (tracks) {
      for (const t of tracks) {
        t.stop();
      }
    }
    streamRef = null;
  }
  if (audioContext) {
    try { 
      audioContext.close(); 
    } catch (err) {
      console.error("Error closing audioContext:", err);
    }
    audioContext = null;
  }
  detector = null;
}