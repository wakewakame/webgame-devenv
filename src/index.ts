import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";
import { PhysicsMeshes } from "./physicsMesh";

window.addEventListener("DOMContentLoaded", () => { init(); });

const init = async () => {
  // THREE
  const renderer = new THREE.WebGLRenderer();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 1000);

  // RAPIER
  await RAPIER.init();
  const world = new RAPIER.World({ x: 0.0, y: -9.81 * 2, z: 0.0 });

  // DOM
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

  // Camera Controll
  let mousedrag = false;
  let distance = 30.0, x_rad = 0.0, y_rad = 0.0;
  const updateCam = () => {
    camera.position.x = (distance * (1 / 3)) * Math.sin(y_rad) * Math.cos(x_rad);
    camera.position.z = (distance * (1 / 3)) * Math.sin(y_rad) * Math.sin(x_rad);
    camera.position.y = (distance * (1 / 3)) * Math.cos(y_rad);
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

  // Physics
  const physicsMeshes = new PhysicsMeshes(scene, world);

  // initialize scene
  //const hemiLight = new THREE.HemisphereLight();
  //hemiLight.intensity = 0.35;
  //scene.add(hemiLight);
  //const dirLight = new THREE.DirectionalLight();
  //dirLight.position.set(5, 5, 5);
  //dirLight.castShadow = true;
  //dirLight.shadow.camera.zoom = 2;
  //scene.add(dirLight);
  physicsMeshes.addCube(10, 0.1, 10, 'fixed');
  physicsMeshes.addCube(0.1, 100, 10, 'fixed').setPosition(5, 50, 0);
  physicsMeshes.addCube(0.1, 100, 10, 'fixed').setPosition(-5, 50, 0);
  physicsMeshes.addCube(10, 100, 0.1, 'fixed').setPosition(0, 50, 5);
  physicsMeshes.addCube(10, 100, 0.1, 'fixed').setPosition(0, 50, -5);
  const cube = physicsMeshes.addCube(1, 1, 1, 'dynamic').setPosition(0, 1.5, 0);

  let floatForce = false;
  let floatForceNum = 0.0;
  document.addEventListener("keydown", e => {
    if (e.key === " ") { floatForce = true; }
  });
  document.addEventListener("keyup", e => {
    if (e.key === " ") { floatForce = false; }
  });

  // main loop
  const animate = () => {
    cube.rigidBody.resetForces(true);
    if (floatForce) floatForceNum += (9.81 * 3 - floatForceNum) * 0.1;
    else floatForceNum *= 0.95;
    cube.rigidBody.addForce(new RAPIER.Vector3(0, floatForceNum, 0), true);
    physicsMeshes.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();
};

