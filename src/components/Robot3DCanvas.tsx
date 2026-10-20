import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import confetti from 'canvas-confetti';
import { JointAngles, StabilityTelemetry, DEFAULT_JOINTS } from '../types/robot';
import { calculateRobotKinematics, getLegRollCollisionLimit } from '../utils/kinematics';
import { soundManager } from '../utils/audio';

interface Robot3DCanvasProps {
  jointAngles: JointAngles;
  eyeColor?: string;
  physicsMode: boolean;
  showCoM: boolean;
  showSupportPoly: boolean;
  showAxes: boolean;
  wireframe: boolean;
  onTelemetryUpdate: (telemetry: StabilityTelemetry) => void;
  onRobotFell?: () => void;
  resetTrigger?: number;
  isSoccerMission?: boolean;
  onBallScored?: () => void;
  ballScored?: boolean;
}

export const Robot3DCanvas: React.FC<Robot3DCanvasProps> = ({
  jointAngles,
  eyeColor = '#00e5ff',
  physicsMode,
  showCoM,
  showSupportPoly,
  showAxes,
  wireframe,
  onTelemetryUpdate,
  onRobotFell,
  resetTrigger,
  isSoccerMission = false,
  onBallScored,
  ballScored = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const anglesRef = useRef<JointAngles>(jointAngles);
  const physicsModeRef = useRef(physicsMode);
  const eyeColorRef = useRef(eyeColor);
  const isSoccerMissionRef = useRef(isSoccerMission);
  const onBallScoredRef = useRef(onBallScored);

  anglesRef.current = jointAngles;
  physicsModeRef.current = physicsMode;
  eyeColorRef.current = eyeColor;
  isSoccerMissionRef.current = isSoccerMission;
  onBallScoredRef.current = onBallScored;

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // RoboCup Soccer Elements
  const soccerGroupRef = useRef<THREE.Group | null>(null);
  const ballMeshRef = useRef<THREE.Mesh | null>(null);
  const ballShadowRef = useRef<THREE.Mesh | null>(null);
  const ballStateRef = useRef({
    pos: new THREE.Vector3(-0.24, 0.155, 0.92),
    vel: new THREE.Vector3(0, 0, 0),
    isKicked: false,
    hasScored: false,
  });

  // Robot hierarchy joint nodes
  const robotRootRef = useRef<THREE.Group | null>(null);
  const headJointRef = useRef<THREE.Group | null>(null);
  const eyeMeshRef = useRef<THREE.Mesh | null>(null);
  const chestCoreMeshRef = useRef<THREE.Mesh | null>(null);

  // Left arm
  const lShoulderPitchRef = useRef<THREE.Group | null>(null);
  const lShoulderRollRef = useRef<THREE.Group | null>(null);
  const lElbowPitchRef = useRef<THREE.Group | null>(null);

  // Right arm
  const rShoulderPitchRef = useRef<THREE.Group | null>(null);
  const rShoulderRollRef = useRef<THREE.Group | null>(null);
  const rElbowPitchRef = useRef<THREE.Group | null>(null);

  // Left leg
  const lHipRollRef = useRef<THREE.Group | null>(null);
  const lHipPitchRef = useRef<THREE.Group | null>(null);
  const lKneePitchRef = useRef<THREE.Group | null>(null);
  const lAnklePitchRef = useRef<THREE.Group | null>(null);
  const lAnkleRollRef = useRef<THREE.Group | null>(null);

  // Right leg
  const rHipRollRef = useRef<THREE.Group | null>(null);
  const rHipPitchRef = useRef<THREE.Group | null>(null);
  const rKneePitchRef = useRef<THREE.Group | null>(null);
  const rAnklePitchRef = useRef<THREE.Group | null>(null);
  const rAnkleRollRef = useRef<THREE.Group | null>(null);

  // Physics & Gizmos
  const comMarkerRef = useRef<THREE.Mesh | null>(null);
  const comPlumbLineRef = useRef<THREE.Line | null>(null);
  const comGroundReticleRef = useRef<THREE.Mesh | null>(null);
  const supportPolyLineRef = useRef<THREE.LineLoop | null>(null);

  // Physical simulation dynamic state
  const physicsStateRef = useRef({
    posX: 0,
    posY: 1.43,
    posZ: 0,
    rotX: 0,
    rotZ: 0,
    rotY: 0,
    velX: 0,
    velY: 0,
    velZ: 0,
    angVelX: 0,
    angVelY: 0,
    angVelZ: 0,
    isFallen: false,
  });
  const physicsGraceRef = useRef<number>(0);
  const kickAirTimeRef = useRef<number>(0);

  const degToRad = (deg: number) => (deg * Math.PI) / 180;

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.025);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 4.2);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 0.95, 0);
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // don't go below floor
    controls.minDistance = 1.5;
    controls.maxDistance = 12;
    controlsRef.current = controls;

    // Lighting (Bright, high-clarity studio lighting for students)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.6);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.3);
    keyLight.position.set(5, 9, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.bias = -0.0005;
    const d = 4;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.9);
    rimLight.position.set(-6, 5, -5);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffedd5, 0.5);
    fillLight.position.set(0, 1, 5);
    scene.add(fillLight);

    // Floor Arena with Clean Slate Grid
    const floorGeo = new THREE.PlaneGeometry(32, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.15,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid helper with crisp cyan & slate lines
    const grid = new THREE.GridHelper(20, 40, 0x38bdf8, 0x334155);
    grid.position.y = 0.002;
    scene.add(grid);
    scene.add(grid);

    // Target circular arena ring
    const ringGeo = new THREE.RingGeometry(1.4, 1.45, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.004;
    scene.add(ring);

    // Build Robosen K1 Robot 3D Mesh Hierarchy
    buildRobosenK1(scene);

    // Create CoM Marker and Support Polygon lines
    buildGizmos(scene);

    // Build 3D RoboCup Soccer Pitch & Goal
    buildSoccerField(scene);

    // Animation render loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);

      // Update Controls
      controls.update();

      // Update Robot Joints
      updateRobotJoints();

      // Update Physics & Balance
      updatePhysics(delta);

      // Update Soccer Ball Physics & Goal Collision
      updateSoccerPhysics(delta);

      // Update Visual Gizmos
      updateGizmos();

      // Pulsing chest reactor light
      if (chestCoreMeshRef.current) {
        const pulse = 0.85 + Math.sin(clock.getElapsedTime() * 3.5) * 0.25;
        (chestCoreMeshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Update Eye LED Color dynamically
  useEffect(() => {
    if (eyeMeshRef.current) {
      const mat = eyeMeshRef.current.material as THREE.MeshStandardMaterial;
      const color = new THREE.Color(eyeColor);
      mat.color = color;
      mat.emissive = color;
    }
  }, [eyeColor]);

  // Wireframe Mode toggle
  useEffect(() => {
    if (!robotRootRef.current) return;
    robotRootRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (m) {
          m.wireframe = wireframe;
        }
      }
    });
  }, [wireframe]);

  // Helper to construct Robosen K1 Model with high-visibility Yellow and White armor
  const buildRobosenK1 = (scene: THREE.Scene) => {
    // Materials
    const yellowArmorMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Bright Bumblebee Yellow (clear contrast against background)
      roughness: 0.35,
      metalness: 0.25,
    });

    const whiteArmorMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Clean aerospace white armor plates
      roughness: 0.25,
      metalness: 0.3,
    });

    const jointMetalMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Clearly visible medium metallic slate alloy
      roughness: 0.25,
      metalness: 0.85,
    });

    const accentOrangeMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // Orange power accent
      roughness: 0.35,
      metalness: 0.3,
    });

    const eyeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(eyeColorRef.current),
      emissive: new THREE.Color(eyeColorRef.current),
      emissiveIntensity: 1.8,
      roughness: 0.1,
    });

    const chestCoreMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    });

    // Root Group: Pelvis Center
    const root = new THREE.Group();
    root.position.set(0, 1.43, 0);
    scene.add(root);
    robotRootRef.current = root;

    // Pelvis Mesh
    const pelvisGeo = new THREE.BoxGeometry(0.55, 0.3, 0.36);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, yellowArmorMat);
    pelvisMesh.castShadow = true;
    pelvisMesh.receiveShadow = true;
    root.add(pelvisMesh);

    // Pelvis front armor buckle
    const buckleGeo = new THREE.BoxGeometry(0.22, 0.22, 0.08);
    const buckleMesh = new THREE.Mesh(buckleGeo, accentOrangeMat);
    buckleMesh.position.set(0, 0, 0.19);
    pelvisMesh.add(buckleMesh);

    // Torso Segment
    const torso = new THREE.Group();
    torso.position.set(0, 0.18, 0);
    root.add(torso);

    // Lower Torso
    const lowerTorsoGeo = new THREE.BoxGeometry(0.52, 0.32, 0.35);
    const lowerTorsoMesh = new THREE.Mesh(lowerTorsoGeo, yellowArmorMat);
    lowerTorsoMesh.position.y = 0.16;
    lowerTorsoMesh.castShadow = true;
    torso.add(lowerTorsoMesh);

    // Upper Chest (Tapered Robosen armor)
    const upperTorsoGeo = new THREE.BoxGeometry(0.68, 0.45, 0.42);
    const upperTorsoMesh = new THREE.Mesh(upperTorsoGeo, whiteArmorMat);
    upperTorsoMesh.position.y = 0.52;
    upperTorsoMesh.castShadow = true;
    torso.add(upperTorsoMesh);

    // Chest Reactor Core (Hexagon / Cylinder)
    const reactorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 6);
    reactorGeo.rotateX(Math.PI / 2);
    const reactorMesh = new THREE.Mesh(reactorGeo, chestCoreMat);
    reactorMesh.position.set(0, 0.52, 0.22);
    torso.add(reactorMesh);
    chestCoreMeshRef.current = reactorMesh;

    // Torso Side Armor Plates
    const plateLGeo = new THREE.BoxGeometry(0.12, 0.38, 0.44);
    const plateL = new THREE.Mesh(plateLGeo, yellowArmorMat);
    plateL.position.set(0.36, 0.52, 0);
    torso.add(plateL);

    const plateR = plateL.clone();
    plateR.position.set(-0.36, 0.52, 0);
    torso.add(plateR);

    // Head Joint (Yaw DOF: 1)
    const headJoint = new THREE.Group();
    headJoint.position.set(0, 0.8, 0);
    torso.add(headJoint);
    headJointRef.current = headJoint;

    // Neck ring
    const neckGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.1, 16);
    const neckMesh = new THREE.Mesh(neckGeo, jointMetalMat);
    neckMesh.position.y = 0.05;
    headJoint.add(neckMesh);

    // Head Helmet
    const headHelmetGeo = new THREE.BoxGeometry(0.34, 0.34, 0.36);
    const headHelmet = new THREE.Mesh(headHelmetGeo, yellowArmorMat);
    headHelmet.position.y = 0.22;
    headHelmet.castShadow = true;
    headJoint.add(headHelmet);

    // Helmet Crest (Top fin)
    const crestGeo = new THREE.BoxGeometry(0.08, 0.12, 0.38);
    const crest = new THREE.Mesh(crestGeo, whiteArmorMat);
    crest.position.set(0, 0.42, 0);
    headJoint.add(crest);

    // Glowing Optical Visor (Eye LED)
    const visorGeo = new THREE.BoxGeometry(0.26, 0.08, 0.06);
    const visor = new THREE.Mesh(visorGeo, eyeMat);
    visor.position.set(0, 0.23, 0.19);
    headJoint.add(visor);
    eyeMeshRef.current = visor;

    // Head antenna ears
    const earLGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8);
    earLGeo.rotateZ(Math.PI / 2);
    const earL = new THREE.Mesh(earLGeo, accentOrangeMat);
    earL.position.set(0.19, 0.24, 0);
    headJoint.add(earL);

    const earR = earL.clone();
    earR.position.set(-0.19, 0.24, 0);
    headJoint.add(earR);

    // ==========================================
    // LEFT ARM (Shoulder Pitch, Shoulder Roll, Elbow Pitch)
    // ==========================================
    const lShoulderOrigin = new THREE.Group();
    lShoulderOrigin.position.set(0.44, 0.62, 0);
    torso.add(lShoulderOrigin);

    // Shoulder Pitch DOF
    const lShoulderPitch = new THREE.Group();
    lShoulderOrigin.add(lShoulderPitch);
    lShoulderPitchRef.current = lShoulderPitch;

    // Shoulder Pauldron (Armor guard)
    const pauldronGeo = new THREE.BoxGeometry(0.24, 0.22, 0.28);
    const pauldron = new THREE.Mesh(pauldronGeo, whiteArmorMat);
    pauldron.position.set(0.08, 0, 0);
    pauldron.castShadow = true;
    lShoulderPitch.add(pauldron);

    // Shoulder Roll DOF
    const lShoulderRoll = new THREE.Group();
    lShoulderRoll.position.set(0.12, 0, 0);
    lShoulderPitch.add(lShoulderRoll);
    lShoulderRollRef.current = lShoulderRoll;

    // Left Upper Arm (Bicep)
    const upperArmGeo = new THREE.BoxGeometry(0.18, 0.36, 0.2);
    const upperArmL = new THREE.Mesh(upperArmGeo, yellowArmorMat);
    upperArmL.position.set(0, -0.22, 0);
    upperArmL.castShadow = true;
    lShoulderRoll.add(upperArmL);

    // Left Elbow Pitch DOF
    const lElbowPitch = new THREE.Group();
    lElbowPitch.position.set(0, -0.42, 0);
    lShoulderRoll.add(lElbowPitch);
    lElbowPitchRef.current = lElbowPitch;

    // Elbow Joint Disc
    const elbowDiscGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16);
    elbowDiscGeo.rotateZ(Math.PI / 2);
    const elbowDiscL = new THREE.Mesh(elbowDiscGeo, jointMetalMat);
    lElbowPitch.add(elbowDiscL);

    // Left Forearm
    const forearmGeo = new THREE.BoxGeometry(0.2, 0.4, 0.22);
    const forearmL = new THREE.Mesh(forearmGeo, whiteArmorMat);
    forearmL.position.set(0, -0.22, 0.02);
    forearmL.castShadow = true;
    lElbowPitch.add(forearmL);

    // Left Hand (Scout Gripper)
    const handGeo = new THREE.BoxGeometry(0.14, 0.16, 0.16);
    const handL = new THREE.Mesh(handGeo, jointMetalMat);
    handL.position.set(0, -0.46, 0.02);
    lElbowPitch.add(handL);

    // ==========================================
    // RIGHT ARM (Shoulder Pitch, Shoulder Roll, Elbow Pitch)
    // ==========================================
    const rShoulderOrigin = new THREE.Group();
    rShoulderOrigin.position.set(-0.44, 0.62, 0);
    torso.add(rShoulderOrigin);

    const rShoulderPitch = new THREE.Group();
    rShoulderOrigin.add(rShoulderPitch);
    rShoulderPitchRef.current = rShoulderPitch;

    const rPauldron = pauldron.clone();
    rPauldron.position.set(-0.08, 0, 0);
    rShoulderPitch.add(rPauldron);

    const rShoulderRoll = new THREE.Group();
    rShoulderRoll.position.set(-0.12, 0, 0);
    rShoulderPitch.add(rShoulderRoll);
    rShoulderRollRef.current = rShoulderRoll;

    const upperArmR = upperArmL.clone();
    rShoulderRoll.add(upperArmR);

    const rElbowPitch = new THREE.Group();
    rElbowPitch.position.set(0, -0.42, 0);
    rShoulderRoll.add(rElbowPitch);
    rElbowPitchRef.current = rElbowPitch;

    const elbowDiscR = elbowDiscL.clone();
    rElbowPitch.add(elbowDiscR);

    const forearmR = forearmL.clone();
    rElbowPitch.add(forearmR);

    const handR = handL.clone();
    rElbowPitch.add(handR);

    // ==========================================
    // LEFT LEG (Hip Roll, Hip Pitch, Knee Pitch, Ankle Pitch, Ankle Roll)
    // ==========================================
    const lHipOrigin = new THREE.Group();
    lHipOrigin.position.set(0.24, -0.15, 0);
    root.add(lHipOrigin);

    // Hip Roll
    const lHipRoll = new THREE.Group();
    lHipOrigin.add(lHipRoll);
    lHipRollRef.current = lHipRoll;

    // Hip Joint Disc
    const hipJointGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.14, 16);
    hipJointGeo.rotateX(Math.PI / 2);
    const hipJointMeshL = new THREE.Mesh(hipJointGeo, jointMetalMat);
    lHipRoll.add(hipJointMeshL);

    // Hip Pitch
    const lHipPitch = new THREE.Group();
    lHipRoll.add(lHipPitch);
    lHipPitchRef.current = lHipPitch;

    // Thigh
    const thighGeo = new THREE.BoxGeometry(0.26, 0.52, 0.28);
    const thighL = new THREE.Mesh(thighGeo, whiteArmorMat);
    thighL.position.set(0, -0.28, 0);
    thighL.castShadow = true;
    lHipPitch.add(thighL);

    // Knee Pitch
    const lKneePitch = new THREE.Group();
    lKneePitch.position.set(0, -0.56, 0);
    lHipPitch.add(lKneePitch);
    lKneePitchRef.current = lKneePitch;

    // Knee Armor Block
    const kneeCapGeo = new THREE.BoxGeometry(0.24, 0.2, 0.16);
    const kneeCapL = new THREE.Mesh(kneeCapGeo, yellowArmorMat);
    kneeCapL.position.set(0, 0, 0.12);
    lKneePitch.add(kneeCapL);

    // Shin (Lower leg)
    const shinGeo = new THREE.BoxGeometry(0.25, 0.56, 0.26);
    const shinL = new THREE.Mesh(shinGeo, yellowArmorMat);
    shinL.position.set(0, -0.3, 0);
    shinL.castShadow = true;
    lKneePitch.add(shinL);

    // Shin front armor plate
    const shinPlateGeo = new THREE.BoxGeometry(0.18, 0.44, 0.08);
    const shinPlateL = new THREE.Mesh(shinPlateGeo, whiteArmorMat);
    shinPlateL.position.set(0, -0.3, 0.14);
    lKneePitch.add(shinPlateL);

    // Ankle Pitch
    const lAnklePitch = new THREE.Group();
    lAnklePitch.position.set(0, -0.58, 0);
    lKneePitch.add(lAnklePitch);
    lAnklePitchRef.current = lAnklePitch;

    // Ankle Roll
    const lAnkleRoll = new THREE.Group();
    lAnklePitch.add(lAnkleRoll);
    lAnkleRollRef.current = lAnkleRoll;

    // Foot (Broad Robosen sole)
    const footGeo = new THREE.BoxGeometry(0.32, 0.12, 0.56);
    const footL = new THREE.Mesh(footGeo, yellowArmorMat);
    footL.position.set(0, -0.06, 0.08);
    footL.castShadow = true;
    footL.receiveShadow = true;
    lAnkleRoll.add(footL);

    // Foot sole rubber tread
    const soleGeo = new THREE.BoxGeometry(0.3, 0.04, 0.54);
    const soleL = new THREE.Mesh(soleGeo, jointMetalMat);
    soleL.position.set(0, -0.13, 0.08);
    lAnkleRoll.add(soleL);

    // ==========================================
    // RIGHT LEG (Hip Roll, Hip Pitch, Knee Pitch, Ankle Pitch, Ankle Roll)
    // ==========================================
    const rHipOrigin = new THREE.Group();
    rHipOrigin.position.set(-0.24, -0.15, 0);
    root.add(rHipOrigin);

    const rHipRoll = new THREE.Group();
    rHipOrigin.add(rHipRoll);
    rHipRollRef.current = rHipRoll;

    const hipJointMeshR = hipJointMeshL.clone();
    rHipRoll.add(hipJointMeshR);

    const rHipPitch = new THREE.Group();
    rHipRoll.add(rHipPitch);
    rHipPitchRef.current = rHipPitch;

    const thighR = thighL.clone();
    rHipPitch.add(thighR);

    const rKneePitch = new THREE.Group();
    rKneePitch.position.set(0, -0.56, 0);
    rHipPitch.add(rKneePitch);
    rKneePitchRef.current = rKneePitch;

    const kneeCapR = kneeCapL.clone();
    rKneePitch.add(kneeCapR);

    const shinR = shinL.clone();
    rKneePitch.add(shinR);

    const shinPlateR = shinPlateL.clone();
    rKneePitch.add(shinPlateR);

    const rAnklePitch = new THREE.Group();
    rAnklePitch.position.set(0, -0.58, 0);
    rKneePitch.add(rAnklePitch);
    rAnklePitchRef.current = rAnklePitch;

    const rAnkleRoll = new THREE.Group();
    rAnklePitch.add(rAnkleRoll);
    rAnkleRollRef.current = rAnkleRoll;

    const footR = footL.clone();
    rAnkleRoll.add(footR);

    const soleR = soleL.clone();
    rAnkleRoll.add(soleR);
  };

  // Build CoM marker and support polygon line
  const buildGizmos = (scene: THREE.Scene) => {
    // CoM Sphere (Yellow/Gold Glowing)
    const comGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const comMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: false });
    const comMesh = new THREE.Mesh(comGeo, comMat);
    scene.add(comMesh);
    comMarkerRef.current = comMesh;

    // CoM Vertical Plumb Line
    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 2, 0)]);
    const lineMat = new THREE.LineDashedMaterial({ color: 0xfacc15, dashSize: 0.1, gapSize: 0.05 });
    const line = new THREE.Line(lineGeo, lineMat);
    scene.add(line);
    comPlumbLineRef.current = line;

    // CoM Ground Projection Reticle
    const reticleGeo = new THREE.RingGeometry(0.06, 0.12, 16);
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    reticle.rotation.x = -Math.PI / 2;
    reticle.position.y = 0.006;
    scene.add(reticle);
    comGroundReticleRef.current = reticle;

    // Support Polygon line loop
    const polyGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0.5, 0.008, 0.3),
      new THREE.Vector3(-0.5, 0.008, 0.3),
      new THREE.Vector3(-0.5, 0.008, -0.3),
      new THREE.Vector3(0.5, 0.008, -0.3),
    ]);
    const polyMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });
    const polyLine = new THREE.LineLoop(polyGeo, polyMat);
    scene.add(polyLine);
    supportPolyLineRef.current = polyLine;
  };

  // Update physical kinematics and joint orientations
  const updateRobotJoints = () => {
    const a = anglesRef.current;

    // Head (Yaw)
    if (headJointRef.current) headJointRef.current.rotation.y = degToRad(a.head_yaw);

    // Left Arm
    if (lShoulderPitchRef.current) lShoulderPitchRef.current.rotation.x = degToRad(a.l_shoulder_pitch);
    if (lShoulderRollRef.current) lShoulderRollRef.current.rotation.z = degToRad(a.l_shoulder_roll);
    if (lElbowPitchRef.current) lElbowPitchRef.current.rotation.x = -degToRad(a.l_elbow_pitch);

    // Right Arm
    if (rShoulderPitchRef.current) rShoulderPitchRef.current.rotation.x = degToRad(a.r_shoulder_pitch);
    if (rShoulderRollRef.current) rShoulderRollRef.current.rotation.z = degToRad(a.r_shoulder_roll);
    if (rElbowPitchRef.current) rElbowPitchRef.current.rotation.x = -degToRad(a.r_elbow_pitch);

    // Legs with physical collision prevention
    let l_hr = a.l_hip_roll;
    let r_hr = a.r_hip_roll;

    const colCheck = getLegRollCollisionLimit(
      'l_hip_roll',
      l_hr,
      r_hr,
      a.l_hip_pitch,
      a.r_hip_pitch,
      a.l_knee_pitch,
      a.r_knee_pitch
    );
    if (colCheck.isColliding) {
      l_hr = colCheck.clampedAngle;
    }

    // Left Leg
    if (lHipRollRef.current) lHipRollRef.current.rotation.z = degToRad(l_hr);
    if (lHipPitchRef.current) lHipPitchRef.current.rotation.x = degToRad(a.l_hip_pitch);
    if (lKneePitchRef.current) lKneePitchRef.current.rotation.x = degToRad(a.l_knee_pitch);
    if (lAnklePitchRef.current) lAnklePitchRef.current.rotation.x = degToRad(a.l_ankle_pitch);
    if (lAnkleRollRef.current) lAnkleRollRef.current.rotation.z = degToRad(a.l_ankle_roll);

    // Right Leg
    if (rHipRollRef.current) rHipRollRef.current.rotation.z = degToRad(r_hr);
    if (rHipPitchRef.current) rHipPitchRef.current.rotation.x = degToRad(a.r_hip_pitch);
    if (rKneePitchRef.current) rKneePitchRef.current.rotation.x = degToRad(a.r_knee_pitch);
    if (rAnklePitchRef.current) rAnklePitchRef.current.rotation.x = degToRad(a.r_ankle_pitch);
    if (rAnkleRollRef.current) rAnkleRollRef.current.rotation.z = degToRad(a.r_ankle_roll);
  };

  // Handle immediate physics posture reset when user resets robot or loads mission
  useEffect(() => {
    if (resetTrigger === undefined) return;
    const p = physicsStateRef.current;
    p.posX = 0;
    p.posY = 1.43;
    p.posZ = 0;
    p.rotX = 0;
    p.rotY = 0;
    p.rotZ = 0;
    p.velX = 0;
    p.velY = 0;
    p.velZ = 0;
    p.angVelX = 0;
    p.angVelY = 0;
    p.angVelZ = 0;
    p.isFallen = false;
    kickAirTimeRef.current = 0;

    // Immediately snap angles ref and all 3D joint nodes to DEFAULT_JOINTS
    anglesRef.current = { ...DEFAULT_JOINTS };
    updateRobotJoints();

    if (robotRootRef.current) {
      robotRootRef.current.position.set(0, 1.43, 0);
      robotRootRef.current.rotation.set(0, 0, 0);
    }
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0.95, 0);
    }

    // Set 600ms grace period so gravity doesn't topple robot before state stabilizes
    physicsGraceRef.current = 0.6;

    // Force forward kinematics telemetry to stable standing
    const kin = calculateRobotKinematics(
      DEFAULT_JOINTS,
      { x: 0, y: 1.43, z: 0 },
      { pitch: 0, roll: 0, yaw: 0 }
    );
    onTelemetryUpdate(kin.telemetry);
  }, [resetTrigger, onTelemetryUpdate]);

  // Update real-time physics & balance dynamics
  const updatePhysics = (delta: number) => {
    const p = physicsStateRef.current;
    const robot = robotRootRef.current;
    if (!robot) return;

    // If in stability grace period following reset, enforce upright standing
    if (physicsGraceRef.current > 0) {
      physicsGraceRef.current -= delta;
      p.posX = 0;
      p.posY = 1.43;
      p.posZ = 0;
      p.rotX = 0;
      p.rotY = 0;
      p.rotZ = 0;
      p.velX = 0;
      p.velY = 0;
      p.velZ = 0;
      p.angVelX = 0;
      p.angVelY = 0;
      p.angVelZ = 0;
      p.isFallen = false;
      robot.position.set(0, 1.43, 0);
      robot.rotation.set(0, 0, 0);
      return;
    }

    // Run Forward Kinematics calculation
    const kin = calculateRobotKinematics(
      anglesRef.current,
      { x: p.posX, y: p.posY, z: p.posZ },
      { pitch: p.rotX, roll: p.rotZ, yaw: p.rotY }
    );

    // 1. Check if both feet are replanted flat on the ground in stable stance (Phase 4 recovery)
    const bothFeetPlanted =
      kin.telemetry.leftFootContact &&
      kin.telemetry.rightFootContact &&
      (anglesRef.current.r_hip_pitch ?? 0) >= -22 &&
      (anglesRef.current.l_hip_pitch ?? 0) >= -22;

    // 2. Kicking leg suspended in the air
    const isHoldingKickInAir =
      isSoccerMissionRef.current &&
      !kin.telemetry.rightFootContact &&
      (anglesRef.current.r_hip_pitch ?? 0) <= -26;

    if (bothFeetPlanted) {
      // Phase 4: Both feet are planted! Reset kick timer and fallen state, immediately restore upright stance
      kickAirTimeRef.current = 0;
      p.isFallen = false;
      p.angVelX = 0;
      p.angVelZ = 0;
      p.velY = 0;
    } else if (isHoldingKickInAir) {
      kickAirTimeRef.current += delta;
    } else {
      kickAirTimeRef.current = 0;
    }

    // Allow kick swing execution (~0.95s). Only topple if leg is held suspended in mid-air beyond the kick window!
    const isKickToppling = isHoldingKickInAir && kickAirTimeRef.current > 0.95;

    // Physical topple detection: excessive pitch/roll or sustained kick suspension without replanting
    const isPhysicallyToppled =
      Math.abs(p.rotX) > 0.45 ||
      Math.abs(p.rotZ) > 0.45 ||
      (isKickToppling && kickAirTimeRef.current > 1.35);

    if (isPhysicallyToppled && !p.isFallen && !bothFeetPlanted) {
      p.isFallen = true;
      soundManager.playWarning();
      if (onRobotFell) onRobotFell();
    }

    // Telemetry status update
    if (p.isFallen) {
      kin.telemetry.status = 'fallen';
      kin.telemetry.margin = -25.0;
    } else if (bothFeetPlanted) {
      kin.telemetry.status = 'stable';
    } else if (isHoldingKickInAir) {
      kin.telemetry.status = isKickToppling ? 'unstable' : 'dynamic';
    }

    // Report Telemetry to parent
    onTelemetryUpdate(kin.telemetry);

    if (physicsModeRef.current) {
      // Dynamic Yaw Twisting Physics (Newton's 3rd Law counter-balance)
      const yawTorque = kin.telemetry.yawTorque || 0;
      const isYawUnbalanced = Math.abs(yawTorque) > 3.0;
      const isCoMUnstable = kin.telemetry.margin <= 0 || kin.telemetry.status === 'fallen';

      if (Math.abs(yawTorque) > 2.0) {
        const targetYaw = THREE.MathUtils.clamp((yawTorque / 14.0) * 0.19, -0.20, 0.20);
        p.rotY = THREE.MathUtils.lerp(p.rotY, targetYaw, 6.0 * delta);
        p.angVelY = 0;
      } else {
        p.rotY = THREE.MathUtils.lerp(p.rotY, 0, 7.0 * delta);
        p.angVelY = 0;
      }
      p.rotY = THREE.MathUtils.clamp(p.rotY, -0.22, 0.22);

      if (bothFeetPlanted) {
        // Phase 4 recovery: smoothly and swiftly restore upright standing posture
        p.isFallen = false;
        p.rotX = THREE.MathUtils.lerp(p.rotX, 0, 8.0 * delta);
        p.rotZ = THREE.MathUtils.lerp(p.rotZ, 0, 8.0 * delta);
        p.angVelX = 0;
        p.angVelZ = 0;
        p.velY = 0;
      } else if (isCoMUnstable || isKickToppling) {
        // Apply tipping torque based on CoM displacement beyond support base
        const polyCenterX =
          kin.supportPolygon.length > 0
            ? kin.supportPolygon.reduce((acc, pt) => acc + pt.x, 0) / kin.supportPolygon.length
            : p.posX;
        const polyCenterZ =
          kin.supportPolygon.length > 0
            ? kin.supportPolygon.reduce((acc, pt) => acc + pt.z, 0) / kin.supportPolygon.length
            : p.posZ;

        // When holding kick leg suspended beyond the kick window, topple the robot forward-right
        const forwardTipForce = isKickToppling ? 18.0 : 0;
        const lateralTipForce = isKickToppling ? -12.0 : 0;
        p.angVelX += ((kin.comWorld.z - polyCenterZ) * 6.5 + forwardTipForce) * delta;
        p.angVelZ += (-(kin.comWorld.x - polyCenterX) * 6.5 + lateralTipForce) * delta;

        // Apply downward gravity acceleration
        p.velY -= 9.81 * delta;

        p.rotX += p.angVelX * delta;
        p.rotZ += p.angVelZ * delta;
        p.posY += p.velY * delta;

        // Clamp rotation so robot rests on floor
        p.rotX = THREE.MathUtils.clamp(p.rotX, -Math.PI / 2.05, Math.PI / 2.05);
        p.rotZ = THREE.MathUtils.clamp(p.rotZ, -Math.PI / 2.05, Math.PI / 2.05);
      } else if (isYawUnbalanced) {
        p.isFallen = false;
        const targetLeanZ = (yawTorque / 14.0) * -0.07;
        p.rotZ = THREE.MathUtils.lerp(p.rotZ, targetLeanZ, 5.0 * delta);
        p.rotX = THREE.MathUtils.lerp(p.rotX, 0, 5.0 * delta);
        p.angVelX = 0;
        p.angVelZ = 0;
        p.velY = 0;
      } else {
        // Robot is stable and balanced: smoothly restore posture towards upright
        p.isFallen = false;
        p.rotX = THREE.MathUtils.lerp(p.rotX, 0, 5.0 * delta);
        p.rotZ = THREE.MathUtils.lerp(p.rotZ, 0, 5.0 * delta);
        p.angVelX = 0;
        p.angVelZ = 0;
        p.velY = 0;
      }
    } else {
      // Kinematic preview mode (always upright)
      p.rotX = 0;
      p.rotZ = 0;
      p.rotY = 0;
      p.posX = 0;
      p.posZ = 0;
      p.angVelY = 0;
      p.isFallen = false;
    }

    // Apply transforms to robot root
    robot.position.set(p.posX, p.posY, p.posZ);
    robot.rotation.set(p.rotX, p.rotY, p.rotZ);
    robot.updateMatrixWorld(true);

    // SOLID FLOOR COLLISION & AUTO-GROUNDING
    // Find the absolute lowest point of any part of the robot in the 3D scene
    const bbox = new THREE.Box3().setFromObject(robot);
    const lowestY = bbox.min.y;

    if (lowestY < 0.005) {
      // Robot penetrated the ground! Hard clamp to solid floor surface at Y = 0.005
      const penetration = 0.005 - lowestY;
      p.posY += penetration;
      p.velY = 0;
      p.angVelX *= 0.8;
      p.angVelZ *= 0.8;
      robot.position.y = p.posY;
    } else if ((kin.telemetry.status === 'stable' || kin.telemetry.status === 'dynamic') && lowestY > 0.006 && !p.isFallen) {
      // Robot is balanced (standing, squatting, or stepping): smoothly lower pelvis so feet touch floor
      const gap = lowestY - 0.005;
      p.posY = THREE.MathUtils.lerp(p.posY, p.posY - gap, 12.0 * delta);
      robot.position.y = p.posY;
    }
  };

  // Update visual gizmos (CoM and Support Polygon)
  const updateGizmos = () => {
    const kin = calculateRobotKinematics(
      anglesRef.current,
      { x: physicsStateRef.current.posX, y: physicsStateRef.current.posY, z: physicsStateRef.current.posZ },
      { pitch: physicsStateRef.current.rotX, roll: physicsStateRef.current.rotZ, yaw: physicsStateRef.current.rotY }
    );

    // CoM Marker
    if (comMarkerRef.current) {
      comMarkerRef.current.visible = showCoM;
      comMarkerRef.current.position.set(kin.comWorld.x, kin.comWorld.y, kin.comWorld.z);

      const mat = comMarkerRef.current.material as THREE.MeshBasicMaterial;
      if (kin.telemetry.status === 'stable') mat.color.setHex(0x10b981);
      else if (kin.telemetry.status === 'dynamic') mat.color.setHex(0xf59e0b);
      else mat.color.setHex(0xef4444);
    }

    // CoM Vertical Drop Line
    if (comPlumbLineRef.current) {
      comPlumbLineRef.current.visible = showCoM;
      const positions = comPlumbLineRef.current.geometry.attributes.position;
      positions.setXYZ(0, kin.comWorld.x, kin.comWorld.y, kin.comWorld.z);
      positions.setXYZ(1, kin.comWorld.x, 0.005, kin.comWorld.z);
      positions.needsUpdate = true;
    }

    // CoM Ground Reticle
    if (comGroundReticleRef.current) {
      comGroundReticleRef.current.visible = showCoM;
      comGroundReticleRef.current.position.set(kin.comWorld.x, 0.006, kin.comWorld.z);
      const mat = comGroundReticleRef.current.material as THREE.MeshBasicMaterial;
      if (kin.telemetry.status === 'stable') mat.color.setHex(0x10b981);
      else if (kin.telemetry.status === 'dynamic') mat.color.setHex(0xf59e0b);
      else mat.color.setHex(0xef4444);
    }

    // Support Polygon Outline
    if (supportPolyLineRef.current) {
      supportPolyLineRef.current.visible = showSupportPoly;

      // Extract points
      const pts = kin.supportPolygon.map((p) => new THREE.Vector3(p.x, 0.008, p.z));
      if (pts.length >= 3) {
        // Convex hull bounding box
        const minX = Math.min(...pts.map((p) => p.x));
        const maxX = Math.max(...pts.map((p) => p.x));
        const minZ = Math.min(...pts.map((p) => p.z));
        const maxZ = Math.max(...pts.map((p) => p.z));

        const boxPts = [
          new THREE.Vector3(minX, 0.008, minZ),
          new THREE.Vector3(maxX, 0.008, minZ),
          new THREE.Vector3(maxX, 0.008, maxZ),
          new THREE.Vector3(minX, 0.008, maxZ),
        ];

        supportPolyLineRef.current.geometry.setFromPoints(boxPts);
      }

      const mat = supportPolyLineRef.current.material as THREE.LineBasicMaterial;
      if (kin.telemetry.status === 'stable') mat.color.setHex(0x10b981);
      else if (kin.telemetry.status === 'dynamic') mat.color.setHex(0xf59e0b);
      else mat.color.setHex(0xef4444);
    }
  };

  // Reset Soccer Ball to penalty spot
  const resetBall = useCallback(() => {
    ballStateRef.current = {
      pos: new THREE.Vector3(-0.24, 0.155, 0.92),
      vel: new THREE.Vector3(0, 0, 0),
      isKicked: false,
      hasScored: false,
    };
    if (ballMeshRef.current) {
      ballMeshRef.current.position.set(-0.24, 0.155, 0.92);
      ballMeshRef.current.rotation.set(0, 0, 0);
    }
    if (ballShadowRef.current) {
      ballShadowRef.current.position.set(-0.24, 0.006, 0.92);
      ballShadowRef.current.scale.set(1, 1, 1);
      (ballShadowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5;
    }
  }, []);

  // Sync soccer visibility & resets
  useEffect(() => {
    isSoccerMissionRef.current = Boolean(isSoccerMission);
    if (soccerGroupRef.current) {
      soccerGroupRef.current.visible = Boolean(isSoccerMission);
    }
    if (isSoccerMission) {
      resetBall();
    }
  }, [isSoccerMission, resetBall]);

  useEffect(() => {
    if (isSoccerMission) {
      resetBall();
    }
  }, [resetTrigger, isSoccerMission, resetBall]);

  useEffect(() => {
    if (!ballScored && ballStateRef.current.hasScored) {
      resetBall();
    }
  }, [ballScored, resetBall]);

  // Build 3D RoboCup Soccer Pitch, Goal, and Ball
  const buildSoccerField = (scene: THREE.Scene) => {
    const soccerGroup = new THREE.Group();
    soccerGroup.name = 'soccer_field';
    soccerGroupRef.current = soccerGroup;
    soccerGroup.visible = Boolean(isSoccerMissionRef.current);
    scene.add(soccerGroup);

    // 1. Green Turf Pitch Strip
    const turfGeo = new THREE.PlaneGeometry(5.2, 8.5);
    const turfMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Emerald stadium pitch
      roughness: 0.85,
      metalness: 0.1,
    });
    const turf = new THREE.Mesh(turfGeo, turfMat);
    turf.rotation.x = -Math.PI / 2;
    turf.position.set(0, 0.003, 2.0);
    turf.receiveShadow = true;
    soccerGroup.add(turf);

    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });

    // Goal line (at z = 4.2)
    const goalLineGeo = new THREE.PlaneGeometry(3.6, 0.08);
    const goalLine = new THREE.Mesh(goalLineGeo, lineMat);
    goalLine.rotation.x = -Math.PI / 2;
    goalLine.position.set(0, 0.005, 4.2);
    soccerGroup.add(goalLine);

    // Penalty Box Outline
    const penBoxPts = [
      new THREE.Vector3(-1.6, 0.006, 1.8),
      new THREE.Vector3(1.6, 0.006, 1.8),
      new THREE.Vector3(1.6, 0.006, 4.2),
      new THREE.Vector3(-1.6, 0.006, 4.2),
    ];
    const penBoxGeo = new THREE.BufferGeometry().setFromPoints(penBoxPts);
    const penBoxLine = new THREE.LineLoop(penBoxGeo, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 }));
    soccerGroup.add(penBoxLine);

    // Penalty Spot where ball is placed (-0.24, 0.005, 0.92)
    const spotGeo = new THREE.CircleGeometry(0.06, 16);
    const spotMesh = new THREE.Mesh(spotGeo, lineMat);
    spotMesh.rotation.x = -Math.PI / 2;
    spotMesh.position.set(-0.24, 0.005, 0.92);
    soccerGroup.add(spotMesh);

    // Glowing target ring
    const spotRingGeo = new THREE.RingGeometry(0.12, 0.16, 24);
    const spotRing = new THREE.Mesh(spotRingGeo, new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.7 }));
    spotRing.rotation.x = -Math.PI / 2;
    spotRing.position.set(-0.24, 0.006, 0.92);
    soccerGroup.add(spotRing);

    // 2. Soccer Goal Posts & Net at z = 4.2
    const goalGroup = new THREE.Group();
    goalGroup.position.set(0, 0, 4.2);
    soccerGroup.add(goalGroup);

    const postMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.2,
      metalness: 0.6,
    });

    const postRadius = 0.045;
    const goalWidth = 2.4;
    const goalHeight = 1.3;
    const goalDepth = 0.65;

    // Left Post
    const postGeo = new THREE.CylinderGeometry(postRadius, postRadius, goalHeight, 16);
    const leftPost = new THREE.Mesh(postGeo, postMat);
    leftPost.position.set(-goalWidth / 2, goalHeight / 2, 0);
    leftPost.castShadow = true;
    goalGroup.add(leftPost);

    // Right Post
    const rightPost = new THREE.Mesh(postGeo, postMat);
    rightPost.position.set(goalWidth / 2, goalHeight / 2, 0);
    rightPost.castShadow = true;
    goalGroup.add(rightPost);

    // Top Crossbar
    const barGeo = new THREE.CylinderGeometry(postRadius, postRadius, goalWidth, 16);
    barGeo.rotateZ(Math.PI / 2);
    const crossbar = new THREE.Mesh(barGeo, postMat);
    crossbar.position.set(0, goalHeight, 0);
    crossbar.castShadow = true;
    goalGroup.add(crossbar);

    // Back angled support tubes
    const backTubeGeo = new THREE.CylinderGeometry(0.03, 0.03, Math.sqrt(goalHeight * goalHeight + goalDepth * goalDepth), 8);
    backTubeGeo.rotateX(Math.atan2(goalDepth, goalHeight));

    const leftBackTube = new THREE.Mesh(backTubeGeo, postMat);
    leftBackTube.position.set(-goalWidth / 2, goalHeight / 2, goalDepth / 2);
    goalGroup.add(leftBackTube);

    const rightBackTube = new THREE.Mesh(backTubeGeo, postMat);
    rightBackTube.position.set(goalWidth / 2, goalHeight / 2, goalDepth / 2);
    goalGroup.add(rightBackTube);

    // Goal Net
    const netMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });

    // Net Back
    const netBackGeo = new THREE.PlaneGeometry(goalWidth, goalHeight, 18, 10);
    const netBack = new THREE.Mesh(netBackGeo, netMat);
    netBack.position.set(0, goalHeight / 2, goalDepth);
    goalGroup.add(netBack);

    // Net Top
    const netTopGeo = new THREE.PlaneGeometry(goalWidth, goalDepth, 18, 6);
    const netTop = new THREE.Mesh(netTopGeo, netMat);
    netTop.rotation.x = Math.PI / 2;
    netTop.position.set(0, goalHeight, goalDepth / 2);
    goalGroup.add(netTop);

    // Neon Goal Bar Top
    const neonBarGeo = new THREE.BoxGeometry(goalWidth, 0.04, 0.04);
    const neonMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const neonBar = new THREE.Mesh(neonBarGeo, neonMat);
    neonBar.position.set(0, goalHeight + 0.05, 0);
    goalGroup.add(neonBar);

    // 3. 3D Soccer Ball
    const soccerCanvas = document.createElement('canvas');
    soccerCanvas.width = 512;
    soccerCanvas.height = 256;
    const sCtx = soccerCanvas.getContext('2d');
    if (sCtx) {
      sCtx.fillStyle = '#f8fafc';
      sCtx.fillRect(0, 0, 512, 256);
      sCtx.fillStyle = '#0f172a';
      const pentagons = [
        [100, 60], [260, 60], [420, 60],
        [180, 130], [340, 130],
        [100, 200], [260, 200], [420, 200],
      ];
      pentagons.forEach(([px, py]) => {
        sCtx.beginPath();
        for (let k = 0; k < 5; k++) {
          const a = (k * 2 * Math.PI) / 5 - Math.PI / 2;
          const x = px + 24 * Math.cos(a);
          const y = py + 24 * Math.sin(a);
          if (k === 0) sCtx.moveTo(x, y);
          else sCtx.lineTo(x, y);
        }
        sCtx.closePath();
        sCtx.fill();
        sCtx.strokeStyle = '#334155';
        sCtx.lineWidth = 3;
        sCtx.stroke();
      });
    }
    const soccerTex = new THREE.CanvasTexture(soccerCanvas);

    const ballRadius = 0.155;
    const ballGeo = new THREE.SphereGeometry(ballRadius, 32, 24);
    const ballMat = new THREE.MeshStandardMaterial({
      map: soccerTex,
      roughness: 0.35,
      metalness: 0.1,
    });
    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
    ballMesh.position.set(-0.24, ballRadius, 0.92);
    ballMesh.castShadow = true;
    soccerGroup.add(ballMesh);
    ballMeshRef.current = ballMesh;

    // Contact Shadow beneath the ball
    const shadowGeo = new THREE.CircleGeometry(ballRadius * 1.1, 24);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x052e16,
      transparent: true,
      opacity: 0.5,
    });
    const ballShadow = new THREE.Mesh(shadowGeo, shadowMat);
    ballShadow.rotation.x = -Math.PI / 2;
    ballShadow.position.set(-0.24, 0.006, 0.92);
    soccerGroup.add(ballShadow);
    ballShadowRef.current = ballShadow;
  };

  // Update Soccer Physics, Foot Strike Detection, and Net Collision
  const updateSoccerPhysics = (delta: number) => {
    if (!isSoccerMissionRef.current || !ballMeshRef.current) return;

    const ballPos = ballStateRef.current.pos;
    const ballVel = ballStateRef.current.vel;

    // Detect strike if ball hasn't launched yet
    if (!ballStateRef.current.isKicked) {
      const rFootPos = new THREE.Vector3();
      if (rAnkleRollRef.current) {
        rAnkleRollRef.current.getWorldPosition(rFootPos);
      }

      const distToBall = rFootPos.distanceTo(ballPos);
      const rHipPitch = anglesRef.current.r_hip_pitch ?? 0;

      // Strike triggers when right leg swings forward to connect with the ball
      if ((distToBall < 0.65 || rFootPos.z >= 0.52) && (rHipPitch <= -35 || rFootPos.z > 0.48)) {
        ballStateRef.current.isKicked = true;
        soundManager.playKick();

        // High-velocity strike towards the goal net
        const kickPower = Math.min(1.5, Math.max(1.0, Math.abs(rHipPitch) / 45));
        ballVel.set(
          (Math.random() - 0.5) * 0.12,
          2.6 * kickPower,
          16.5 * kickPower
        );
      }
    } else {
      // In flight physics
      ballPos.addScaledVector(ballVel, delta);
      ballVel.y -= 9.8 * delta;

      // Ground bounce
      if (ballPos.y <= 0.155) {
        ballPos.y = 0.155;
        if (ballVel.y < -0.4) {
          ballVel.y = -ballVel.y * 0.5;
          soundManager.playServo(0.5);
        } else {
          ballVel.y = 0;
        }
        // Smooth turf rolling with low resistance so ball travels deep into the goal
        ballVel.z *= Math.pow(0.993, delta * 10);
        ballVel.x *= Math.pow(0.993, delta * 10);
      }

      // Crossed Goal line (z >= 4.2)
      if (ballPos.z >= 4.2) {
        if (Math.abs(ballPos.x) <= 1.15 && ballPos.y <= 1.3) {
          if (!ballStateRef.current.hasScored) {
            ballStateRef.current.hasScored = true;
            soundManager.playGoal();
            try {
              confetti({
                particleCount: 140,
                spread: 90,
                origin: { y: 0.55 },
                colors: ['#22c55e', '#facc15', '#38bdf8', '#ffffff'],
              });
            } catch {}
            onBallScoredRef.current?.();
          }
        }
      }

      // Net collision deep inside the goal net (z >= 4.68)
      // Goal line is 4.2, net back is 4.85. The ball enters deep inside (4.72m), hits the back netting and settles inside!
      if (ballPos.z >= 4.68 && Math.abs(ballPos.x) <= 1.15) {
        ballVel.multiplyScalar(0.08);
        ballPos.z = Math.min(ballPos.z, 4.72);
      }

      // Rolling rotation
      ballMeshRef.current.rotation.x += ballVel.z * delta * 6;
      ballMeshRef.current.rotation.z -= ballVel.x * delta * 6;
    }

    ballMeshRef.current.position.copy(ballPos);
    if (ballShadowRef.current) {
      ballShadowRef.current.position.x = ballPos.x;
      ballShadowRef.current.position.z = ballPos.z;
      const heightAboveFloor = Math.max(0, ballPos.y - 0.155);
      const shadowScale = Math.max(0.3, 1.0 - heightAboveFloor * 0.5);
      ballShadowRef.current.scale.set(shadowScale, shadowScale, shadowScale);
      (ballShadowRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0.1, 0.5 - heightAboveFloor * 0.3);
    }
  };

  // Camera Presets
  const setCameraPreset = (view: 'front' | 'side' | 'top' | 'perspective') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const c = cameraRef.current;
    const ctrl = controlsRef.current;
    ctrl.target.set(0, 0.95, 0);

    if (view === 'front') {
      c.position.set(0, 1.2, 3.8);
    } else if (view === 'side') {
      c.position.set(3.8, 1.2, 0);
    } else if (view === 'top') {
      c.position.set(0, 4.6, 0.1);
      ctrl.target.set(0, 0, 0);
    } else if (view === 'perspective') {
      c.position.set(2.4, 1.6, 3.4);
    }
    ctrl.update();
  };

  // Reset Physics Balance Recovery
  const recoverRobot = () => {
    physicsStateRef.current = {
      posX: 0,
      posY: 1.43,
      posZ: 0,
      rotX: 0,
      rotZ: 0,
      rotY: 0,
      velX: 0,
      velY: 0,
      velZ: 0,
      angVelX: 0,
      angVelY: 0,
      angVelZ: 0,
      isFallen: false,
    };
    kickAirTimeRef.current = 0;
    soundManager.playBoot();
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Viewport Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-lg p-1 flex items-center gap-1 shadow-lg shadow-black/40">
          <button
            onClick={() => setCameraPreset('perspective')}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Perspective View"
          >
            3D
          </button>
          <button
            onClick={() => setCameraPreset('front')}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Frontal View"
          >
            Front
          </button>
          <button
            onClick={() => setCameraPreset('side')}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Side Sagittal View"
          >
            Side
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Top View"
          >
            Top
          </button>
        </div>

        {physicsStateRef.current.isFallen && (
          <button
            onClick={recoverRobot}
            className="bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold px-3 py-1.5 rounded-lg border border-red-400 shadow-lg shadow-red-950/60 flex items-center gap-1.5 animate-pulse transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            RECOVER ROBOT (FALL DETECTED)
          </button>
        )}
      </div>

      {/* RoboCup Penalty Shootout Viewport HUD (Mission 10) */}
      {isSoccerMission && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-md border border-emerald-500/50 rounded-xl px-4 py-2 flex items-center gap-3 shadow-xl shadow-emerald-950/40">
            <span className="text-xl">⚽</span>
            <div className="flex flex-col">
              <div className="text-xs font-bold font-tech text-emerald-300 flex items-center gap-1.5">
                <span>ROBOCUP PENALTY SHOOTOUT</span>
                {ballScored && (
                  <span className="px-2 py-0.5 text-[10px] bg-yellow-400 text-slate-950 rounded-full font-bold uppercase animate-bounce">
                    GOAL!
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-300">
                {ballScored
                  ? '🏆 Super Strike in the Net! Celebrate with your Robot!'
                  : 'Target: Goal Net (4.2m) · Kick with Right Leg'}
              </div>
            </div>
            <button
              onClick={resetBall}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-2.5 py-1 rounded-md transition-all border border-emerald-400/40 cursor-pointer"
              title="Place the soccer ball back on the penalty spot"
            >
              ↺ Re-spot Ball
            </button>
          </div>
        </div>
      )}

      {/* Viewport legend */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none bg-slate-950/70 backdrop-blur-sm border border-slate-800/80 rounded-md px-3 py-1.5 text-[11px] text-slate-400 font-mono">
        <div>17-DOF Humanoid Simulator v1.0</div>
        <div className="text-slate-500 text-[10px]">L-Click: Rotate · R-Click: Pan · Scroll: Zoom</div>
      </div>
    </div>
  );
};
