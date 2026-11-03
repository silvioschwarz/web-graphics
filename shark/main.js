import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Szene, Kamera & Renderer Setup (Hellerer Hintergrund und weniger Nebel)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a3c5c); // Helles, klares Blau statt Tiefsee-Schwarz
scene.fog = new THREE.FogExp2(0x0a3c5c, 0.015); // Nebeldichte von 0.025 auf 0.015 reduziert für mehr Weitsicht

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 15, 35);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 2. Lichtquellen für deutlich mehr Helligkeit und karibischen Vibe
// Das Grundlicht (Ambient) leuchtet nun den ganzen Hai hell und bläulich aus
const ambientLight = new THREE.AmbientLight(0x206fa1, 3.5);
scene.add(ambientLight);

// Das Sonnenlicht (Directional) kommt von oben und wirft ein starkes, helles Cyan-Licht auf den Rücken
const sunLight = new THREE.DirectionalLight(0x7ae5ff, 4.5);
sunLight.position.set(10, 50, 10);
scene.add(sunLight);

// 3. Den Hai prozedural aus Segmenten bauen (für flüssige Biege-Animationen)
const sharkGroup = new THREE.Group();
scene.add(sharkGroup);

// Materialien definieren
const sharkMaterial = new THREE.MeshStandardMaterial({
  color: 0x435467,
  roughness: 0.4,
  metalness: 0.1,
  flatShading: false, // Sanfte Rundungen
});
const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x050505 });

// Wir bauen den Körper aus Segmenten (Wirbeln), damit wir ihn per Sinuswelle biegen können
const segmentCount = 8;
const segments = [];
const segmentGroup = new THREE.Group(); // Hält die Kette der Segmente
sharkGroup.add(segmentGroup);

let previousSegment = segmentGroup;

for (let i = 0; i < segmentCount; i++) {
  const currentSegGroup = new THREE.Group();

  // Berechne die Dicke des Hais an dieser Stelle (Vom Kopf bis zur Schwanzspitze)
  let radius = 1.6 * Math.sin(((i + 1) / (segmentCount + 1)) * Math.PI);
  if (i === 0) radius = 1.2; // Kopf etwas schmaler schnitzen

  const segGeo = new THREE.CylinderGeometry(radius * 0.8, radius, 1.8, 16);
  segGeo.rotateX(Math.PI / 2); // In Schwimmrichtung ausrichten

  const mesh = new THREE.Mesh(segGeo, sharkMaterial);
  currentSegGroup.add(mesh);

  // Glieder aneinander hängen (Abstand auf der Z-Achse nach hinten)
  currentSegGroup.position.z = i === 0 ? 0 : -1.5;
  previousSegment.add(currentSegGroup);

  segments.push(currentSegGroup);
  previousSegment = currentSegGroup;
}

// --- Details an den Segmenten anbringen (Flossen, Augen) ---

// Augen am Kopf (Segment 0)
const eyeGeo = new THREE.SphereGeometry(0.18, 8, 8);
const leftEye = new THREE.Mesh(eyeGeo, eyeMaterial);
leftEye.position.set(0.6, 0.4, 0.5);
const rightEye = new THREE.Mesh(eyeGeo, eyeMaterial);
rightEye.position.set(-0.6, 0.4, 0.5);
segments[0].add(leftEye, rightEye);

// Große Rückenflosse (Segment 2)
const dorsalGeo = new THREE.ConeGeometry(0.3, 3.2, 4);
dorsalGeo.rotateX(Math.PI / 3); // Leicht nach hinten neigen
const dorsalFin = new THREE.Mesh(dorsalGeo, sharkMaterial);
dorsalFin.position.set(0, 1.8, 0);
segments[2].add(dorsalFin);

// Brustflossen links und rechts (Segment 1 für athletische Optik)
const pectoralGeo = new THREE.ConeGeometry(0.25, 4.0, 4);

const leftPectoral = new THREE.Mesh(pectoralGeo, sharkMaterial);
leftPectoral.position.set(1.8, -0.2, 0);
leftPectoral.rotation.z = Math.PI / 2.5;
leftPectoral.rotation.y = -Math.PI / 6;

const rightPectoral = new THREE.Mesh(pectoralGeo, sharkMaterial);
rightPectoral.position.set(-1.8, -0.2, 0);
rightPectoral.rotation.z = -Math.PI / 2.5;
rightPectoral.rotation.y = Math.PI / 6;

segments[1].add(leftPectoral, rightPectoral);

// Die große Schwanzflosse am allerletzten Segment befestigen
const tailFinShape = new THREE.ConeGeometry(0.15, 3.5, 4);
const tailFin = new THREE.Mesh(tailFinShape, sharkMaterial);
tailFin.position.set(0, 0, -1.5);
tailFin.scale.set(1, 2.5, 0.8); // Vertikal strecken
segments[segmentCount - 1].add(tailFin);

// 4. Variablen für den mathematischen Spiral-Pfad
let time = 0;
const swimSpeed = 0.7;
const startRadius = 22; // Äußerer Kreis oben
const narrowness = 0.15; // Verengungsgrad der Spirale
const sinkSpeed = 0.5; // Wie schnell er nach unten sinkt
const minY = -20;

// Maus-Kamerasteuerung
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let cameraAngle = 0;

document.addEventListener("mousedown", () => (isDragging = true));
document.addEventListener("mouseup", () => (isDragging = false));
document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const deltaMove = e.offsetX - previousMousePosition.x;
    cameraAngle += deltaMove * 0.005;
    camera.position.x = Math.sin(cameraAngle) * 35;
    camera.position.z = Math.cos(cameraAngle) * 35;
  }
  previousMousePosition = { x: e.offsetX, y: e.offsetY };
  camera.lookAt(0, sharkGroup.position.y - 2, 0);
});

// --- ORBIT CONTROLS IMPLEMENTIERUNG ---
// Erstelle die Controls und übergib Kamera und das Canvas-Element
const controls = new OrbitControls(camera, renderer.domElement);

// Optionale, aber sehr empfohlene Einstellungen für Mobile & Desktop:
controls.enableDamping = true;   // Aktiviert sanftes Nachfedern (Trägheit) für edlere Bewegungen
controls.dampingFactor = 0.05;   // Wie schnell das Nachfedern abbremst
controls.maxPolarAngle = Math.PI / 2; // Verhindert, dass die Kamera unter den "Boden" wandert


// 5. Render- und Animationsschleife
function animate() {
  requestAnimationFrame(animate);

  time += 0.015 * swimSpeed;

  // --- SPIRAL-BERECHNUNG ---
  let currentRadius = startRadius - time * narrowness;

  // Unendlicher Loop: Reset nach oben, wenn die Spirale im Auge endet
  if (currentRadius < 1.8 || sharkGroup.position.y < minY) {
    time = 0;
    currentRadius = startRadius;
  }

  const nextX = Math.cos(time) * currentRadius;
  const nextZ = Math.sin(time) * currentRadius;
  const nextY = 12 - time * sinkSpeed;

  const currentPos = sharkGroup.position.clone();
  sharkGroup.position.set(nextX, nextY, nextZ);

  // Hai flüssig in die Kurven-Schwimmrichtung neigen
  sharkGroup.lookAt(
    nextX + (nextX - currentPos.x),
    nextY + (nextY - currentPos.y),
    nextZ + (nextZ - currentPos.z),
  );

      controls.update();

  // --- PROZEDURALE SCHWIMMBEWEGUNG (Sinuswelle) ---
  // Jedes Körpersegment rotiert leicht verzögert zum vorherigen.
  // Das erzeugt eine perfekte, durchgehende Wellenbewegung durch das mathematische Skelett.
  const waveSpeed = time * 25;
  for (let i = 1; i < segmentCount; i++) {
    // Je weiter hinten das Segment, desto stärker schlägt es aus
    segments[i].rotation.y = Math.sin(waveSpeed - i * 0.5) * (0.07 + i * 0.03);
  }

  renderer.render(scene, camera);
}

// 1. Die universelle Debounce-Funktion
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        // Falls ein Timer läuft, lösche ihn
        clearTimeout(timeoutId);
        // Starte einen neuen Timer
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// 2. Deine Three.js Resize-Logik
const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    console.log("Resize ausgeführt!"); // Zum Testen in der Konsole
};

// 3. Den Listener mit 100ms Verzögerung registrieren
// Der Code wird erst ausgeführt, wenn 100ms lang kein neues Resize-Event kam.
window.addEventListener('resize', debounce(handleResize, 100));

animate();
