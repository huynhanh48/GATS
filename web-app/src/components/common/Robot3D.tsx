"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Float, Environment, ContactShadows, Stars, useAnimations } from "@react-three/drei";
import * as THREE from "three";

const MODELS = {
  robot: "/3d/robot-ai/ai_kitchen__just_a_bit_fun.glb",
  tv: "/3d/tv/base_basic_pbr.glb",
  platinum: "/3d/platium/base_basic_pbr.glb",
  ufo: "/3d/ufo/base_basic_pbr.glb",
};

// Reusable model loader that applies theme color
function ColoredModel({ url, color, position, scale, rotation }: { url: string, color: string, position?: [number, number, number], scale?: number | [number, number, number], rotation?: [number, number, number] }) {
  const { scene, animations } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);
  const { actions } = useAnimations(animations, ref);

  // We use the original scene because scene.clone() breaks SkinnedMesh animations in Three.js

  useEffect(() => {
    // Apply theme color to the model's materials safely
    scene.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        // Only clone material once to avoid memory leaks on re-renders
        if (!mesh.userData.originalMaterial) {
          mesh.userData.originalMaterial = (mesh.material as THREE.Material).clone();
          mesh.material = (mesh.material as THREE.Material).clone();
        }

        const mat = mesh.material as THREE.MeshStandardMaterial;
        const orig = mesh.userData.originalMaterial as THREE.MeshStandardMaterial;

        // Enhance metalness/roughness for better PBR looks
        mat.metalness = 0.8;
        mat.roughness = 0.2;

        if (color !== "default") {
          // Set the primary color
          mat.color.set(color);

          // Add a subtle glow matching the theme
          mat.emissive.set(color);
          mat.emissiveIntensity = 0.2;
        } else {
          // Revert to original color
          mat.color.copy(orig.color);
          mat.emissive.copy(orig.emissive);
          mat.emissiveIntensity = orig.emissiveIntensity;
        }
      }
    });
  }, [scene, color]);

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      // Play the first animation
      const actionName = Object.keys(actions)[0];
      const action = actions[actionName];
      if (action) {
        action.reset().fadeIn(0.5).play();
      }
    }
  }, [actions]);

  return (
    <group ref={ref} position={position || [0, 0, 0]} scale={scale || 1} rotation={rotation || [0, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

/**
 * Checks which model files actually exist so a missing GLB (e.g. assets not
 * copied to public/3d yet) degrades to a placeholder instead of crashing.
 */
function useAvailableModels() {
  const [available, setAvailable] = useState<Set<string> | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      Object.values(MODELS).map((url) =>
        fetch(url, { method: "HEAD" })
          .then((res) => (res.ok ? url : null))
          .catch(() => null)
      )
    ).then((urls) => {
      if (!cancelled) {
        setAvailable(new Set(urls.filter((u): u is string => u !== null)));
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return available;
}

export function Robot3D({ themeColor }: { themeColor: string }) {
  const available = useAvailableModels();
  const glowColor = themeColor === "default" ? "#0070eb" : themeColor;

  const glow = (
    <div
      className="absolute inset-0 bg-gradient-to-tr to-transparent blur-3xl opacity-20 rounded-full transition-colors duration-1000 pointer-events-none"
      style={{ backgroundImage: `linear-gradient(to top right, ${glowColor}, transparent)` }}
    ></div>
  );

  // Still checking, or no model files present: show the glow placeholder only
  if (!available || available.size === 0) {
    return (
      <div className="w-full h-full min-h-[500px] relative z-10 flex items-center justify-center">
        {glow}
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px] relative z-10 flex items-center justify-center">
      {glow}

      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} className="w-full h-full drop-shadow-2xl">
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-10, -10, -10]} intensity={0.5} color={glowColor} />
        <pointLight position={[0, 0, 5]} intensity={1} color={glowColor} distance={10} />

        {/* Starry sky effect */}
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1.5} />

        {/* Main Robot */}
        {available.has(MODELS.robot) && (
          <Suspense fallback={null}>
            <Float speed={2.5} rotationIntensity={0.2} floatIntensity={1.5}>
              <ColoredModel url={MODELS.robot} color={themeColor} position={[0, -2.0, 0]} scale={2.2} />
            </Float>
          </Suspense>
        )}

        {/* Floating TV above left */}
        {available.has(MODELS.tv) && (
          <Suspense fallback={null}>
            <Float speed={3} rotationIntensity={1.5} floatIntensity={2} position={[-1.8, 2, -1]}>
              <ColoredModel url={MODELS.tv} color={themeColor} scale={0.6} rotation={[0.2, 0.5, -0.2]} />
            </Float>
          </Suspense>
        )}

        {/* Floating Platinum Diamond above right */}
        {available.has(MODELS.platinum) && (
          <Suspense fallback={null}>
            <Float speed={2} rotationIntensity={2} floatIntensity={1.5} position={[1.8, 1.5, -1.5]}>
              <ColoredModel url={MODELS.platinum} color={themeColor} scale={0.6} rotation={[-0.2, -0.5, 0.2]} />
            </Float>
          </Suspense>
        )}

        {/* Floating UFO hovering high in center */}
        {available.has(MODELS.ufo) && (
          <Suspense fallback={null}>
            <Float speed={4} rotationIntensity={1} floatIntensity={1} position={[0, 3, -2]}>
              <ColoredModel url={MODELS.ufo} color={themeColor} scale={0.8} rotation={[0.1, 0, 0]} />
            </Float>
          </Suspense>
        )}

        {/* Real reflections and lighting environment */}
        <Environment preset="studio" />

        {/* Soft shadow on the floor */}
        <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={12} blur={2.5} far={4} color={glowColor} />
      </Canvas>
    </div>
  );
}
