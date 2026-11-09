"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import Studio from "./Studio";
import { RocketEngine } from "./Engine";

const TARGET: [number, number, number] = [0, -1.6, 0];

/** Slow turntable for touch screens, where OrbitControls would swallow the page scroll. */
function AutoOrbit({ speed = 0.1 }: { speed?: number }) {
  const camera = useThree((s) => s.camera);
  const r = useRef<{ radius: number; y: number; a: number } | null>(null);
  useFrame((_, dt) => {
    if (!r.current) {
      const { x, y, z } = camera.position;
      r.current = { radius: Math.hypot(x, z), y, a: Math.atan2(x, z) };
    }
    r.current.a += dt * speed;
    camera.position.set(Math.sin(r.current.a) * r.current.radius, r.current.y, Math.cos(r.current.a) * r.current.radius);
    camera.lookAt(...TARGET);
  });
  return null;
}

/** Hot-fire test of a kerolox engine on a vertical stand. Drag to orbit (mouse / trackpad). */
export default function EngineScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [touch, setTouch] = useState(false);
  const [small, setSmall] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    setSmall(window.innerWidth < 768);
    // only render while on screen — saves battery on phones and GPU everywhere
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px" });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="h-full w-full">
      <Canvas
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, -0.4, 17], fov: 40 }}
        dpr={small ? [1, 1.5] : [1, 1.75]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        style={{ touchAction: "pan-y" }}
        onCreated={({ camera }) => (camera as THREE.PerspectiveCamera).lookAt(...TARGET)}
      >
        <color attach="background" args={["#0c0808"]} />
        <fog attach="fog" args={["#0c0808", 16, 30]} />
        <hemisphereLight args={["#ffece0", "#1a0c08", 0.5]} />
        <directionalLight position={[-5, 6, 6]} intensity={2.2} color="#fff1e6" />
        <directionalLight position={[5, 3, -4]} intensity={1.6} color="#ff3a1a" />

        <RocketEngine position={[0, 0.2, 0]} />

        {/* embers / soot shed from the plume */}
        <Sparkles count={small ? 30 : 60} scale={[3, 6, 3]} position={[0, -5.2, 0]} size={2.5} speed={2.5} color="#ffb060" opacity={0.8} />

        {touch ? (
          <AutoOrbit />
        ) : (
          <OrbitControls
            target={TARGET}
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.6}
            minPolarAngle={Math.PI * 0.38}
            maxPolarAngle={Math.PI * 0.6}
          />
        )}
        <Studio />
        <EffectComposer multisampling={small ? 0 : 4}>
          <Bloom mipmapBlur intensity={1.0} luminanceThreshold={1.0} luminanceSmoothing={0.25} radius={0.75} />
          <Vignette offset={0.25} darkness={0.7} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
