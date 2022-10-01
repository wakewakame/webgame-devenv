import * as THREE from "three";

window.addEventListener("DOMContentLoaded", () => { init(); });

const init = () => {
  const renderer = new THREE.WebGLRenderer();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 1000);

  const container = document.getElementById("container") as HTMLDivElement;
  container.appendChild(renderer.domElement);
  const resizeWindow = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", () => { resizeWindow(); });
  resizeWindow();

  scene.background = new THREE.Color( 0x666666 );

  const hemiLight = new THREE.HemisphereLight();
	hemiLight.intensity = 0.35;
	scene.add( hemiLight );

	const dirLight = new THREE.DirectionalLight();
	dirLight.position.set( 5, 5, 5 );
	dirLight.castShadow = true;
	dirLight.shadow.camera.zoom = 2;
	scene.add( dirLight );

  const geometry = new THREE.CapsuleGeometry(1, 2, 4, 16);
  const material = new THREE.MeshLambertMaterial({ color: 0x6699ff, wireframe: true });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  camera.position.z = 5;

  const animate = () => {
    requestAnimationFrame(animate);
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;
    renderer.render(scene, camera);
  };
  animate();
};

