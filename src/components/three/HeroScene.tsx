"use client";

import { Canvas } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import Studio from "./Studio";
import { DroneLights, FlyingDrone } from "./Drone";

export default function HeroScene({ eventSource }: { eventSource?: React.RefObject<HTMLElement | null> }) {
  return (
    <Canvas
      camera={{ position: [0, 0.6, 8], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      eventSource={eventSource as React.RefObject<HTMLElement>}
      eventPrefix="client"
    >
      <DroneLights />
      {/* physics-driven flight (no Float wobble): the controller produces all motion */}
      <FlyingDrone />
      {/* dust caught in the light */}
      <Sparkles count={50} scale={[16, 9, 4]} size={1.6} speed={0.25} color="#ff8a66" opacity={0.5} />
      <Studio />
    </Canvas>
  );
}
