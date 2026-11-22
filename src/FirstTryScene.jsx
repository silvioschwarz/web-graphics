// app/external/web-graphics/src/FirstTryScene.jsx
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function FirstTryScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    function animate(time) {
      cube.rotation.x = time / 2000;
      cube.rotation.y = time / 500;
      renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);

    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    return () => {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "75vh",
        minHeight: "480px",
        borderRadius: "10px",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "16px",
          zIndex: 10,
          color: "white",
          pointerEvents: "none",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.2rem" }}>My first three.js app</h2>
      </div>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
