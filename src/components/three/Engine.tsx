"use client";

import { useFrame, type ThreeElements } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { coolingTubeNormal, nozzleInnerGlow, nozzleTintTexture } from "./textures";

/*
  Gas-generator cycle kerolox engine on a vertical test stand, firing downward.
  Units: nozzle exit radius = 1.
*/

const RT = 0.26; // throat radius
const RC = 0.55; // chamber radius
const RE = 1.0; // exit radius
const Y_TOP = 1.6; // top of combustion chamber
const Y_CONV = 0.95; // start of convergent section
const Y_THROAT = 0.55;
const Y_EXIT = -2.2;

/** Nozzle wall radius as a function of height. */
export function radiusAt(y: number) {
  if (y >= Y_CONV) return RC;
  if (y >= Y_THROAT) {
    const k = (Y_CONV - y) / (Y_CONV - Y_THROAT);
    return RC - (RC - RT) * (0.5 - 0.5 * Math.cos(k * Math.PI));
  }
  // bell: steep initial expansion, flattening toward the exit (Rao-style)
  const k = (Y_THROAT - y) / (Y_THROAT - Y_EXIT);
  return RT + (RE - RT) * (1 - Math.pow(1 - k, 1.9));
}

function nozzleGeometry() {
  const pts: THREE.Vector2[] = [];
  const N = 120;
  // ordered exit → chamber so faces point outward and uv.v = 0 at the exit, 1 at the chamber
  // (matches the canvas gradients, whose top row maps to v = 1)
  for (let i = 0; i <= N; i++) {
    const y = Y_EXIT + (Y_TOP - Y_EXIT) * (i / N);
    pts.push(new THREE.Vector2(radiusAt(y), y));
  }
  return new THREE.LatheGeometry(pts, 96);
}

/* ───────── helpers ───────── */
const UP = new THREE.Vector3(0, 1, 0);

function Strut({ a, b, r, material }: { a: [number, number, number]; b: [number, number, number]; r: number; material: THREE.Material }) {
  const { pos, quat, len } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    return {
      pos: va.clone().add(vb).multiplyScalar(0.5),
      quat: new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()),
      len: dir.length(),
    };
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat} material={material}>
      <cylinderGeometry args={[r, r, len, 14]} />
    </mesh>
  );
}

function Pipe({ points, r, material, flanges = true }: { points: [number, number, number][]; r: number; material: THREE.Material; flanges?: boolean }) {
  const { geo, ends } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "centripetal");
    const geo = new THREE.TubeGeometry(curve, 64, r, 14, false);
    const end = (t: number) => {
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      return { p, q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan) };
    };
    return { geo, ends: [end(0.002), end(0.998)] };
  }, [points, r]);
  return (
    <group>
      <mesh geometry={geo} material={material} />
      {flanges &&
        ends.map((e, i) => (
          <mesh key={i} position={e.p} quaternion={e.q} material={material}>
            <torusGeometry args={[r * 1.35, r * 0.35, 8, 24]} />
          </mesh>
        ))}
    </group>
  );
}

function BoltRing({ y, r, count, material }: { y: number; r: number; count: number; material: THREE.Material }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      o.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      o.rotation.set(0, -a, Math.PI / 2);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [y, r, count]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} material={material}>
      <cylinderGeometry args={[0.018, 0.018, 0.07, 6]} />
    </instancedMesh>
  );
}

/* ───────── plume shader ───────── */
const plumeVert = /* glsl */ `
  uniform float uTime;
  uniform float uPinch;
  uniform float uCells;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  varying float vS;
  void main() {
    vUv = uv;
    float s = 1.0 - uv.y;            // 0 at nozzle exit, 1 at far end
    vS = s;
    vec3 p = position;
    // over-expanded jet: periodic pinching where the shock cells form
    float pinch = 1.0 - uPinch * (0.5 - 0.5 * cos(s * 6.2831 * uCells)) * (1.0 - s);
    p.xz *= pinch;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vV = -mv.xyz;
    vN = normalMatrix * normal;
    gl_Position = projectionMatrix * mv;
  }
`;

const plumeFrag = /* glsl */ `
  uniform float uTime;
  uniform float uThrottle;
  uniform float uIntensity;
  uniform float uCells;
  uniform float uDiamond;
  uniform float uNoise;
  uniform float uSpeed;
  uniform vec3 uColA;
  uniform vec3 uColB;
  uniform vec3 uColC;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  varying float vS;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }
  float fbm(vec3 p) {
    float a = 0.5, s = 0.0;
    for (int i = 0; i < 5; i++) { s += a * noise(p); p *= 2.03; a *= 0.5; }
    return s;
  }

  void main() {
    float s = vS;
    vec3 n = normalize(vN);
    vec3 v = normalize(vV);
    float facing = abs(dot(n, v));           // ~1 at the centre line, 0 at the silhouette
    float core = pow(facing, 1.8);

    float ang = vUv.x * 6.2831853;
    vec3 np = vec3(cos(ang) * 1.3, sin(ang) * 1.3, s * 6.0 - uTime * uSpeed);
    float turb = fbm(np);

    // plume length follows throttle; soft fade at the tail
    float len = 1.0 - smoothstep(0.0, 1.0, s / max(uThrottle, 0.001));
    len *= smoothstep(0.0, 0.03, s + 0.01);

    // Mach diamonds: bright compact cells along the axis
    float cell = 0.5 + 0.5 * cos(s * 6.2831 * uCells);
    float diamonds = pow(cell, 8.0) * exp(-s * 2.2) * uDiamond * pow(facing, 4.0);

    vec3 col = mix(uColA, uColB, smoothstep(0.0, 0.35, s));
    col = mix(col, uColC, smoothstep(0.3, 0.95, s));

    float a = core * len * mix(1.0, turb * 1.7, uNoise);
    a += diamonds * len;
    col += diamonds * vec3(0.9, 0.95, 1.0) * 2.0;
    a *= 0.92 + 0.08 * sin(uTime * 71.0 + s * 23.0);  // combustion flicker
    gl_FragColor = vec4(col * uIntensity, clamp(a, 0.0, 1.0));
  }
`;

function usePlumeMaterial(opts: {
  colA: string;
  colB: string;
  colC: string;
  intensity: number;
  cells: number;
  pinch: number;
  diamond: number;
  noise: number;
  speed: number;
}) {
  return useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: plumeVert,
        fragmentShader: plumeFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        toneMapped: false,
        uniforms: {
          uTime: { value: 0 },
          uThrottle: { value: 0 },
          uIntensity: { value: opts.intensity },
          uCells: { value: opts.cells },
          uPinch: { value: opts.pinch },
          uDiamond: { value: opts.diamond },
          uNoise: { value: opts.noise },
          uSpeed: { value: opts.speed },
          uColA: { value: new THREE.Color(opts.colA) },
          uColB: { value: new THREE.Color(opts.colB) },
          uColC: { value: new THREE.Color(opts.colC) },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
}

/* ───────── engine ───────── */
export function RocketEngine(props: ThreeElements["group"]) {
  const nozzle = useMemo(nozzleGeometry, []);
  const mats = useMemo(() => {
    const tubes = coolingTubeNormal(90, (-0.55 - Y_EXIT) / (Y_TOP - Y_EXIT));
    return {
      nozzle: new THREE.MeshStandardMaterial({
        map: nozzleTintTexture(),
        normalMap: tubes,
        normalScale: new THREE.Vector2(0.5, 0.5),
        metalness: 0.85,
        roughness: 0.4,
      }),
      inner: new THREE.MeshBasicMaterial({
        map: nozzleInnerGlow(),
        color: new THREE.Color(2.4, 2.4, 2.4), // HDR so bloom catches the throat glow
        side: THREE.BackSide,
        toneMapped: false,
      }),
      steel: new THREE.MeshStandardMaterial({ color: "#a6adb6", metalness: 1, roughness: 0.28 }),
      darkSteel: new THREE.MeshStandardMaterial({ color: "#3b3e44", metalness: 0.9, roughness: 0.4 }),
      copper: new THREE.MeshStandardMaterial({ color: "#b46a3a", metalness: 1, roughness: 0.3 }),
      gold: new THREE.MeshStandardMaterial({ color: "#d4a548", metalness: 1, roughness: 0.42 }),
      red: new THREE.MeshStandardMaterial({ color: "#a3121b", metalness: 0.6, roughness: 0.4 }),
      hotLip: new THREE.MeshStandardMaterial({ color: "#2a1a14", emissive: new THREE.Color("#ff5a1a"), emissiveIntensity: 2.2, metalness: 0.6, roughness: 0.5 }),
    };
  }, []);

  const core = usePlumeMaterial({ colA: "#ffe7b0", colB: "#ffb347", colC: "#ff6a1a", intensity: 1.15, cells: 3.4, pinch: 0.26, diamond: 2.2, noise: 0.35, speed: 9 });
  const outer = usePlumeMaterial({ colA: "#ff9a3a", colB: "#ff4a12", colC: "#5a0e06", intensity: 0.55, cells: 0, pinch: 0, diamond: 0, noise: 0.85, speed: 6 });
  const gg = usePlumeMaterial({ colA: "#ffb45a", colB: "#ff5a1a", colC: "#30100a", intensity: 0.7, cells: 0, pinch: 0, diamond: 0, noise: 0.9, speed: 8 });

  const light = useRef<THREE.PointLight>(null);
  const t0 = useRef<number | null>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (t0.current === null) t0.current = t;
    // ignition: ramp to full thrust over ~1.4 s, then small throttle jitter
    const since = t - t0.current;
    const ramp = THREE.MathUtils.smoothstep(since, 0.2, 1.6);
    const thr = ramp * (0.97 + 0.03 * Math.sin(t * 13) * Math.sin(t * 3.1));
    for (const m of [core, outer, gg]) {
      m.uniforms.uTime.value = t;
      m.uniforms.uThrottle.value = thr;
    }
    mats.inner.color.setScalar(0.4 + 2.0 * ramp);
    mats.hotLip.emissiveIntensity = 0.3 + 2.0 * ramp;
    if (light.current) light.current.intensity = ramp * (30 + 6 * Math.sin(t * 47) + 4 * Math.sin(t * 23));
  });

  const exitLen = 4.6;
  const outerLen = 8.5;

  // turbine exhaust duct path (out from the turbopump, down past the nozzle)
  const exhaust: [number, number, number][] = [
    [1.05, 1.75, 0],
    [1.35, 1.5, 0.05],
    [1.45, 0.4, 0.1],
    [1.42, -0.8, 0.12],
    [1.3, -1.7, 0.1],
  ];

  return (
    <group {...props}>
      {/* ── thrust structure / test stand ── */}
      <mesh material={mats.darkSteel} position={[0, 3.45, 0]}>
        <boxGeometry args={[3.8, 0.22, 0.5]} />
      </mesh>
      <mesh material={mats.darkSteel} position={[0, 3.45, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[3.0, 0.22, 0.5]} />
      </mesh>
      {[
        [1.3, 1.0],
        [-1.3, 1.0],
        [1.3, -1.0],
        [-1.3, -1.0],
      ].map(([x, z], i) => (
        <Strut key={i} a={[x, 3.35, z]} b={[0, 2.45, 0]} r={0.05} material={mats.steel} />
      ))}
      {/* gimbal block + bearing */}
      <mesh material={mats.steel} position={[0, 2.35, 0]}>
        <boxGeometry args={[0.42, 0.22, 0.42]} />
      </mesh>
      <mesh material={mats.darkSteel} position={[0, 2.18, 0]}>
        <sphereGeometry args={[0.16, 24, 16]} />
      </mesh>
      {/* hydraulic gimbal actuators */}
      <Strut a={[1.6, 3.3, 0]} b={[0.62, 1.35, 0]} r={0.06} material={mats.steel} />
      <Strut a={[1.55, 3.22, 0]} b={[1.1, 2.33, 0]} r={0.085} material={mats.red} />
      <Strut a={[0, 3.3, -1.6]} b={[0, 1.35, -0.62]} r={0.06} material={mats.steel} />
      <Strut a={[0, 3.22, -1.55]} b={[0, 2.33, -1.1]} r={0.085} material={mats.red} />

      {/* ── injector dome ── */}
      <mesh material={mats.steel} position={[0, Y_TOP, 0]}>
        <sphereGeometry args={[RC, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={mats.steel} position={[0, Y_TOP + 0.48, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.22, 24]} />
      </mesh>
      <mesh material={mats.darkSteel} position={[0, Y_TOP, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[RC + 0.02, 0.05, 12, 64]} />
      </mesh>
      <BoltRing y={Y_TOP} r={RC + 0.07} count={36} material={mats.steel} />

      {/* ── thrust chamber + bell nozzle ── */}
      <mesh geometry={nozzle} material={mats.nozzle} />
      <mesh geometry={nozzle} material={mats.inner} scale={[0.985, 1, 0.985]} />

      {/* fuel inlet manifold near the throat, extension joint flange, hat-band stiffeners */}
      <mesh material={mats.copper} position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radiusAt(0.3) + 0.06, 0.07, 14, 72]} />
      </mesh>
      <mesh material={mats.darkSteel} position={[0, -0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radiusAt(-0.55) + 0.02, 0.04, 10, 96]} />
      </mesh>
      <BoltRing y={-0.55} r={radiusAt(-0.55) + 0.05} count={48} material={mats.steel} />
      {[-1.2, -1.75].map((y) => (
        <mesh key={y} material={mats.darkSteel} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radiusAt(y) + 0.012, 0.022, 8, 96]} />
        </mesh>
      ))}
      {/* glowing nozzle lip */}
      <mesh material={mats.hotLip} position={[0, Y_EXIT, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[RE, 0.03, 10, 96]} />
      </mesh>

      {/* ── turbopump (gold-foil insulated turbine) + gas generator ── */}
      <group position={[1.05, 1.25, 0]}>
        <mesh material={mats.steel}>
          <cylinderGeometry args={[0.24, 0.26, 0.62, 32]} />
        </mesh>
        <mesh material={mats.steel} position={[0, -0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.09, 12, 32]} />
        </mesh>
        <mesh material={mats.gold} position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.22, 0.24, 0.3, 32]} />
        </mesh>
        <mesh material={mats.darkSteel} position={[0.05, 0.75, 0.25]}>
          <cylinderGeometry args={[0.09, 0.09, 0.32, 16]} />
        </mesh>
      </group>
      <Pipe points={exhaust} r={0.11} material={mats.gold} />

      {/* feed lines: LOX & RP-1 from the stand into the pump, pump discharge to dome/manifold */}
      <Pipe points={[[0.75, 3.35, 0.4], [0.9, 2.6, 0.35], [1.0, 1.95, 0.1], [1.05, 1.8, 0]]} r={0.09} material={mats.steel} />
      <Pipe points={[[-0.6, 3.35, 0.5], [-0.95, 2.4, 0.4], [-0.6, 1.9, 0.6], [0.6, 1.0, 0.45], [1.0, 1.05, 0.15]]} r={0.08} material={mats.steel} />
      <Pipe points={[[0.85, 1.4, -0.15], [0.55, 1.95, -0.2], [0.2, 2.15, -0.1]]} r={0.075} material={mats.steel} />
      <Pipe points={[[0.95, 0.95, -0.2], [0.75, 0.6, -0.35], [0.45, 0.32, -0.35]]} r={0.065} material={mats.copper} />

      {/* ── plume ── */}
      <mesh material={core} position={[0, Y_EXIT - exitLen / 2, 0]} renderOrder={3}>
        <cylinderGeometry args={[RE * 0.78, RE * 0.42, exitLen, 64, 96, true]} />
      </mesh>
      <mesh material={outer} position={[0, Y_EXIT - outerLen / 2, 0]} renderOrder={4}>
        <cylinderGeometry args={[RE * 1.0, RE * 1.9, outerLen, 64, 96, true]} />
      </mesh>
      {/* gas-generator exhaust flame */}
      <mesh material={gg} position={[1.3, -1.7 - 0.9, 0.1]} renderOrder={5}>
        <cylinderGeometry args={[0.11, 0.3, 1.8, 24, 32, true]} />
      </mesh>
      <pointLight ref={light} position={[0, Y_EXIT - 1.0, 0]} color="#ff8a3a" distance={14} decay={1.6} />
    </group>
  );
}
