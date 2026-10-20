export type JointId =
  | 'head_yaw'
  | 'l_shoulder_pitch'
  | 'l_shoulder_roll'
  | 'l_elbow_pitch'
  | 'r_shoulder_pitch'
  | 'r_shoulder_roll'
  | 'r_elbow_pitch'
  | 'l_hip_roll'
  | 'l_hip_pitch'
  | 'l_knee_pitch'
  | 'l_ankle_pitch'
  | 'l_ankle_roll'
  | 'r_hip_roll'
  | 'r_hip_pitch'
  | 'r_knee_pitch'
  | 'r_ankle_pitch'
  | 'r_ankle_roll';

export interface JointConfig {
  id: JointId;
  name: string;
  group: 'head' | 'l_arm' | 'r_arm' | 'l_leg' | 'r_leg';
  min: number; // degrees
  max: number; // degrees
  defaultVal: number;
  axis: 'x' | 'y' | 'z';
  description: string;
}

export type JointAngles = Record<JointId, number>;

export const DEFAULT_JOINTS: JointAngles = {
  head_yaw: 0,
  l_shoulder_pitch: 0,
  l_shoulder_roll: 12,
  l_elbow_pitch: 20,
  r_shoulder_pitch: 0,
  r_shoulder_roll: -12,
  r_elbow_pitch: 20,
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
};

export const JOINT_CONFIGS: JointConfig[] = [
  // Head (1 DOF)
  {
    id: 'head_yaw',
    name: 'Head Pan (Yaw)',
    group: 'head',
    min: -60,
    max: 60,
    defaultVal: 0,
    axis: 'y',
    description: 'Rotates head left and right',
  },
  // Left Arm (3 DOF)
  {
    id: 'l_shoulder_pitch',
    name: 'L Shoulder Pitch',
    group: 'l_arm',
    min: -180,
    max: 180,
    defaultVal: 0,
    axis: 'x',
    description: 'Swings left arm forward / backward',
  },
  {
    id: 'l_shoulder_roll',
    name: 'L Shoulder Roll',
    group: 'l_arm',
    min: 0,
    max: 120,
    defaultVal: 12,
    axis: 'z',
    description: 'Lifts left arm outward away from torso',
  },
  {
    id: 'l_elbow_pitch',
    name: 'L Elbow Pitch',
    group: 'l_arm',
    min: 0,
    max: 135,
    defaultVal: 20,
    axis: 'x',
    description: 'Bends left elbow joint forward',
  },
  // Right Arm (3 DOF)
  {
    id: 'r_shoulder_pitch',
    name: 'R Shoulder Pitch',
    group: 'r_arm',
    min: -180,
    max: 180,
    defaultVal: 0,
    axis: 'x',
    description: 'Swings right arm forward / backward',
  },
  {
    id: 'r_shoulder_roll',
    name: 'R Shoulder Roll',
    group: 'r_arm',
    min: -120,
    max: 0,
    defaultVal: -12,
    axis: 'z',
    description: 'Lifts right arm outward away from torso',
  },
  {
    id: 'r_elbow_pitch',
    name: 'R Elbow Pitch',
    group: 'r_arm',
    min: 0,
    max: 135,
    defaultVal: 20,
    axis: 'x',
    description: 'Bends right elbow joint forward',
  },
  // Left Leg (5 DOF)
  {
    id: 'l_hip_roll',
    name: 'L Hip Roll',
    group: 'l_leg',
    min: -25,
    max: 35,
    defaultVal: 0,
    axis: 'z',
    description: 'Tilts left leg sideways (sidestepping/weight shift)',
  },
  {
    id: 'l_hip_pitch',
    name: 'L Hip Pitch',
    group: 'l_leg',
    min: -90,
    max: 45,
    defaultVal: -10,
    axis: 'x',
    description: 'Swings left leg forward / backward',
  },
  {
    id: 'l_knee_pitch',
    name: 'L Knee Pitch',
    group: 'l_leg',
    min: 0,
    max: 130,
    defaultVal: 20,
    axis: 'x',
    description: 'Bends left knee joint',
  },
  {
    id: 'l_ankle_pitch',
    name: 'L Ankle Pitch',
    group: 'l_leg',
    min: -60,
    max: 45,
    defaultVal: -10,
    axis: 'x',
    description: 'Flexes left ankle up and down (to keep foot flat)',
  },
  {
    id: 'l_ankle_roll',
    name: 'L Ankle Roll',
    group: 'l_leg',
    min: -30,
    max: 30,
    defaultVal: 0,
    axis: 'z',
    description: 'Tilts left foot sideways to adapt to floor angle',
  },
  // Right Leg (5 DOF)
  {
    id: 'r_hip_roll',
    name: 'R Hip Roll',
    group: 'r_leg',
    min: -35,
    max: 25,
    defaultVal: 0,
    axis: 'z',
    description: 'Tilts right leg sideways (sidestepping/weight shift)',
  },
  {
    id: 'r_hip_pitch',
    name: 'R Hip Pitch',
    group: 'r_leg',
    min: -90,
    max: 45,
    defaultVal: -10,
    axis: 'x',
    description: 'Swings right leg forward / backward',
  },
  {
    id: 'r_knee_pitch',
    name: 'R Knee Pitch',
    group: 'r_leg',
    min: 0,
    max: 130,
    defaultVal: 20,
    axis: 'x',
    description: 'Bends right knee joint',
  },
  {
    id: 'r_ankle_pitch',
    name: 'R Ankle Pitch',
    group: 'r_leg',
    min: -60,
    max: 45,
    defaultVal: -10,
    axis: 'x',
    description: 'Flexes right ankle up and down (to keep foot flat)',
  },
  {
    id: 'r_ankle_roll',
    name: 'R Ankle Roll',
    group: 'r_leg',
    min: -30,
    max: 30,
    defaultVal: 0,
    axis: 'z',
    description: 'Tilts right foot sideways to adapt to floor angle',
  },
];

export interface PresetPose {
  id: string;
  name: string;
  category: 'Basic' | 'Motion' | 'Action' | 'Stance';
  description: string;
  angles: Partial<JointAngles>;
}

export interface Keyframe {
  id: string;
  name: string;
  durationMs: number; // transition duration in ms
  angles: JointAngles;
}

export interface StabilityTelemetry {
  com: { x: number; y: number; z: number };
  status: 'stable' | 'dynamic' | 'unstable' | 'fallen';
  margin: number; // distance to edge in cm
  gyro: { pitch: number; roll: number; yaw: number };
  accel: { x: number; y: number; z: number };
  leftFootContact: boolean;
  rightFootContact: boolean;
  footPressureL: number; // 0 - 100%
  footPressureR: number; // 0 - 100%
  yawTorque?: number; // Net dynamic torso twisting torque in N·m (positive = CCW / left twist)
}

// Block-based code types
export type BlockType =
  | 'set_servo'
  | 'rotate_servo_by'
  | 'apply_pose'
  | 'step_forward'
  | 'shift_weight'
  | 'squat'
  | 'wait'
  | 'repeat'
  | 'if_tilt'
  | 'if_balanced'
  | 'set_eye_color'
  | 'play_sound'
  | 'reset_pose';

export interface CodeBlock {
  id: string;
  type: BlockType;
  params: Record<string, any>;
  children?: CodeBlock[]; // for repeat loops or conditional blocks
}

// Learning Progression Mission
export interface MissionRequirement {
  id: string;
  label: string;
  check: (state: {
    angles: JointAngles;
    telemetry: StabilityTelemetry;
    executedBlocks?: CodeBlock[];
    history?: any[];
    ballScored?: boolean;
  }) => boolean;
}

export interface Mission {
  id: number;
  title: string;
  category: 'Basics' | 'Kinematics' | 'Locomotion' | 'Dynamics' | 'Robotics Master';
  badge: string;
  summary: string;
  challengeType:
    | 'Tutorial (Run As-Is)'
    | 'Parameter Tuning'
    | 'Bug Fix'
    | 'Add Missing Blocks'
    | 'Sequencing & Logic'
    | 'Counter-Balance'
    | 'Loop Algorithm'
    | 'Dynamic Physics'
    | 'Sensor Reflex'
    | 'Capstone Choreography'
    | 'Autonomous Pentathlon Capstone'
    | 'Capstone Penalty Shootout';
  conceptLearned: string;
  studentTask: string;
  conceptTheory: string;
  taskInstructions: string[];
  tips: string[];
  starterBlocks: CodeBlock[];
  solutionExplanation: string;
  requirements: MissionRequirement[];
  rewardXP: number;
}
