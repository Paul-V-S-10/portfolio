"use client";

import * as THREE from "three";

/*
  Procedural textures drawn on <canvas> at runtime — no image downloads.
  Each is created once and cached.
*/

const cache = new Map<string, THREE.Texture>();
function cached<T extends THREE.Texture>(key: string, make: () => T): T {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key) as T;
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

/** 2×2 twill carbon-fibre weave. */
export function carbonTexture(repeat = 4) {
  return cached(`carbon-${repeat}`, () => {
    const [c, g] = canvas(256, 256);
    const n = 8; // tows per side
    const s = 256 / n;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        // twill: orientation shifts by one every row, in pairs
        const horizontal = Math.floor((x + y) / 2) % 2 === 0;
        const grad = horizontal
          ? g.createLinearGradient(x * s, y * s, x * s, (y + 1) * s)
          : g.createLinearGradient(x * s, y * s, (x + 1) * s, y * s);
        grad.addColorStop(0, "#0b0b0c");
        grad.addColorStop(0.5, horizontal ? "#2c2d31" : "#232428");
        grad.addColorStop(1, "#0b0b0c");
        g.fillStyle = grad;
        g.fillRect(x * s, y * s, s, s);
        // fibre streaks
        g.strokeStyle = "rgba(255,255,255,0.035)";
        g.lineWidth = 1;
        for (let k = 3; k < s; k += 4) {
          g.beginPath();
          if (horizontal) {
            g.moveTo(x * s, y * s + k);
            g.lineTo((x + 1) * s, y * s + k);
          } else {
            g.moveTo(x * s + k, y * s);
            g.lineTo(x * s + k, (y + 1) * s);
          }
          g.stroke();
        }
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  });
}

/** Motion-blurred propeller disc as seen on camera at ~8,000 RPM. */
export function propBlurTexture() {
  return cached("propblur", () => {
    const [c, g] = canvas(512, 512);
    const cx = 256;
    // radial density: blades are wider near the root, so the disc is denser inside
    const rg = g.createRadialGradient(cx, cx, 18, cx, cx, 254);
    rg.addColorStop(0, "rgba(20,20,22,0)");
    rg.addColorStop(0.08, "rgba(20,20,22,0.55)");
    rg.addColorStop(0.35, "rgba(25,25,28,0.42)");
    rg.addColorStop(0.8, "rgba(30,30,34,0.22)");
    rg.addColorStop(0.95, "rgba(60,60,66,0.30)"); // tip ring
    rg.addColorStop(1, "rgba(60,60,66,0)");
    g.fillStyle = rg;
    g.fillRect(0, 0, 512, 512);
    // faint "ghost" blades smeared over an arc (rolling-shutter look)
    for (const base of [0, Math.PI]) {
      for (let i = 0; i < 40; i++) {
        const a = base + i * 0.02;
        g.strokeStyle = `rgba(10,10,12,${0.05 * (1 - i / 40)})`;
        g.lineWidth = 14 - i * 0.25;
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * 30, cx + Math.sin(a) * 30);
        g.lineTo(cx + Math.cos(a + 0.12) * 250, cx + Math.sin(a + 0.12) * 250);
        g.stroke();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

/** Soft round glow sprite for LEDs. */
export function glowTexture() {
  return cached("glow", () => {
    const [c, g] = canvas(128, 128);
    const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    rg.addColorStop(0, "rgba(255,255,255,1)");
    rg.addColorStop(0.15, "rgba(255,255,255,0.8)");
    rg.addColorStop(0.4, "rgba(255,255,255,0.15)");
    rg.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = rg;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  });
}

/**
  Normal map of brazed regenerative-cooling tubes running down the nozzle.
  Tubes cover v ≥ `tubeFrom` (chamber + upper bell); below that the radiatively-cooled
  extension is smooth sheet. (Canvas top row maps to v = 1.)
*/
export function coolingTubeNormal(tubes = 90, tubeFrom = 0.43) {
  return cached(`tubes-${tubes}-${tubeFrom}`, () => {
    const W = 64;
    const H = 256;
    const [c, g] = canvas(W, H);
    const img = g.createImageData(W, H);
    for (let y = 0; y < H; y++) {
      const v = 1 - y / H;
      const tubed = v >= tubeFrom;
      for (let x = 0; x < W; x++) {
        const p = (x / W) * 2 - 1; // -1..1 across one tube
        const nx = tubed ? p * 0.85 : 0;
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx));
        const i = (y * W + x) * 4;
        img.data[i] = (nx * 0.5 + 0.5) * 255;
        img.data[i + 1] = 128;
        img.data[i + 2] = (nz * 0.5 + 0.5) * 255;
        img.data[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.repeat.set(tubes, 1);
    t.anisotropy = 8;
    return t;
  });
}

/**
  Heat-tint colour along the nozzle (v = 0 at chamber, 1 at exit):
  copper chamber → blued/purple heat tint around the throat → straw/bronze → dark
  radiatively-cooled extension.
*/
export function nozzleTintTexture() {
  return cached("nozzle-tint", () => {
    const [c, g] = canvas(4, 256);
    const lg = g.createLinearGradient(0, 0, 0, 256);
    lg.addColorStop(0.0, "#8a5a3c");
    lg.addColorStop(0.22, "#9c6440");
    lg.addColorStop(0.3, "#4a3f63"); // throat blueing
    lg.addColorStop(0.38, "#6a4a5e");
    lg.addColorStop(0.46, "#b08b52"); // straw
    lg.addColorStop(0.56, "#7a6450");
    lg.addColorStop(0.62, "#3a3634"); // extension joint
    lg.addColorStop(1.0, "#26221f");
    g.fillStyle = lg;
    g.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

/** Emissive map for the nozzle interior: white-hot at the throat, cooling toward the exit. */
export function nozzleInnerGlow() {
  return cached("nozzle-glow", () => {
    const [c, g] = canvas(4, 256);
    const lg = g.createLinearGradient(0, 0, 0, 256);
    lg.addColorStop(0.0, "#ffd9a0");
    lg.addColorStop(0.3, "#fff2d6");
    lg.addColorStop(0.5, "#ff9a3c");
    lg.addColorStop(0.8, "#c2361a");
    lg.addColorStop(1.0, "#5a0e06");
    g.fillStyle = lg;
    g.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

/** LiPo battery wrap with a printed label. */
export function batteryLabel() {
  return cached("battery", () => {
    const [c, g] = canvas(512, 256);
    g.fillStyle = "#141416";
    g.fillRect(0, 0, 512, 256);
    g.fillStyle = "#b3121c";
    g.fillRect(0, 0, 512, 46);
    g.fillRect(0, 210, 512, 46);
    g.fillStyle = "#e9e3df";
    g.font = "bold 64px sans-serif";
    g.fillText("6S  5200mAh", 40, 150);
    g.font = "28px monospace";
    g.fillStyle = "#9a918d";
    g.fillText("22.2V  50C  LiPo", 44, 190);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}
