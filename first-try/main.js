import * as THREE from 'three';

// Create a scene, camera, and renderer

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Create a cube geometry and material, then combine them into a mesh
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

// Position the camera

camera.position.z = 5;

// Create an animation loop to render the scene

function animate( time ) {
    cube.rotation.x = time / 2000;
    cube.rotation.y = time / 500;

  renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );