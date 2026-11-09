"use client";

import { useFrame, type ThreeElements } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { batteryLabel, carbonTexture, glowTexture, propBlurTexture } from "./textures";

/*
  A 500 mm-class autonomous X-quad (Pixhawk Cube + Pi companion + payload hook),
  modelled procedurally and flown by a simple physics model:
    – position follows a target through a damped spring (like a position controller)
    – attitude is derived from the commanded acceleration (a quad must tilt to accelerate)
    – heading is held, with only slow yaw corrections (no turntable spinning)
    – the slung payload swings with a lag
*/

const R = 1.6; // motor radius from centre
const PROP_R = 0.82;
const G = 9.81;

function useMaterials() {
  return useMemo(() => {
    const carbon = new THREE.MeshPhysicalMaterial({
      map: carbonTexture(3),
      color: "#ffffff",
      metalness: 0.25,
      roughness: 0.38,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
    });
    const tube = new THREE.MeshPhysicalMaterial({
      map: carbonTexture(1),
      metalness: 0.25,
      roughness: 0.35,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    });
    tube.map = tube.map!.clone();
    tube.map.repeat.set(1, 10);
    tube.map.needsUpdate = true;
    return {
      carbon,
      tube,
      anodRed: new THREE.MeshPhysicalMaterial({ color: "#a3121b", metalness: 1, roughness: 0.28, clearcoat: 0.4 }),
      alu: new THREE.MeshStandardMaterial({ color: "#c9ced6", metalness: 1, roughness: 0.22 }),
      darkAlu: new THREE.MeshStandardMaterial({ color: "#2a2c31", metalness: 0.9, roughness: 0.35 }),
      copper: new THREE.MeshStandardMaterial({ color: "#b4672f", metalness: 1, roughness: 0.35 }),
      plastic: new THREE.MeshStandardMaterial({ color: "#121214", metalness: 0, roughness: 0.55 }),
      rubber: new THREE.MeshStandardMaterial({ color: "#0c0c0d", metalness: 0, roughness: 0.9 }),
      pcb: new THREE.MeshStandardMaterial({ color: "#0f4a2c", metalness: 0.2, roughness: 0.5 }),
      cubeOrange: new THREE.MeshStandardMaterial({ color: "#d9661a", metalness: 0.3, roughness: 0.45 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#05070a", metalness: 0, roughness: 0.05, clearcoat: 1 }),
      battery: new THREE.MeshStandardMaterial({ map: batteryLabel(), roughness: 0.6 }),
      cardboard: new THREE.MeshStandardMaterial({ color: "#8b6a46", roughness: 0.9 }),
      tape: new THREE.MeshStandardMaterial({ color: "#b3121c", roughness: 0.5 }),
      propBlade: new THREE.MeshStandardMaterial({ color: "#0f0f11", roughness: 0.4, transparent: true, opacity: 0.22, depthWrite: false }),
      propDisc: new THREE.MeshBasicMaterial({ map: propBlurTexture(), transparent: true, depthWrite: false, side: THREE.DoubleSide }),
    };
  }, []);
}
type Mats = ReturnType<typeof useMaterials>;

/* ── geometry helpers ── */
function plateGeometry(w: number, d: number, t: number) {
  const s = new THREE.Shape();
  const r = 0.12;
  s.moveTo(-w / 2 + r, -d / 2);
  s.lineTo(w / 2 - r, -d / 2);
  s.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r);
  s.lineTo(w / 2, d / 2 - r);
  s.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2);
  s.lineTo(-w / 2 + r, d / 2);
  s.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r);
  s.lineTo(-w / 2, -d / 2 + r);
  s.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
  // lightening cut-outs
  const slot = (cx: number, cy: number, sw: number, sh: number) => {
    const h = new THREE.Path();
    const rr = Math.min(sw, sh) / 2;
    h.moveTo(cx - sw / 2 + rr, cy - sh / 2);
    h.lineTo(cx + sw / 2 - rr, cy - sh / 2);
    h.absarc(cx + sw / 2 - rr, cy, rr, -Math.PI / 2, Math.PI / 2, false);
    h.lineTo(cx - sw / 2 + rr, cy + sh / 2);
    h.absarc(cx - sw / 2 + rr, cy, rr, Math.PI / 2, (3 * Math.PI) / 2, false);
    s.holes.push(h);
  };
  slot(0, 0.24 * d, 0.45 * w, 0.09);
  slot(0, -0.24 * d, 0.45 * w, 0.09);
  slot(-0.3 * w, 0, 0.09, 0.3 * d);
  slot(0.3 * w, 0, 0.09, 0.3 * d);
  const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 12 });
  g.rotateX(-Math.PI / 2);
  return g;
}

function bladeGeometry() {
  // planform: wide near the root, tapering to a rounded tip
  const s = new THREE.Shape();
  const pts: [number, number][] = [];
  const N = 14;
  for (let i = 0; i <= N; i++) {
    const r = 0.07 + (PROP_R - 0.07) * (i / N);
    const k = i / N;
    const chord = 0.13 * Math.sin(Math.PI * (0.15 + 0.85 * k)) * (1 - 0.55 * k) + 0.02;
    pts.push([r, chord * 0.6]);
  }
  s.moveTo(0.04, 0.035);
  pts.forEach(([x, y]) => s.lineTo(x, y));
  for (let i = N; i >= 0; i--) {
    const [x, y] = pts[i];
    s.lineTo(x, -y * 0.65);
  }
  s.lineTo(0.04, -0.035);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 1 });
  g.translate(0, 0, -0.006);
  g.rotateX(-Math.PI / 2);
  return g;
}

function Glow({ color, size = 0.35, intensity = 1, strobe }: { color: string; size?: number; intensity?: number; strobe?: boolean }) {
  const mat = useRef<THREE.SpriteMaterial>(null);
  useFrame(({ clock }) => {
    if (!mat.current) return;
    if (strobe) {
      // aviation-style double flash every 1.2 s
      const p = clock.elapsedTime % 1.2;
      mat.current.opacity = p < 0.05 || (p > 0.15 && p < 0.2) ? 1 : 0.05;
    } else mat.current.opacity = intensity;
  });
  return (
    <sprite scale={size}>
      <spriteMaterial ref={mat} map={glowTexture()} color={color} blending={THREE.AdditiveBlending} depthWrite={false} transparent />
    </sprite>
  );
}

/* ── sub-assemblies ── */
function Motor({ m, dir, spin }: { m: Mats; dir: 1 | -1; spin: React.RefObject<number> }) {
  const disc = useRef<THREE.Mesh>(null);
  const blades = useRef<THREE.Group>(null);
  const bell = useRef<THREE.Group>(null);
  const blade = useMemo(bladeGeometry, []);
  useFrame((_, dt) => {
    const w = spin.current ?? 1;
    if (disc.current) disc.current.rotation.z += dt * 55 * w * dir;
    if (bell.current) bell.current.rotation.y += dt * 55 * w * dir;
    // camera-shutter aliasing: blades appear to crawl slowly
    if (blades.current) blades.current.rotation.y += dt * 2.4 * dir;
  });
  return (
    <group>
      {/* motor mount plate */}
      <mesh material={m.darkAlu} position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.025, 28]} />
      </mesh>
      {/* stator base */}
      <mesh material={m.darkAlu} position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.15, 0.16, 0.05, 28]} />
      </mesh>
      {/* copper windings visible through the bell vents */}
      <mesh material={m.copper} position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.135, 0.135, 0.13, 24]} />
      </mesh>
      {/* rotating outrunner bell: 6 ribs + cap */}
      <group ref={bell} position={[0, 0.11, 0]}>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} material={m.anodRed} position={[Math.cos(a) * 0.158, 0, Math.sin(a) * 0.158]} rotation={[0, -a, 0]}>
              <boxGeometry args={[0.028, 0.15, 0.1]} />
            </mesh>
          );
        })}
        <mesh material={m.anodRed} position={[0, 0.085, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 0.035, 32]} />
        </mesh>
        <mesh material={m.anodRed} position={[0, -0.07, 0]}>
          <torusGeometry args={[0.162, 0.012, 8, 32]} />
        </mesh>
      </group>
      {/* prop adapter + spinner nut */}
      <mesh material={m.alu} position={[0, 0.235, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.06, 16]} />
      </mesh>
      <mesh material={m.alu} position={[0, 0.29, 0]}>
        <coneGeometry args={[0.045, 0.07, 16]} />
      </mesh>
      {/* prop */}
      <group position={[0, 0.25, 0]}>
        <mesh ref={disc} rotation={[-Math.PI / 2, 0, 0]} material={m.propDisc} renderOrder={2}>
          <circleGeometry args={[PROP_R, 64]} />
        </mesh>
        <group ref={blades}>
          <mesh geometry={blade} material={m.propBlade} rotation={[0.22 * dir, 0, 0]} />
          <mesh geometry={blade} material={m.propBlade} rotation={[-0.22 * dir, Math.PI, 0]} />
        </group>
      </group>
    </group>
  );
}

function Payload({ m }: { m: Mats }) {
  return (
    <group>
      {/* tether */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.5, 6]} />
        <meshStandardMaterial color="#d8d2cc" roughness={0.8} />
      </mesh>
      <mesh material={m.cardboard} position={[0, -0.62, 0]}>
        <boxGeometry args={[0.36, 0.26, 0.3]} />
      </mesh>
      <mesh material={m.tape} position={[0, -0.62, 0]}>
        <boxGeometry args={[0.37, 0.265, 0.07]} />
      </mesh>
    </group>
  );
}

export function QuadModel({ spin, swing }: { spin: React.RefObject<number>; swing: React.RefObject<THREE.Group | null> }) {
  const m = useMaterials();
  const top = useMemo(() => plateGeometry(1.0, 1.15, 0.03), []);
  const bottom = useMemo(() => plateGeometry(1.1, 1.3, 0.03), []);

  // front of the aircraft is +Z (camera side); arms at 45° diagonals, alternating spin
  const arms = [
    { a: Math.PI / 4, dir: 1 as const },
    { a: (3 * Math.PI) / 4, dir: -1 as const },
    { a: (5 * Math.PI) / 4, dir: 1 as const },
    { a: (7 * Math.PI) / 4, dir: -1 as const },
  ].map((arm) => ({ ...arm, front: Math.cos(arm.a) > 0 }));

  return (
    <group>
      {/* centre plates */}
      <mesh geometry={bottom} material={m.carbon} position={[0, -0.03, 0]} />
      <mesh geometry={top} material={m.carbon} position={[0, 0.22, 0]} />
      {/* standoffs */}
      {[
        [0.4, 0.45],
        [-0.4, 0.45],
        [0.4, -0.45],
        [-0.4, -0.45],
      ].map(([x, z], i) => (
        <mesh key={i} material={m.alu} position={[x, 0.1, z]}>
          <cylinderGeometry args={[0.022, 0.022, 0.25, 8]} />
        </mesh>
      ))}

      {/* companion computer (Raspberry Pi) between plates */}
      <mesh material={m.pcb} position={[0, 0.05, -0.05]}>
        <boxGeometry args={[0.5, 0.02, 0.34]} />
      </mesh>
      <mesh material={m.alu} position={[0.14, 0.09, -0.05]}>
        <boxGeometry args={[0.13, 0.07, 0.15]} />
      </mesh>
      <mesh material={m.plastic} position={[-0.1, 0.08, -0.08]}>
        <boxGeometry args={[0.12, 0.04, 0.12]} />
      </mesh>

      {/* flight controller (Cube) on top */}
      <mesh material={m.darkAlu} position={[0, 0.3, 0.02]}>
        <boxGeometry args={[0.3, 0.13, 0.42]} />
      </mesh>
      <mesh material={m.cubeOrange} position={[0, 0.39, 0.02]}>
        <boxGeometry args={[0.28, 0.06, 0.4]} />
      </mesh>
      <mesh material={m.plastic} position={[0, 0.425, 0.02]}>
        <boxGeometry args={[0.2, 0.012, 0.3]} />
      </mesh>

      {/* GPS mast + puck */}
      <mesh material={m.tube} position={[0, 0.48, -0.42]}>
        <cylinderGeometry args={[0.018, 0.018, 0.55, 10]} />
      </mesh>
      <group position={[0, 0.78, -0.42]}>
        <mesh material={m.plastic}>
          <cylinderGeometry args={[0.2, 0.22, 0.07, 32]} />
        </mesh>
        <mesh material={m.darkAlu} position={[0, 0.045, 0]}>
          <sphereGeometry args={[0.19, 32, 8, 0, Math.PI * 2, 0, Math.PI / 6]} />
        </mesh>
        <group position={[0, 0.01, 0.2]}>
          <Glow color="#7fd0ff" size={0.12} intensity={0.8} />
        </group>
      </group>

      {/* telemetry antennas */}
      {[-1, 1].map((s) => (
        <mesh key={s} material={m.plastic} position={[s * 0.48, 0.0, -0.55]} rotation={[0.5, 0, s * 0.6]}>
          <cylinderGeometry args={[0.012, 0.016, 0.38, 8]} />
        </mesh>
      ))}

      {/* front camera */}
      <group position={[0, 0.08, 0.66]}>
        <mesh material={m.plastic}>
          <boxGeometry args={[0.16, 0.14, 0.08]} />
        </mesh>
        <mesh material={m.glass} position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.05, 0.04, 20]} />
        </mesh>
      </group>

      {/* LiPo battery under the frame with strap */}
      <mesh material={m.battery} position={[0, -0.17, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.9, 0.22, 0.38]} />
      </mesh>
      {[-0.22, 0.22].map((z) => (
        <mesh key={z} material={m.rubber} position={[0, -0.17, z]}>
          <boxGeometry args={[0.41, 0.235, 0.05]} />
        </mesh>
      ))}

      {/* landing gear: two legs per side + skid */}
      {[-1, 1].map((s) => (
        <group key={s}>
          {[-0.35, 0.35].map((z) => (
            <mesh key={z} material={m.tube} position={[s * 0.5, -0.38, z]} rotation={[0, 0, s * 0.32]}>
              <cylinderGeometry args={[0.025, 0.025, 0.72, 10]} />
            </mesh>
          ))}
          <mesh material={m.tube} position={[s * 0.62, -0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 1.15, 10]} />
          </mesh>
          {[-0.58, 0.58].map((z) => (
            <mesh key={z} material={m.rubber} position={[s * 0.62, -0.72, z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.06, 10]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* payload release: servo + hook, slung payload */}
      <mesh material={m.plastic} position={[0, -0.33, 0.15]}>
        <boxGeometry args={[0.12, 0.1, 0.2]} />
      </mesh>
      <mesh material={m.anodRed} position={[0, -0.4, 0.2]}>
        <torusGeometry args={[0.04, 0.012, 8, 16, Math.PI * 1.4]} />
      </mesh>
      <group ref={swing} position={[0, -0.42, 0.2]}>
        <Payload m={m} />
      </group>

      {/* arms, ESCs, motors, nav lights */}
      {arms.map(({ a, dir, front }) => {
        const x = Math.sin(a) * R;
        const z = Math.cos(a) * R;
        return (
          <group key={a}>
            <group rotation={[0, a, 0]}>
              <mesh material={m.tube} position={[0, 0.0, R / 2 + 0.15]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, R - 0.1, 14]} />
              </mesh>
              {/* arm clamp at the frame */}
              <mesh material={m.plastic} position={[0, 0, 0.58]}>
                <boxGeometry args={[0.16, 0.15, 0.16]} />
              </mesh>
              {/* shrink-wrapped ESC on the arm */}
              <mesh material={m.plastic} position={[0, -0.07, 0.95]}>
                <boxGeometry args={[0.1, 0.05, 0.26]} />
              </mesh>
              <mesh position={[0, -0.04, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.45, 6]} />
                <meshStandardMaterial color={front ? "#a3121b" : "#141414"} roughness={0.6} />
              </mesh>
            </group>
            <group position={[x, 0.06, z]}>
              <Motor m={m} dir={dir} spin={spin} />
              <group position={[0, -0.08, 0]}>
                <mesh>
                  <sphereGeometry args={[0.025, 10, 10]} />
                  <meshBasicMaterial color={front ? "#ff2a2a" : "#ffffff"} />
                </mesh>
                <Glow color={front ? "#ff2a1a" : "#ffffff"} size={front ? 0.5 : 0.7} intensity={0.85} strobe={!front} />
              </group>
            </group>
          </group>
        );
      })}
    </group>
  );
}

/* ── flight controller ── */
export function FlyingDrone({ eventScale = 1, ...props }: { eventScale?: number } & ThreeElements["group"]) {
  const root = useRef<THREE.Group>(null);
  const yawG = useRef<THREE.Group>(null);
  const tiltG = useRef<THREE.Group>(null);
  const swing = useRef<THREE.Group>(null);
  const spin = useRef(1);
  const s = useRef({
    init: false,
    pos: new THREE.Vector3(),
    vel: new THREE.Vector3(),
    target: new THREE.Vector3(),
    acc: new THREE.Vector3(),
    tiltX: 0,
    tiltZ: 0,
    yaw: -0.6,
    swingX: 0,
    swingZ: 0,
  });

  useFrame(({ clock, pointer, viewport, size }, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const t = clock.elapsedTime;
    const st = s.current;
    const scroll = Math.min(window.scrollY / window.innerHeight, 1.5);

    // Below 1024px the hero is a tall stacked layout whose height depends on the content,
    // so place and size the drone in screen pixels — hovering over the right half of
    // "ENGINEER" (font size ew = min(27vw, 42svh), top at 56px + 0.15·ew; see Hero.tsx) —
    // and convert to world units.
    const stacked = size.width < 1024;
    const upp = viewport.height / size.height; // world units per CSS pixel at the focal plane
    let baseX: number;
    let baseY: number;
    let sc: number;
    if (stacked) {
      const ew = Math.min(0.27 * size.width, 0.42 * window.innerHeight);
      baseX = 0.17 * size.width * upp;
      baseY = viewport.height / 2 - (70 + 0.5 * ew) * upp;
      sc = (Math.min(0.44 * size.width, 280, 1.7 * ew) * upp) / 3.9; // airframe is ~3.9 units across
    } else {
      baseX = Math.min(viewport.width / 2 - 2.4, 3.0);
      baseY = 1.7;
      sc = 0.5;
    }
    // GPS-hold wander: low-frequency drift a real hover never quite cancels
    const wx = 0.22 * Math.sin(t * 0.37) + 0.1 * Math.sin(t * 0.91 + 1);
    const wy = 0.07 * Math.sin(t * 0.8) + 0.04 * Math.sin(t * 1.9);
    const wz = 0.25 * Math.sin(t * 0.29 + 2);
    st.target.set(
      baseX + pointer.x * 0.7 * eventScale - scroll * 2.8 + wx,
      baseY + pointer.y * 0.35 + scroll * 3.2 + wy,
      wz,
    );
    if (!st.init) {
      st.pos.copy(st.target);
      st.init = true;
    }

    // damped-spring position controller
    const k = 4.5;
    const c = 3.3;
    st.acc.copy(st.target).sub(st.pos).multiplyScalar(k).addScaledVector(st.vel, -c);
    const h = Math.hypot(st.acc.x, st.acc.z);
    const maxH = 5.5;
    if (h > maxH) {
      st.acc.x *= maxH / h;
      st.acc.z *= maxH / h;
    }
    st.vel.addScaledVector(st.acc, dt);
    st.pos.addScaledVector(st.vel, dt);

    // heading hold with slow corrections
    const yawTarget = -0.6 + 0.18 * Math.sin(t * 0.13) + THREE.MathUtils.clamp(st.vel.x * 0.06, -0.15, 0.15);
    st.yaw = THREE.MathUtils.damp(st.yaw, yawTarget, 1.2, dt);

    // attitude needed to produce the horizontal acceleration (body frame)
    const cy = Math.cos(st.yaw);
    const sy = Math.sin(st.yaw);
    const axb = st.acc.x * cy - st.acc.z * sy;
    const azb = st.acc.x * sy + st.acc.z * cy;
    const turb = 0.012;
    const wantZ = -Math.atan2(axb, G) + turb * Math.sin(t * 7.3) + turb * 0.6 * Math.sin(t * 13.1);
    const wantX = Math.atan2(azb, G) + turb * Math.sin(t * 6.1 + 1) + turb * 0.6 * Math.sin(t * 11.7);
    st.tiltX = THREE.MathUtils.damp(st.tiltX, wantX, 9, dt);
    st.tiltZ = THREE.MathUtils.damp(st.tiltZ, wantZ, 9, dt);

    // slung payload lags behind the airframe's attitude
    st.swingX = THREE.MathUtils.damp(st.swingX, -st.tiltX * 1.1, 2.2, dt);
    st.swingZ = THREE.MathUtils.damp(st.swingZ, -st.tiltZ * 1.1, 2.2, dt);

    // collective: props speed up when climbing / manoeuvring
    spin.current = 1 + THREE.MathUtils.clamp(st.acc.y / G, -0.15, 0.3) + h * 0.01;

    root.current?.position.copy(st.pos);
    root.current?.scale.setScalar(sc);
    if (yawG.current) yawG.current.rotation.y = st.yaw;
    tiltG.current?.rotation.set(st.tiltX, 0, st.tiltZ);
    swing.current?.rotation.set(st.swingX, 0, st.swingZ);
  });

  return (
    <group ref={root} {...props}>
      <group ref={yawG}>
        <group ref={tiltG}>
          <QuadModel spin={spin} swing={swing} />
        </group>
      </group>
    </group>
  );
}

/** Shared lighting rig: warm key top-left, red rim from behind, soft front fill. */
export function DroneLights() {
  return (
    <>
      <hemisphereLight args={["#fff4ee", "#2a1210", 1.1]} />
      <directionalLight position={[-4, 7, 5]} intensity={3.6} color="#fff1e6" />
      <directionalLight position={[0, 1, 8]} intensity={1.3} color="#ffffff" />
      <directionalLight position={[3, 2, -6]} intensity={3.2} color="#ff2a1a" />
      <directionalLight position={[2, -4, 4]} intensity={0.8} color="#9fb4ff" />
    </>
  );
}
