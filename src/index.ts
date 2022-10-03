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

  // Camera Controll

  let mousedrag = false;
  let distance = 30.0, x_rad = 0.0, y_rad = 0.0;
  const updateCam = () => {
    camera.position.x = (distance * (1/3)) * Math.sin(y_rad) * Math.cos(x_rad);
    camera.position.z = (distance * (1/3)) * Math.sin(y_rad) * Math.sin(x_rad);
    camera.position.y = (distance * (1/3)) * Math.cos(y_rad);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  };
  updateCam();
  container.addEventListener("mouseup", () => { mousedrag = false; });
  container.addEventListener("mousedown", () => { mousedrag = true; });
  container.addEventListener("mousemove", e => {
    if (mousedrag) {
      x_rad += e.movementX * 0.01;
      y_rad += e.movementY * 0.01;
      updateCam();
    }
  });
  container.addEventListener("wheel", e => {
    distance *= 1 + e.deltaY * 0.001;
    updateCam();
  });

  let initRotate = [3, 0, 4, 0.1]; const initRotateLen = initRotate.map(x => x*x).reduce((a, b) => (a + b)) ** 0.5;
  initRotate = initRotate.map(x => x / initRotateLen);
  const rapierRotate = new RAPIER.Quaternion(initRotate[0], initRotate[1], initRotate[2], initRotate[3]);
  const threeRotate  = new  THREE.Quaternion(initRotate[0], initRotate[1], initRotate[2], initRotate[3]);

  {
  const geometry = new THREE.BoxGeometry(10.0, 0.1, 10.0);
  geometry.applyQuaternion(threeRotate);
  const material = new THREE.MeshLambertMaterial({ color: 0x6699ff });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  }

  const geometry = new THREE.CapsuleGeometry(1, 2, 4, 16);
  const material = new THREE.MeshLambertMaterial({ color: 0x6699ff, wireframe: true });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // rapier init

  await RAPIER.init();
  const world = new RAPIER.World({x: 0.0, y: -9.81, z: 0.0});

  const groundColliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.1, 10.0).setRotation(rapierRotate);
  world.createCollider(groundColliderDesc);

  const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(0.0, 10.0, 0.0);
  const rigidBody = world.createRigidBody(rigidBodyDesc);

  const colliderDesc = RAPIER.ColliderDesc.capsule(1, 1);
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

