import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";

class PhysicsMesh {
  mesh     : THREE.Mesh;
  rigidBody: RAPIER.RigidBody;
  collider : RAPIER.Collider;
  constructor(mesh: THREE.Mesh, rigidBody: RAPIER.RigidBody, collider: RAPIER.Collider) {
    this.mesh = mesh;
    this.rigidBody = rigidBody;
    this.collider = collider;
  }
  setPosition(x: number, y: number, z: number) {
    this.rigidBody.setTranslation(new RAPIER.Vector3(x, y, z), true);
    return this;
  }
}

type ObjType = 'fixed' | 'dynamic' | 'kinematicVelocityBased' | 'kinematicPositionBased';
class PhysicsMeshes {
  private scene: THREE.Scene;
  private world: RAPIER.World;
  private physicsMeshes: PhysicsMesh[];

  constructor(scene: THREE.Scene, rapier: RAPIER.World) {
    this.scene = scene;
    this.world = rapier;
    this.physicsMeshes = [];
  }

  addCube(x: number, y: number, z: number, objType: ObjType, material?: THREE.Material): PhysicsMesh {
    // THREE
    material = material ?? new THREE.MeshBasicMaterial({ color: 0x6699ff, wireframe: true });
    const geometry = new THREE.BoxGeometry(x, y, z);
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);

    // RAPIER
    const rigidBodyDesc = {
      'fixed'                 : () => RAPIER.RigidBodyDesc.fixed(),
      'dynamic'               : () => RAPIER.RigidBodyDesc.dynamic(),
      'kinematicVelocityBased': () => RAPIER.RigidBodyDesc.kinematicVelocityBased(),
      'kinematicPositionBased': () => RAPIER.RigidBodyDesc.kinematicPositionBased(),
    }[objType]();
    const rigidBody = this.world.createRigidBody(rigidBodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.cuboid(x * 0.5, y * 0.5, z * 0.5);
    const collider = this.world.createCollider(colliderDesc, rigidBody);

    const physicsMesh = new PhysicsMesh(mesh, rigidBody, collider);
    this.physicsMeshes.push(physicsMesh);

    return physicsMesh;
  }

  removeMesh(physicsMesh: PhysicsMesh) {
    this.removeMeshes([physicsMesh]);
  }
  removeMeshes(physicsMeshes: PhysicsMesh[]) {
    physicsMeshes.map(physicsMesh => {
      this.physicsMeshes = this.physicsMeshes.filter(obj => (obj === physicsMesh));
      this.scene.remove(physicsMesh.mesh);
      this.world.removeRigidBody(physicsMesh.rigidBody);
      this.world.removeCollider(physicsMesh.collider, false);
    });
  }

  update() {
    this.world.step();
    this.physicsMeshes.map(physicsMesh => {
      const position = physicsMesh.rigidBody.translation();
      const rotation = physicsMesh.rigidBody.rotation();
      physicsMesh.mesh.position.x = position.x;
      physicsMesh.mesh.position.y = position.y;
      physicsMesh.mesh.position.z = position.z;
      physicsMesh.mesh.quaternion.x = rotation.x;
      physicsMesh.mesh.quaternion.y = rotation.y;
      physicsMesh.mesh.quaternion.z = rotation.z;
      physicsMesh.mesh.quaternion.w = rotation.w;
    });
  }
}

export {
  PhysicsMesh,
  PhysicsMeshes,
};

