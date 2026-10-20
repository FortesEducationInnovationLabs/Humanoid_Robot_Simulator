import { JointAngles, PresetPose, StabilityTelemetry } from '../types/robot';

export const PRESET_POSES: PresetPose[] = [
  {
    id: 'ready',
    name: 'Stand Ready',
    category: 'Basic',
    description: 'Balanced default stance with slight knee compliance for shock absorption',
    angles: {
      head_yaw: 0,
      l_shoulder_pitch: 0,
      l_shoulder_roll: 12,
      l_elbow_pitch: 20,
      r_shoulder_pitch: 0,
      r_shoulder_roll: -12,
      r_elbow_pitch: 20,
      l_hip_roll: 0,
      l_hip_pitch: -12,
      l_knee_pitch: 24,
      l_ankle_pitch: -12,
      l_ankle_roll: 0,
      r_hip_roll: 0,
      r_hip_pitch: -12,
      r_knee_pitch: 24,
      r_ankle_pitch: -12,
      r_ankle_roll: 0,
    },
  },
  {
    id: 'zero',
    name: 'Zero Calibration Trim',
    category: 'Basic',
    description: 'All 17 servos centered at absolute 0 degrees for mechanical alignment',
    angles: {
      head_yaw: 0,
      l_shoulder_pitch: 0,
      l_shoulder_roll: 0,
      l_elbow_pitch: 0,
      r_shoulder_pitch: 0,
      r_shoulder_roll: 0,
      r_elbow_pitch: 0,
      l_hip_roll: 0,
      l_hip_pitch: 0,
      l_knee_pitch: 0,
      l_ankle_pitch: 0,
      l_ankle_roll: 0,
      r_hip_roll: 0,
      r_hip_pitch: 0,
      r_knee_pitch: 0,
      r_ankle_pitch: 0,
      r_ankle_roll: 0,
    },
  },
  {
    id: 't_pose',
    name: 'Aerospace T-Pose',
    category: 'Basic',
    description: 'Arms spread horizontally at 90 degrees for visual servo calibration',
    angles: {
      head_yaw: 0,
      l_shoulder_pitch: 0,
      l_shoulder_roll: 90,
      l_elbow_pitch: 0,
      r_shoulder_pitch: 0,
      r_shoulder_roll: -90,
      r_elbow_pitch: 0,
      l_hip_roll: 0,
      l_hip_pitch: 0,
      l_knee_pitch: 0,
      l_ankle_pitch: 0,
      l_ankle_roll: 0,
      r_hip_roll: 0,
      r_hip_pitch: 0,
      r_knee_pitch: 0,
      r_ankle_pitch: 0,
      r_ankle_roll: 0,
    },
  },
  {
    id: 'wave',
    name: 'Friendly Wave',
    category: 'Action',
    description: 'Right arm raised high with bent elbow waving to students',
    angles: {
      head_yaw: 15,
      l_shoulder_pitch: 0,
      l_shoulder_roll: 12,
      l_elbow_pitch: 15,
      r_shoulder_pitch: -85,
      r_shoulder_roll: -65,
      r_elbow_pitch: 85,
      l_hip_roll: 0,
      l_hip_pitch: -10,
      l_knee_pitch: 20,
      l_ankle_pitch: -10,
      l_ankle_roll: 0,
      r_hip_roll: 0,
      r_hip_pitch: -10,
      r_knee_pitch: 20,
      r_ankle_pitch: -10,
      r_ankle_roll: 0,
    },
  },
  {
    id: 'squat',
    name: 'Deep Squat',
    category: 'Stance',
    description: 'Knees flexed to 75 degrees with ankles and hips counter-pitched for low CoM',
    angles: {
      head_yaw: 0,
      l_shoulder_pitch: -45,
      l_shoulder_roll: 20,
      l_elbow_pitch: 45,
      r_shoulder_pitch: -45,
      r_shoulder_roll: -20,
      r_elbow_pitch: 45,
      l_hip_roll: 0,
      l_hip_pitch: -45,
      l_knee_pitch: 80,
      l_ankle_pitch: -35,
      l_ankle_roll: 0,
      r_hip_roll: 0,
      r_hip_pitch: -45,
      r_knee_pitch: 80,
      r_ankle_pitch: -35,
      r_ankle_roll: 0,
    },
  },
  {
    id: 'crane_balance',
    name: 'Crane Stance (One Leg)',
    category: 'Stance',
    description: 'Full weight shifted to left leg, right leg retracted high off the ground',
    angles: {
      head_yaw: -5,
      l_shoulder_pitch: 0,
      l_shoulder_roll: 60,
      l_elbow_pitch: 40,
      r_shoulder_pitch: 0,
      r_shoulder_roll: -60,
      r_elbow_pitch: 40,
      l_hip_roll: 16,
      l_hip_pitch: -15,
      l_knee_pitch: 30,
      l_ankle_pitch: -15,
      l_ankle_roll: -16,
      r_hip_roll: 10,
      r_hip_pitch: -70,
      r_knee_pitch: 95,
      r_ankle_pitch: 20,
      r_ankle_roll: 0,
    },
  },
  {
    id: 'kick',
    name: 'Karate Front Kick',
    category: 'Action',
    description: 'Dynamic forward strike with right leg and left arm counter-balance',
    angles: {
      head_yaw: 0,
      l_shoulder_pitch: 60,
      l_shoulder_roll: 25,
      l_elbow_pitch: 30,
      r_shoulder_pitch: -60,
      r_shoulder_roll: -20,
      r_elbow_pitch: 80,
      l_hip_roll: 12,
      l_hip_pitch: -18,
      l_knee_pitch: 36,
      l_ankle_pitch: -18,
      l_ankle_roll: -12,
      r_hip_roll: 0,
      r_hip_pitch: -85,
      r_knee_pitch: 10,
      r_ankle_pitch: 15,
      r_ankle_roll: 0,
    },
  },
  {
    id: 'step_left',
    name: 'Walk: Left Forward Stride',
    category: 'Motion',
    description: 'Left foot swings forward while right leg pushes off ground',
    angles: {
      head_yaw: 0,
      l_shoulder_pitch: 35,
      l_shoulder_roll: 15,
      l_elbow_pitch: 35,
      r_shoulder_pitch: -35,
      r_shoulder_roll: -15,
      r_elbow_pitch: 35,
      l_hip_roll: -4,
      l_hip_pitch: -35,
      l_knee_pitch: 25,
      l_ankle_pitch: -5,
      l_ankle_roll: 0,
      r_hip_roll: 4,
      r_hip_pitch: 20,
      r_knee_pitch: 15,
      r_ankle_pitch: -25,
      r_ankle_roll: 0,
    },
  },
  {
    id: 'step_right',
    name: 'Walk: Right Forward Stride',
    category: 'Motion',
    description: 'Right foot swings forward while left leg stabilizes support phase',
    angles: {
      head_yaw: 0,
      l_shoulder_pitch: -35,
      l_shoulder_roll: 15,
      l_elbow_pitch: 35,
      r_shoulder_pitch: 35,
      r_shoulder_roll: -15,
      r_elbow_pitch: 35,
      l_hip_roll: -4,
      l_hip_pitch: 20,
      l_knee_pitch: 15,
      l_ankle_pitch: -25,
      l_ankle_roll: 0,
      r_hip_roll: 4,
      r_hip_pitch: -35,
      r_knee_pitch: 25,
      r_ankle_pitch: -5,
      r_ankle_roll: 0,
    },
  },
  {
    id: 'kung_fu_guard',
    name: 'Scout Combat Guard',
    category: 'Stance',
    description: 'Defensive martial arts guard with fists raised and stable wide stance',
    angles: {
      head_yaw: 0,
      l_shoulder_pitch: -60,
      l_shoulder_roll: 25,
      l_elbow_pitch: 95,
      r_shoulder_pitch: -50,
      r_shoulder_roll: -30,
      r_elbow_pitch: 90,
      l_hip_roll: 8,
      l_hip_pitch: -20,
      l_knee_pitch: 35,
      l_ankle_pitch: -15,
      l_ankle_roll: -8,
      r_hip_roll: -8,
      r_hip_pitch: -20,
      r_knee_pitch: 35,
      r_ankle_pitch: -15,
      r_ankle_roll: 8,
    },
  },
  {
    id: 'hero_landing',
    name: 'Superhero Drop',
    category: 'Action',
    description: 'Three-point ground contact pose with one fist touching the deck',
    angles: {
      head_yaw: 0,
      l_shoulder_pitch: -80,
      l_shoulder_roll: 35,
      l_elbow_pitch: 30,
      r_shoulder_pitch: 45,
      r_shoulder_roll: -30,
      r_elbow_pitch: 60,
      l_hip_roll: 12,
      l_hip_pitch: -75,
      l_knee_pitch: 110,
      l_ankle_pitch: -35,
      l_ankle_roll: -12,
      r_hip_roll: -15,
      r_hip_pitch: 15,
      r_knee_pitch: 90,
      r_ankle_pitch: -30,
      r_ankle_roll: 15,
    },
  },
  {
    id: 'bow',
    name: 'Respectful Bow',
    category: 'Action',
    description: 'Humanoid torso inclined 40 degrees forward with hands aligned to thighs',
    angles: {
      head_yaw: 0,
      l_shoulder_pitch: 15,
      l_shoulder_roll: 10,
      l_elbow_pitch: 10,
      r_shoulder_pitch: 15,
      r_shoulder_roll: -10,
      r_elbow_pitch: 10,
      l_hip_roll: 0,
      l_hip_pitch: -35,
      l_knee_pitch: 10,
      l_ankle_pitch: 25,
      l_ankle_roll: 0,
      r_hip_roll: 0,
      r_hip_pitch: -35,
      r_knee_pitch: 10,
      r_ankle_pitch: 25,
      r_ankle_roll: 0,
    },
  },
];

// Helper: deg to rad
const degToRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Computes forward kinematics approximation and Center of Mass (CoM).
 * Coordinate frame:
 * +X: Robot Left
 * -X: Robot Right
 * +Y: Upward vertical
 * +Z: Forward
 * -Z: Backward
 */
export function calculateRobotKinematics(
  angles: JointAngles,
  rootPosition: { x: number; y: number; z: number } = { x: 0, y: 1.43, z: 0 },
  rootRotation: { pitch: number; roll: number; yaw: number } = { pitch: 0, roll: 0, yaw: 0 }
): {
  telemetry: StabilityTelemetry;
  comWorld: { x: number; y: number; z: number };
  supportPolygon: { x: number; z: number }[];
  feetPositions: {
    left: { x: number; y: number; z: number; grounded: boolean };
    right: { x: number; y: number; z: number; grounded: boolean };
  };
} {
  // Mass definitions (kg)
  const masses = {
    torso: 4.2,
    head: 0.8,
    lUpperArm: 0.6,
    lForearm: 0.5,
    rUpperArm: 0.6,
    rForearm: 0.5,
    pelvis: 1.8,
    lThigh: 1.4,
    lShin: 1.1,
    lFoot: 0.8,
    rThigh: 1.4,
    rShin: 1.1,
    rFoot: 0.8,
  };

  const totalMass = Object.values(masses).reduce((a, b) => a + b, 0);

  // Exact relative limb lengths matching Three.js Robosen K1 Model
  const PELVIS_TO_HIP_X = 0.24;
  const PELVIS_TO_HIP_Y = -0.15;
  const THIGH_LEN = 0.56;
  const SHIN_LEN = 0.58;
  const FOOT_HEIGHT = 0.15;
  const FOOT_HALF_WIDTH = 0.16;
  const FOOT_HALF_DEPTH = 0.28;

  const TORSO_HEIGHT = 0.85;
  const HEAD_HEIGHT = 0.35;
  const SHOULDER_X = 0.44;
  const SHOULDER_Y = 0.62;
  const UPPER_ARM_LEN = 0.42;
  const FOREARM_LEN = 0.42;

  // Let's compute kinematic points relative to root (Pelvis Center)
  // Pelvis position
  const p_pelvis = { x: 0, y: 0, z: 0 };

  // Torso center of mass
  const p_torso = { x: 0, y: TORSO_HEIGHT * 0.45, z: 0 };

  // Head position
  const headAngle = degToRad(angles.head_yaw);
  const p_head = {
    x: Math.sin(headAngle) * 0.05,
    y: TORSO_HEIGHT + HEAD_HEIGHT * 0.5,
    z: Math.cos(headAngle) * 0.05,
  };

  // Left Arm
  const l_sp = degToRad(angles.l_shoulder_pitch);
  const l_sr = degToRad(angles.l_shoulder_roll);
  const l_ep = degToRad(angles.l_elbow_pitch);

  const l_elbow = {
    x: SHOULDER_X + Math.sin(l_sr) * UPPER_ARM_LEN,
    y: SHOULDER_Y - Math.cos(l_sr) * Math.cos(l_sp) * UPPER_ARM_LEN,
    z: Math.sin(l_sp) * UPPER_ARM_LEN,
  };
  const p_l_upper_arm = {
    x: (SHOULDER_X + l_elbow.x) / 2,
    y: (SHOULDER_Y + l_elbow.y) / 2,
    z: l_elbow.z / 2,
  };

  // Left Forearm
  const p_l_forearm = {
    x: l_elbow.x + Math.sin(l_sr) * 0.2,
    y: l_elbow.y - Math.cos(l_ep) * FOREARM_LEN * 0.5,
    z: l_elbow.z + Math.sin(l_ep) * FOREARM_LEN * 0.5,
  };

  // Right Arm
  const r_sp = degToRad(angles.r_shoulder_pitch);
  const r_sr = degToRad(angles.r_shoulder_roll);
  const r_ep = degToRad(angles.r_elbow_pitch);

  const r_elbow = {
    x: -SHOULDER_X + Math.sin(r_sr) * UPPER_ARM_LEN,
    y: SHOULDER_Y - Math.cos(r_sr) * Math.cos(r_sp) * UPPER_ARM_LEN,
    z: Math.sin(r_sp) * UPPER_ARM_LEN,
  };
  const p_r_upper_arm = {
    x: (-SHOULDER_X + r_elbow.x) / 2,
    y: (SHOULDER_Y + r_elbow.y) / 2,
    z: r_elbow.z / 2,
  };
  const p_r_forearm = {
    x: r_elbow.x + Math.sin(r_sr) * 0.2,
    y: r_elbow.y - Math.cos(r_ep) * FOREARM_LEN * 0.5,
    z: r_elbow.z + Math.sin(r_ep) * FOREARM_LEN * 0.5,
  };

  // Left Leg Kinematics
  const l_hr = degToRad(angles.l_hip_roll);
  const l_hp = degToRad(angles.l_hip_pitch);
  const l_kp = degToRad(angles.l_knee_pitch);
  const l_ap = degToRad(angles.l_ankle_pitch);
  const l_ar = degToRad(angles.l_ankle_roll);

  // Hip joint location
  const l_hip_origin = { x: PELVIS_TO_HIP_X, y: PELVIS_TO_HIP_Y, z: 0 };
  // Knee location
  const l_knee = {
    x: l_hip_origin.x + Math.sin(l_hr) * THIGH_LEN,
    y: l_hip_origin.y - Math.cos(l_hr) * Math.cos(l_hp) * THIGH_LEN,
    z: l_hip_origin.z + Math.sin(l_hp) * THIGH_LEN,
  };
  const p_l_thigh = {
    x: (l_hip_origin.x + l_knee.x) / 2,
    y: (l_hip_origin.y + l_knee.y) / 2,
    z: (l_hip_origin.z + l_knee.z) / 2,
  };

  // Ankle location
  const l_shin_pitch = l_hp + l_kp;
  const l_ankle = {
    x: l_knee.x + Math.sin(l_hr) * SHIN_LEN * 0.8,
    y: l_knee.y - Math.cos(l_shin_pitch) * SHIN_LEN,
    z: l_knee.z + Math.sin(l_shin_pitch) * SHIN_LEN,
  };
  const p_l_shin = {
    x: (l_knee.x + l_ankle.x) / 2,
    y: (l_knee.y + l_ankle.y) / 2,
    z: (l_knee.z + l_ankle.z) / 2,
  };

  const p_l_foot = {
    x: l_ankle.x + Math.sin(l_ar) * FOOT_HEIGHT,
    y: l_ankle.y - FOOT_HEIGHT,
    z: l_ankle.z + Math.sin(l_ap) * 0.1,
  };

  // Right Leg Kinematics
  const r_hr = degToRad(angles.r_hip_roll);
  const r_hp = degToRad(angles.r_hip_pitch);
  const r_kp = degToRad(angles.r_knee_pitch);
  const r_ap = degToRad(angles.r_ankle_pitch);
  const r_ar = degToRad(angles.r_ankle_roll);

  const r_hip_origin = { x: -PELVIS_TO_HIP_X, y: PELVIS_TO_HIP_Y, z: 0 };
  const r_knee = {
    x: r_hip_origin.x + Math.sin(r_hr) * THIGH_LEN,
    y: r_hip_origin.y - Math.cos(r_hr) * Math.cos(r_hp) * THIGH_LEN,
    z: r_hip_origin.z + Math.sin(r_hp) * THIGH_LEN,
  };
  const p_r_thigh = {
    x: (r_hip_origin.x + r_knee.x) / 2,
    y: (r_hip_origin.y + r_knee.y) / 2,
    z: (r_hip_origin.z + r_knee.z) / 2,
  };

  const r_shin_pitch = r_hp + r_kp;
  const r_ankle = {
    x: r_knee.x + Math.sin(r_hr) * SHIN_LEN * 0.8,
    y: r_knee.y - Math.cos(r_shin_pitch) * SHIN_LEN,
    z: r_knee.z + Math.sin(r_shin_pitch) * SHIN_LEN,
  };
  const p_r_shin = {
    x: (r_knee.x + r_ankle.x) / 2,
    y: (r_knee.y + r_ankle.y) / 2,
    z: (r_knee.z + r_ankle.z) / 2,
  };

  const p_r_foot = {
    x: r_ankle.x + Math.sin(r_ar) * FOOT_HEIGHT,
    y: r_ankle.y - FOOT_HEIGHT,
    z: r_ankle.z + Math.sin(r_ap) * 0.1,
  };

  // Compute local CoM
  const sumMX =
    p_pelvis.x * masses.pelvis +
    p_torso.x * masses.torso +
    p_head.x * masses.head +
    p_l_upper_arm.x * masses.lUpperArm +
    p_l_forearm.x * masses.lForearm +
    p_r_upper_arm.x * masses.rUpperArm +
    p_r_forearm.x * masses.rForearm +
    p_l_thigh.x * masses.lThigh +
    p_l_shin.x * masses.lShin +
    p_l_foot.x * masses.lFoot +
    p_r_thigh.x * masses.rThigh +
    p_r_shin.x * masses.rShin +
    p_r_foot.x * masses.rFoot;

  const sumMY =
    p_pelvis.y * masses.pelvis +
    p_torso.y * masses.torso +
    p_head.y * masses.head +
    p_l_upper_arm.y * masses.lUpperArm +
    p_l_forearm.y * masses.lForearm +
    p_r_upper_arm.y * masses.rUpperArm +
    p_r_forearm.y * masses.rForearm +
    p_l_thigh.y * masses.lThigh +
    p_l_shin.y * masses.lShin +
    p_l_foot.y * masses.lFoot +
    p_r_thigh.y * masses.rThigh +
    p_r_shin.y * masses.rShin +
    p_r_foot.y * masses.rFoot;

  const sumMZ =
    p_pelvis.z * masses.pelvis +
    p_torso.z * masses.torso +
    p_head.z * masses.head +
    p_l_upper_arm.z * masses.lUpperArm +
    p_l_forearm.z * masses.lForearm +
    p_r_upper_arm.z * masses.rUpperArm +
    p_r_forearm.z * masses.rForearm +
    p_l_thigh.z * masses.lThigh +
    p_l_shin.z * masses.lShin +
    p_l_foot.z * masses.lFoot +
    p_r_thigh.z * masses.rThigh +
    p_r_shin.z * masses.rShin +
    p_r_foot.z * masses.rFoot;

  const localCoM = {
    x: sumMX / totalMass,
    y: sumMY / totalMass,
    z: sumMZ / totalMass,
  };

  // Closed-chain lateral weight shift from hip & ankle roll:
  // Rolling the stance hip tilts the pelvis and shifts the robot's center of mass laterally
  const lateralWeightShift = (angles.l_hip_roll - angles.r_hip_roll) * 0.015;
  const isLateralWeightShift = Math.abs(angles.l_hip_roll - angles.r_hip_roll) >= 10;
  const isSquatStance = angles.l_knee_pitch >= 45 && angles.r_knee_pitch >= 45;

  // Karate Front Kick dynamic stance detection:
  // When kicking high forward in a straight sagittal stance (hip pitch <= -45° while other leg is stance, and NOT leaning via lateral hip roll),
  // stance knee flexion anchors the pelvis dynamically over the grounded foot.
  const isRightKick = !isLateralWeightShift && !isSquatStance && angles.r_hip_pitch <= -45 && angles.l_hip_pitch > -35;
  const isLeftKick = !isLateralWeightShift && !isSquatStance && angles.l_hip_pitch <= -45 && angles.r_hip_pitch > -35;
  const isFrontKick = isRightKick || isLeftKick;

  let kickLateralShift = 0;
  if (isRightKick) {
    // Left stance knee flexion dynamically anchors pelvis over stance foot (+PELVIS_TO_HIP_X = +0.24)
    // Standing knee in ready pose is 24°; active martial arts absorption requires flexing deeper (>= 26°-28°)
    const kneeFactor = Math.min(1.0, Math.max(0, (angles.l_knee_pitch - 22) / 5));
    kickLateralShift = kneeFactor * PELVIS_TO_HIP_X;
  } else if (isLeftKick) {
    const kneeFactor = Math.min(1.0, Math.max(0, (angles.r_knee_pitch - 22) / 5));
    kickLateralShift = -kneeFactor * PELVIS_TO_HIP_X;
  }

  // Convert to world space considering root position, lateral weight shift, and dynamic kick stance
  const worldCoM = {
    x: rootPosition.x + localCoM.x + lateralWeightShift + kickLateralShift,
    y: rootPosition.y + localCoM.y,
    z: rootPosition.z + localCoM.z,
  };

  // Dynamic relative grounding: the lowest foot sole contacts the floor; the other foot is grounded if within 8cm
  const lowestFootRelY = Math.min(p_l_foot.y, p_r_foot.y);
  const leftGrounded = Math.abs(p_l_foot.y - lowestFootRelY) < 0.08;
  const rightGrounded = Math.abs(p_r_foot.y - lowestFootRelY) < 0.08;

  // Stance foot sole anchors on the solid floor at nominal stance positions:
  // Left foot nominal stance: +PELVIS_TO_HIP_X; Right foot nominal stance: -PELVIS_TO_HIP_X.
  const worldLeftFoot = {
    x: leftGrounded ? rootPosition.x + PELVIS_TO_HIP_X : rootPosition.x + p_l_foot.x,
    y: rootPosition.y + p_l_foot.y,
    z: rootPosition.z + p_l_foot.z,
    grounded: leftGrounded,
  };

  const worldRightFoot = {
    x: rightGrounded ? rootPosition.x - PELVIS_TO_HIP_X : rootPosition.x + p_r_foot.x,
    y: rootPosition.y + p_r_foot.y,
    z: rootPosition.z + p_r_foot.z,
    grounded: rightGrounded,
  };

  // Support Polygon Calculation (2D points on ground plane X-Z)
  const polygonPoints: { x: number; z: number }[] = [];

  const addFootCorners = (center: { x: number; z: number }) => {
    polygonPoints.push(
      { x: center.x - FOOT_HALF_WIDTH, z: center.z - FOOT_HALF_DEPTH },
      { x: center.x + FOOT_HALF_WIDTH, z: center.z - FOOT_HALF_DEPTH },
      { x: center.x + FOOT_HALF_WIDTH, z: center.z + FOOT_HALF_DEPTH },
      { x: center.x - FOOT_HALF_WIDTH, z: center.z + FOOT_HALF_DEPTH }
    );
  };

  if (worldLeftFoot.grounded) addFootCorners(worldLeftFoot);
  if (worldRightFoot.grounded) addFootCorners(worldRightFoot);

  // If no feet grounded, use actual foot positions rather than arbitrary fallback
  if (polygonPoints.length === 0) {
    addFootCorners(worldLeftFoot);
    addFootCorners(worldRightFoot);
  }

  // Calculate bounding box / convex hull bounds of support polygon
  const minX = Math.min(...polygonPoints.map((p) => p.x));
  const maxX = Math.max(...polygonPoints.map((p) => p.x));
  const minZ = Math.min(...polygonPoints.map((p) => p.z));
  const maxZ = Math.max(...polygonPoints.map((p) => p.z));

  // Distance of CoM projection (worldCoM.x, worldCoM.z) from boundary
  const insideX = worldCoM.x >= minX && worldCoM.x <= maxX;
  const insideZ = worldCoM.z >= minZ && worldCoM.z <= maxZ;
  const isInside = insideX && insideZ;

  let margin = 0;
  if (isInside) {
    const distToMinX = worldCoM.x - minX;
    const distToMaxX = maxX - worldCoM.x;
    const distToMinZ = worldCoM.z - minZ;
    const distToMaxZ = maxZ - worldCoM.z;
    margin = Math.min(distToMinX, distToMaxX, distToMinZ, distToMaxZ) * 100; // cm
  } else {
    const dx = Math.max(minX - worldCoM.x, 0, worldCoM.x - maxX);
    const dz = Math.max(minZ - worldCoM.z, 0, worldCoM.z - maxZ);
    margin = -Math.sqrt(dx * dx + dz * dz) * 100;
  }

  // Weight distribution between feet
  let footPressureL = 50;
  let footPressureR = 50;

  if (worldLeftFoot.grounded && !worldRightFoot.grounded) {
    footPressureL = 100;
    footPressureR = 0;
  } else if (!worldLeftFoot.grounded && worldRightFoot.grounded) {
    footPressureL = 0;
    footPressureR = 100;
  } else if (worldLeftFoot.grounded && worldRightFoot.grounded) {
    const distL = Math.abs(worldCoM.x - worldLeftFoot.x);
    const distR = Math.abs(worldCoM.x - worldRightFoot.x);
    const totalDist = distL + distR + 0.001;
    // Closer to left foot means higher left pressure
    footPressureL = Math.round((1 - distL / totalDist) * 100);
    footPressureR = 100 - footPressureL;
  }

  // Dynamic Torso Yaw Torque Calculation (Newton's 3rd Law counter-balance physics)
  // When a leg pitches forward, its forward momentum exerts a rotational reaction torque
  // on the pelvis/torso around the vertical yaw axis (left leg forward -> CCW / positive yaw twist).
  // In bipedal locomotion, BOTH arms must participate in reciprocal counter-swing:
  // - Opposite arm swings forward (counters at most ~45% of rotational momentum)
  // - Same-side arm swings backward (counters at most ~45% of rotational momentum)
  // One arm alone can NEVER balance the stride: residual torque remains >= 4.4 N·m (Unbalanced).
  // BOTH arms are strictly required to neutralize yaw torque to <= 3.0 N·m (Balanced).
  const legPitchDiff = angles.r_hip_pitch - angles.l_hip_pitch;
  let netYawTorque = 0;

  if (isFrontKick) {
    // Dynamic Karate Front Kick (Newton's 3rd Law counter-mass extension):
    // High-velocity front kick creates huge backward tipping inertia (~8.5 N·m).
    // In martial arts, this dynamic torque is countered by throwing the opposite arm backward (+50° to +70°)
    // AND flexing the support knee (>= 26°-28°) to absorb ground reaction forces.
    if (isRightKick) {
      const baseKickTorque = 8.5;
      const armCounter = Math.min(baseKickTorque, (Math.max(0, angles.l_shoulder_pitch) / 55) * baseKickTorque);
      const kneeAbsorption = Math.min(1.0, Math.max(0, (angles.l_knee_pitch - 22) / 5));
      const residual = Math.max(0, baseKickTorque - armCounter * kneeAbsorption);
      netYawTorque = Number((-residual).toFixed(1));
    } else {
      const baseKickTorque = 8.5;
      const armCounter = Math.min(baseKickTorque, (Math.max(0, angles.r_shoulder_pitch) / 55) * baseKickTorque);
      const kneeAbsorption = Math.min(1.0, Math.max(0, (angles.r_knee_pitch - 22) / 5));
      const residual = Math.max(0, baseKickTorque - armCounter * kneeAbsorption);
      netYawTorque = Number(residual.toFixed(1));
    }
  } else if (!isLateralWeightShift && !isSquatStance && Math.abs(legPitchDiff) >= 15) {
    if (legPitchDiff > 0) {
      // Left leg striding forward (positive yaw reaction torque):
      // Needs Right arm forward (r_shoulder_pitch <= -20) AND Left arm backward (l_shoulder_pitch >= +15)
      const rArmForward = Math.max(0, -angles.r_shoulder_pitch);
      const lArmBackward = Math.max(0, angles.l_shoulder_pitch);

      // Base torque from forward stride (~8.0 N·m)
      const baseTorque = Math.min(10.0, Math.max(7.5, legPitchDiff * 0.35));

      // Right arm counters at most 45% of base torque (max 3.6 N·m)
      const rCounter = Math.min(baseTorque * 0.45, (rArmForward / 35) * (baseTorque * 0.45));
      // Left arm counters at most 45% of base torque (max 3.6 N·m)
      const lCounter = Math.min(baseTorque * 0.45, (lArmBackward / 25) * (baseTorque * 0.45));

      // One arm alone leaves at least ~4.4 - 5.0 N·m uncountered -> ALWAYS UNBALANCED!
      // Both arms together reduce torque to ~0.8 - 2.0 N·m <= 3.0 N·m -> BALANCED!
      const residual = Math.max(0, baseTorque - rCounter - lCounter);
      netYawTorque = Number(residual.toFixed(1));
    } else {
      // Right leg striding forward (negative yaw reaction torque):
      // Needs Left arm forward (l_shoulder_pitch <= -20) AND Right arm backward (r_shoulder_pitch >= +15)
      const lArmForward = Math.max(0, -angles.l_shoulder_pitch);
      const rArmBackward = Math.max(0, angles.r_shoulder_pitch);

      const baseTorque = Math.min(10.0, Math.max(7.5, Math.abs(legPitchDiff) * 0.35));
      const lCounter = Math.min(baseTorque * 0.45, (lArmForward / 35) * (baseTorque * 0.45));
      const rCounter = Math.min(baseTorque * 0.45, (rArmBackward / 25) * (baseTorque * 0.45));

      const residual = Math.max(0, baseTorque - lCounter - rCounter);
      netYawTorque = Number((-residual).toFixed(1));
    }
  } else {
    // Normal standing, squatting, or single-leg crane stance: no stride-induced yaw torque
    netYawTorque = 0;
  }

  // Dynamic Stability Status:
  // A biped robot is only truly balanced ('stable') when its CoM is within the support polygon,
  // uncountered torso rotational yaw torque is neutralized (|netYawTorque| <= 3.0 N·m),
  // and the robot is not holding an extended swing leg suspended in the air.
  const isExtendedKickInAir =
    (!worldRightFoot.grounded && angles.r_hip_pitch <= -26) ||
    (!worldLeftFoot.grounded && angles.l_hip_pitch <= -26);

  if (isExtendedKickInAir) {
    margin = Math.min(margin, -6.0);
  }

  // Tilt threshold for physical fall (toppled on the floor)
  const isPhysicallyToppled =
    Math.abs(rootRotation.pitch) > 0.45 ||
    Math.abs(rootRotation.roll) > 0.45;

  let status: 'stable' | 'dynamic' | 'unstable' | 'fallen' = 'stable';
  if (isPhysicallyToppled || margin <= -18.0) {
    status = 'fallen';
  } else if (isExtendedKickInAir) {
    status = 'dynamic';
  } else if (margin <= 0 || Math.abs(netYawTorque) > 3.0) {
    status = 'unstable';
  } else if (margin <= 3.0) {
    status = 'dynamic';
  } else {
    status = 'stable';
  }

  // Gyro tilt telemetry (degrees)
  const gyroPitch = (rootRotation.pitch * 180) / Math.PI + (angles.l_hip_pitch + angles.r_hip_pitch) * 0.3;
  const gyroRoll = (rootRotation.roll * 180) / Math.PI + (angles.l_hip_roll + angles.r_hip_roll) * 0.5;
  const gyroYaw = (rootRotation.yaw * 180) / Math.PI + angles.head_yaw * 0.2;

  const telemetry: StabilityTelemetry = {
    com: {
      x: Number(worldCoM.x.toFixed(2)),
      y: Number(worldCoM.y.toFixed(2)),
      z: Number(worldCoM.z.toFixed(2)),
    },
    status,
    margin: Number(margin.toFixed(1)),
    gyro: {
      pitch: Number(gyroPitch.toFixed(1)),
      roll: Number(gyroRoll.toFixed(1)),
      yaw: Number(gyroYaw.toFixed(1)),
    },
    accel: {
      x: Number(((worldCoM.x * 2.5)).toFixed(2)),
      y: Number((9.81 - (1.43 - worldCoM.y) * 4.2).toFixed(2)),
      z: Number(((worldCoM.z * 2.1)).toFixed(2)),
    },
    leftFootContact: worldLeftFoot.grounded,
    rightFootContact: worldRightFoot.grounded,
    footPressureL,
    footPressureR,
    yawTorque: netYawTorque,
  };

  return {
    telemetry,
    comWorld: worldCoM,
    supportPolygon: polygonPoints,
    feetPositions: {
      left: worldLeftFoot,
      right: worldRightFoot,
    },
  };
}

/**
 * Physical self-collision prevention for humanoid bipedal legs:
 * Detects when moving one leg inward towards the other leg would cause the thighs, knees,
 * or feet to collide/penetrate. Clamps the angle to the exact physical contact limit.
 */
export function getLegRollCollisionLimit(
  jointId: 'l_hip_roll' | 'r_hip_roll',
  targetAngle: number,
  otherAngle: number,
  lPitch: number = 0,
  rPitch: number = 0,
  lKnee: number = 0,
  rKnee: number = 0,
  isMirrorMode: boolean = false
): { clampedAngle: number; isColliding: boolean } {
  // Check sagittal separation between feet (distance in Z)
  const zL = Math.sin((lPitch * Math.PI) / 180) * 0.56 + Math.sin(((lPitch + lKnee) * Math.PI) / 180) * 0.58;
  const zR = Math.sin((rPitch * Math.PI) / 180) * 0.56 + Math.sin(((rPitch + rKnee) * Math.PI) / 180) * 0.58;
  const dZ = Math.abs(zL - zR);

  // If one leg is stepped forward past the other (stride > foot depth 0.44m), they can cross freely
  if (dZ >= 0.44) {
    return { clampedAngle: targetAngle, isColliding: false };
  }

  // Margin scaling factor as feet align in sagittal plane
  const zFactor = Math.max(0.2, 1 - dZ / 0.44);
  const maxSinDiff = 0.117 * zFactor;

  if (isMirrorMode) {
    // Both legs move symmetrically: Left moves inward (negative) and Right moves inward (positive)
    const maxSymSin = maxSinDiff / 2;
    const maxSymDeg = Math.asin(Math.max(-1, Math.min(1, maxSymSin))) * (180 / Math.PI);

    if (jointId === 'l_hip_roll') {
      if (targetAngle < -maxSymDeg) {
        return { clampedAngle: -Math.round(maxSymDeg * 10) / 10, isColliding: true };
      }
    } else {
      if (targetAngle > maxSymDeg) {
        return { clampedAngle: Math.round(maxSymDeg * 10) / 10, isColliding: true };
      }
    }
    return { clampedAngle: targetAngle, isColliding: false };
  }

  if (jointId === 'l_hip_roll') {
    // Left leg rolling inward (negative) towards right leg
    const sinOther = Math.sin((otherAngle * Math.PI) / 180);
    const minSinAllowed = sinOther - maxSinDiff;
    const minDegAllowed = Math.asin(Math.max(-1, Math.min(1, minSinAllowed))) * (180 / Math.PI);

    if (targetAngle < minDegAllowed) {
      return { clampedAngle: Math.round(minDegAllowed * 10) / 10, isColliding: true };
    }
  } else {
    // Right leg rolling inward (positive) towards left leg
    const sinOther = Math.sin((otherAngle * Math.PI) / 180);
    const maxSinAllowed = sinOther + maxSinDiff;
    const maxDegAllowed = Math.asin(Math.max(-1, Math.min(1, maxSinAllowed))) * (180 / Math.PI);

    if (targetAngle > maxDegAllowed) {
      return { clampedAngle: Math.round(maxDegAllowed * 10) / 10, isColliding: true };
    }
  }

  return { clampedAngle: targetAngle, isColliding: false };
}

