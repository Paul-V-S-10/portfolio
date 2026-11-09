"use client";
import { Environment, Lightformer } from "@react-three/drei";

/** Procedural studio reflections — no HDR download needed. */
export default function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer intensity={2} form="rect" position={[0, 5, -5]} scale={[10, 2, 1]} color="#fff3ec" />
      <Lightformer intensity={2} form="rect" position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} color="#ff2a1a" />
      <Lightformer intensity={1.5} form="rect" position={[5, 1, 0]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} color="#ff7a3d" />
      <Lightformer intensity={1} form="ring" position={[0, 0, 6]} scale={4} color="#ffffff" />
    </Environment>
  );
}
