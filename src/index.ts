import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";

window.addEventListener("DOMContentLoaded", () => { init(); });

const init = async () => {

  // three.js init

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

  camera.position.z = 30;

  // rapier init

  await RAPIER.init();
  const world = new RAPIER.World({x: 0.0, y: -9.81, z: 0.0});

  const groundColliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.1, 10.0).setRotation(new RAPIER.Quaternion(0, 0, 0.99**0.5, 0.01**0.5));
  world.createCollider(groundColliderDesc);

  const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(0.0, 10.0, 0.0);
  const rigidBody = world.createRigidBody(rigidBodyDesc);

  //const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
  const colliderDesc = RAPIER.ColliderDesc.capsule(2, 1);
  world.createCollider(colliderDesc, rigidBody);

  // loop

  const animate = () => {
    // rapier loop

    world.step();
    const position = rigidBody.translation();
    const rotation = rigidBody.rotation();

    // three.js loop

    requestAnimationFrame(animate);
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;
    mesh.quaternion.x = rotation.x;
    mesh.quaternion.y = rotation.y;
    mesh.quaternion.z = rotation.z;
    mesh.quaternion.w = rotation.w;
    renderer.render(scene, camera);
  };
  animate();
};

