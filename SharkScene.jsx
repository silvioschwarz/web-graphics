import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function SharkScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // 1. Szene, Kamera & Renderer Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a3c5c);
    scene.fog = new THREE.FogExp2(0x0a3c5c, 0.015);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 15, 35);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 2. Lichtquellen
    const ambientLight = new THREE.AmbientLight(0x206fa1, 3.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x7ae5ff, 4.5);
    sunLight.position.set(10, 50, 10);
    scene.add(sunLight);

    // 3. Hai aus Segmenten aufbauen
    const sharkGroup = new THREE.Group();
    scene.add(sharkGroup);

    const sharkMaterial = new THREE.MeshStandardMaterial({
      color: 0x435467,
      roughness: 0.4,
      metalness: 0.1,
      flatShading: false,
    });
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x050505 });

    const segmentCount = 8;
    const segments = [];
    const segmentGroup = new THREE.Group();
    sharkGroup.add(segmentGroup);

    let previousSegment = segmentGroup;
    for (let i = 0; i < segmentCount; i++) {
      const currentSegGroup = new THREE.Group();
      let radius = 1.6 * Math.sin(((i + 1) / (segmentCount + 1)) * Math.PI);
      if (i === 0) radius = 1.2;

      const segGeo = new THREE.CylinderGeometry(radius * 0.8, radius, 1.8, 16);
      segGeo.rotateX(Math.PI / 2);

      const mesh = new THREE.Mesh(segGeo, sharkMaterial);
      currentSegGroup.add(mesh);

      currentSegGroup.position.z = i === 0 ? 0 : -1.5;
      previousSegment.add(currentSegGroup);

      segments.push(currentSegGroup);
      previousSegment = currentSegGroup;
    }

    // Augen, Rücken-, Brust- und Schwanzflosse
    const eyeGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    leftEye.position.set(0.6, 0.4, 0.5);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    rightEye.position.set(-0.6, 0.4, 0.5);
    segments.add(leftEye, rightEye);

    const dorsalGeo = new THREE.ConeGeometry(0.3, 3.2, 4);
    dorsalGeo.rotateX(Math.PI / 3);
    const dorsalFin = new THREE.Mesh(dorsalGeo, sharkMaterial);
    dorsalFin.position.set(0, 1.8, 0);
    segments.add(dorsalFin);

    const pectoralGeo = new THREE.ConeGeometry(0.25, 4.0, 4);
    const leftPectoral = new THREE.Mesh(pectoralGeo, sharkMaterial);
    leftPectoral.position.set(1.8, -0.2, 0);
    leftPectoral.rotation.z = Math.PI / 2.5;
    leftPectoral.rotation.y = -Math.PI / 6;

    const rightPectoral = new THREE.Mesh(pectoralGeo, sharkMaterial);
    rightPectoral.position.set(-1.8, -0.2, 0);
    rightPectoral.rotation.z = -Math.PI / 2.5;
    rightPectoral.rotation.y = Math.PI / 6;
    segments.add(leftPectoral, rightPectoral);

    const tailFinShape = new THREE.ConeGeometry(0.15, 3.5, 4);
    const tailFin = new THREE.Mesh(tailFinShape, sharkMaterial);
    tailFin.position.set(0, 0, -1.5);
    tailFin.scale.set(1, 2.5, 0.8);
    segments[segmentCount - 1].add(tailFin);

    // 4. OrbitControls (ersetzt doppelte document mouse-Listener)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;

    // 5. Animationsschleife
    let time = 0;
    const swimSpeed = 0.7;
    const startRadius = 22;
    const narrowness = 0.15;
    const sinkSpeed = 0.5;
    const minY = -20;
    let frameId;

    function animate() {
      frameId = requestAnimationFrame(animate);
      time += 0.015 * swimSpeed;

      let currentRadius = startRadius - time * narrowness;
      if (currentRadius < 1.8 || sharkGroup.position.y < minY) {
        time = 0;
        currentRadius = startRadius;
      }

      const nextX = Math.cos(time) * currentRadius;
      const nextZ = Math.sin(time) * currentRadius;
      const nextY = 12 - time * sinkSpeed;

      const currentPos = sharkGroup.position.clone();
      sharkGroup.position.set(nextX, nextY, nextZ);

      sharkGroup.lookAt(
        nextX + (nextX - currentPos.x),
        nextY + (nextY - currentPos.y),
        nextZ + (nextZ - currentPos.z)
      );

      controls.update();

      const waveSpeed = time * 25;
      for (let i = 1; i < segmentCount; i++) {
        segments[i].rotation.y = Math.sin(waveSpeed - i * 0.5) * (0.07 + i * 0.03);
      }

      renderer.render(scene, camera);
    }
    animate();

    // 6. Container-Resize über ResizeObserver (reagiert auch auf Sidebar-Toggle!)
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // 7. Cleanup beim Verlassen der Subsite
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      controls.dispose();
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
          textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Unterwasser-Spirale</h2>
        <p style={{ margin: "4px 0 0", fontSize: "0.85rem", opacity: 0.9 }}>
          Bewege die Maus mit gedrückter Taste, um die Kamera zu drehen
        </p>
      </div>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}