import { Mission, CodeBlock } from '../types/robot';

export const MISSIONS: Mission[] = [
  {
    id: 1,
    title: 'Mission 1: Zero Trim & Diagnostics',
    category: 'Basics',
    badge: 'Servo Mechanic',
    challengeType: 'Tutorial (Run As-Is)',
    conceptLearned: '17 Degrees of Freedom & Servo Neutral Calibration',
    studentTask: 'Orientation Tutorial: Click "Load Tutorial Code", then click "RUN CODE" to watch all 17 high-torque servos calibrate to exactly 0° neutral trim.',
    summary: 'Calibrate all 17 high-torque servos to their mechanical zero trim positions.',
    conceptTheory:
      'In humanoid robotics, Degrees of Freedom (DOF) refer to independent axes of motion: 1 in the head, 3 in each arm (6), and 5 in each leg (10). Before any biped can walk, every motor must calibrate to 0° neutral trim so the computer knows joint positions.',
    taskInstructions: [
      'Load the tutorial starter code into the workspace.',
      'Click "RUN CODE" to execute the zero-trim routine.',
      'Observe all 17 joints straighten to 0° and verify the robot stands tall and stable.',
    ],
    tips: [
      'This tutorial mission requires no modifications: just load and run to get familiar with the workspace!',
      'Watch the servo status turn green when calibrated to 0°.',
    ],
    starterBlocks: [
      { id: 'b1_1', type: 'apply_pose', params: { poseId: 'zero' } },
      { id: 'b1_2', type: 'set_eye_color', params: { color: '#00e5ff' } },
      { id: 'b1_3', type: 'play_sound', params: { sound: 'boot' } },
    ],
    solutionExplanation:
      'Applying the Zero Trim preset synchronizes all servo encoders to 0 degrees, verifying mechanical linkage integrity.',
    requirements: [
      {
        id: 'r1_1',
        label: 'All 17 servos aligned within ±3° of 0°',
        check: ({ angles }) => Object.values(angles).every((val) => Math.abs(val) <= 3),
      },
      {
        id: 'r1_2',
        label: 'Robot chassis is upright and stable',
        check: ({ telemetry }) => telemetry.status === 'stable',
      },
    ],
    rewardXP: 100,
  },
  {
    id: 2,
    title: 'Mission 2: Hello World (Parameter Tuning)',
    category: 'Basics',
    badge: 'Gesture Architect',
    challengeType: 'Parameter Tuning',
    conceptLearned: 'Loop Repetition Counts & Dynamic Servo Angles',
    studentTask: 'Tune the wave parameters: 1) Increase the Repeat loop from 1 to at least 3 times. 2) Change the waving elbow angle from 45° to 80° so the wave is clear and energetic!',
    summary: 'Coordinate right arm servos to perform an enthusiastic greeting by tuning loop iterations and angles.',
    conceptTheory:
      'Robotics gestures depend on timing and repetition. A single small twitch does not look like a friendly greeting. By adjusting loop iterations (`repeat times`) and increasing joint amplitude (degrees), we make the gesture natural and expressive.',
    taskInstructions: [
      'Load the starter code. Notice that the repeat loop is only set to 1, and the elbow angle is only 45°.',
      'Click on the "Repeat" block input and change it from 1 to 3 (or 4).',
      'Change the first Turn Servo elbow angle inside the loop from 45° to 80°.',
      'Run the code and watch your robot give a friendly wave!',
    ],
    tips: [
      'Inside the repeat block, the first elbow angle should be 75° to 85°, and the second should be 20° to 30°.',
      'The wait delays (0.3s) ensure servos have time to reach their target positions.',
    ],
    starterBlocks: [
      { id: 'b2_0', type: 'set_eye_color', params: { color: '#00e5ff' } },
      { id: 'b2_1', type: 'set_servo', params: { joint: 'r_shoulder_pitch', angle: -85, duration: 400 } },
      { id: 'b2_2', type: 'set_servo', params: { joint: 'r_shoulder_roll', angle: -65, duration: 400 } },
      { id: 'b2_3', type: 'wait', params: { seconds: 0.4 } },
      {
        id: 'b2_4',
        type: 'repeat',
        params: { times: 1 }, // Student needs to increase to >= 3!
        children: [
          { id: 'b2_5', type: 'set_servo', params: { joint: 'r_elbow_pitch', angle: 45, duration: 300 } }, // Student needs to change from 45° to 80°!
          { id: 'b2_6', type: 'wait', params: { seconds: 0.3 } },
          { id: 'b2_7', type: 'set_servo', params: { joint: 'r_elbow_pitch', angle: 25, duration: 300 } },
          { id: 'b2_8', type: 'wait', params: { seconds: 0.3 } },
        ],
      },
    ],
    solutionExplanation:
      'Elevating the shoulder establishes the arm plane, while a repeating loop oscillating between 80° and 25° creates a distinct biped greeting.',
    requirements: [
      {
        id: 'r2_1',
        label: 'Right shoulder elevated into greeting position (pitch < -50° or roll < -40°)',
        check: ({ angles }) => angles.r_shoulder_pitch < -50 || angles.r_shoulder_roll < -40,
      },
      {
        id: 'r2_2',
        label: 'Repeat loop set to at least 3 repetitions (times ≥ 3)',
        check: ({ executedBlocks }) =>
          Boolean(executedBlocks?.some((b) => b.type === 'repeat' && Number(b.params.times) >= 3)),
      },
      {
        id: 'r2_3',
        label: 'Waving elbow angle in the loop tuned to 80° (angle ≥ 80°)',
        check: ({ executedBlocks }) =>
          Boolean(
            executedBlocks?.some(
              (b) =>
                b.type === 'repeat' &&
                b.children?.some(
                  (c) =>
                    c.type === 'set_servo' &&
                    c.params.joint === 'r_elbow_pitch' &&
                    Number(c.params.angle) >= 80
                )
            )
          ),
      },
      {
        id: 'r2_4',
        label: 'Robot maintains balance throughout the gesture',
        check: ({ telemetry }) => telemetry.status === 'stable',
      },
    ],
    rewardXP: 150,
  },
  {
    id: 3,
    title: 'Mission 3: Center of Mass & The Knee Bend Bug',
    category: 'Kinematics',
    badge: 'Equilibrium Pioneer',
    challengeType: 'Bug Fix',
    conceptLearned: 'Center of Mass (CoM) Projection & Bilateral Symmetry',
    studentTask: 'Bug Fix: The starter code only bends the LEFT knee, causing uneven weight distribution. Add a "Turn Servo" block for the Right Knee Pitch (set to 28°) so both legs bend equally!',
    summary: 'Fix an asymmetrical knee bend bug to restore bilateral balance and optimize the Center of Mass.',
    conceptTheory:
      'The Center of Mass (CoM) is the point where the robot weight is centered. For stability, the CoM plumb line must fall in the geometric center of both feet. If only one knee bends, the pelvis tilts sideways, reducing the stability margin dangerously.',
    taskInstructions: [
      'Load the starter code and look at the blocks. Notice it only bends "L Knee Pitch"!',
      'Click "+ Add Block", select "Turn Servo", and choose "R Knee Pitch".',
      'Set the angle to 28° (matching the left knee) and duration to 300ms.',
      'Run the code: both knees will flex in unison, lowering the CoM safely with green stability!',
    ],
    tips: [
      'Both knees should be between 20° and 35°.',
      'Watch the stability margin in the telemetry readout jump above 4.0 cm when both knees match!',
    ],
    starterBlocks: [
      { id: 'b3_1', type: 'apply_pose', params: { poseId: 'ready' } },
      { id: 'b3_2', type: 'set_servo', params: { joint: 'l_knee_pitch', angle: 28, duration: 300 } },
      // Missing R Knee Pitch block! Student must add it.
      { id: 'b3_3', type: 'wait', params: { seconds: 0.8 } },
    ],
    solutionExplanation:
      'Bending both knees symmetrically lowers the center of mass and keeps the vertical gravity vector centered between both feet.',
    requirements: [
      {
        id: 'r3_1',
        label: 'Left Knee flexed to 28° (25° - 32°)',
        check: ({ angles }) => angles.l_knee_pitch >= 25 && angles.l_knee_pitch <= 32,
      },
      {
        id: 'r3_2',
        label: 'Right Knee servo block added and set to 28° (25° - 32°)',
        check: ({ angles, executedBlocks }) => {
          const hasRkneeBlock = Boolean(
            executedBlocks?.some(
              (b) =>
                b.type === 'set_servo' &&
                b.params.joint === 'r_knee_pitch' &&
                Number(b.params.angle) >= 25 &&
                Number(b.params.angle) <= 32
            )
          );
          return hasRkneeBlock && angles.r_knee_pitch >= 25 && angles.r_knee_pitch <= 32;
        },
      },
      {
        id: 'r3_3',
        label: 'Bilateral symmetry: both knees match within ±3° with stable margin ≥ 4.0 cm',
        check: ({ angles, telemetry }) =>
          Math.abs(angles.l_knee_pitch - angles.r_knee_pitch) <= 3 &&
          telemetry.status === 'stable' &&
          telemetry.margin >= 4.0,
      },
    ],
    rewardXP: 200,
  },
  {
    id: 4,
    title: 'Mission 4: The Coordinated Squat',
    category: 'Kinematics',
    badge: 'Kinematic Synchronizer',
    challengeType: 'Add Missing Blocks',
    conceptLearned: 'Closed-Chain Kinematics & Multi-Joint Counter-Rotation',
    studentTask: 'Add Counter-Balance Blocks: Bending only knees makes the robot fall backwards! Add Hip Pitch (-40°) and Ankle Pitch (-35°) counter-rotation blocks to keep the soles flat and torso balanced.',
    summary: 'Coordinate 6 lower-body servos (hips, knees, ankles) to perform a deep squat without falling.',
    conceptTheory:
      'In a squat, bending knees pushes the body mass backward. To prevent toppling, humanoids use kinematic counter-rotation: hips pitch forward, knees bend, and ankles counter-pitch forward by an equal amount so the feet stay parallel to the floor.',
    taskInstructions: [
      'Load the starter code. It only has knee blocks (75°).',
      'Add Turn Servo blocks to pitch both hips forward: "L Hip Pitch" to -40° and "R Hip Pitch" to -40°.',
      'Add Turn Servo blocks to counter-pitch ankles: "L Ankle Pitch" to -35° and "R Ankle Pitch" to -35°.',
      'Run the code to perform a deep, perfectly counter-balanced robot squat!',
    ],
    tips: [
      'Kinematic formula: Ankle Angle + Hip Angle roughly equals -Knee Angle.',
      'Keep hip pitch between -30° and -50°, and ankle pitch between -25° and -45°.',
    ],
    starterBlocks: [
      { id: 'b4_0', type: 'apply_pose', params: { poseId: 'ready' } },
      { id: 'b4_1', type: 'set_servo', params: { joint: 'l_knee_pitch', angle: 75, duration: 400 } },
      { id: 'b4_2', type: 'set_servo', params: { joint: 'r_knee_pitch', angle: 75, duration: 400 } },
      // Student needs to add hip pitch and ankle pitch counter-rotation blocks!
    ],
    solutionExplanation:
      'Coordinated counter-rotation between knees, hips, and ankles drops the center of gravity while preserving the vertical projection over the foot soles.',
    requirements: [
      {
        id: 'r4_1',
        label: 'Both knees flexed deeply (≥ 55°)',
        check: ({ angles }) => angles.l_knee_pitch >= 55 && angles.r_knee_pitch >= 55,
      },
      {
        id: 'r4_2',
        label: 'Both hips counter-pitched forward with servo blocks (≤ -30°)',
        check: ({ angles, executedBlocks }) => {
          const hasHipBlocks =
            !executedBlocks ||
            executedBlocks.length === 0 ||
            executedBlocks.some(
              (b) =>
                (b.type === 'set_servo' &&
                  (b.params.joint === 'l_hip_pitch' || b.params.joint === 'r_hip_pitch') &&
                  Number(b.params.angle) <= -30) ||
                b.type === 'squat' ||
                (b.type === 'apply_pose' && b.params.poseId === 'squat')
            );
          return hasHipBlocks && angles.l_hip_pitch <= -30 && angles.r_hip_pitch <= -30;
        },
      },
      {
        id: 'r4_3',
        label: 'Both ankles counter-pitched with servo blocks (≤ -25°)',
        check: ({ angles, executedBlocks }) => {
          const hasAnkleBlocks =
            !executedBlocks ||
            executedBlocks.length === 0 ||
            executedBlocks.some(
              (b) =>
                (b.type === 'set_servo' &&
                  (b.params.joint === 'l_ankle_pitch' || b.params.joint === 'r_ankle_pitch') &&
                  Number(b.params.angle) <= -25) ||
                b.type === 'squat' ||
                (b.type === 'apply_pose' && b.params.poseId === 'squat')
            );
          return hasAnkleBlocks && angles.l_ankle_pitch <= -25 && angles.r_ankle_pitch <= -25;
        },
      },
      {
        id: 'r4_4',
        label: 'Robot stays upright without toppling',
        check: ({ telemetry }) =>
          telemetry.status === 'stable' || (telemetry.status === 'dynamic' && telemetry.margin >= 0),
      },
    ],
    rewardXP: 250,
  },
  {
    id: 5,
    title: 'Mission 5: Crane Stance (Weight Shift First)',
    category: 'Locomotion',
    badge: 'Crane Master',
    challengeType: 'Sequencing & Logic',
    conceptLearned: 'Support Polygon Reduction & Pre-Shifting Weight',
    studentTask: 'Sequencing Challenge: The starter code lifts the right leg immediately without shifting weight and falls! Add weight-shift blocks (L Hip Roll +16°, L Ankle Roll -16°) followed by a Wait block (0.4s), and sequence them BEFORE the right leg lift blocks.',
    summary: 'Master single-leg balance by transferring body weight to the stance foot before lifting the swing leg.',
    conceptTheory:
      'When standing on both feet, the support polygon spans both soles. When lifting one leg, the polygon shrinks to a single foot! You MUST roll the hips and ankles to shift 100% of body mass directly over the stance foot BEFORE the other foot leaves the ground.',
    taskInstructions: [
      'Step 1: Click "Run Current Code" on the loaded program. Notice that the robot immediately lifts its right leg without shifting weight, causing it to fall!',
      'Step 2: Add two weight-shift blocks: Turn Servo "L Hip Roll" to +16° (leans body weight over left foot) and "L Ankle Roll" to -16° (keeps the left foot sole flat on the ground).',
      'Step 3: Add a Wait block (set to 0.4s) immediately after the roll blocks so the robot settles its weight onto the left foot before trying to lift.',
      'Step 4: Reorder the blocks from top to bottom so the weight transfer happens FIRST: (1) Play Pose "ready" ➔ (2) L Hip Roll +16° & L Ankle Roll -16° ➔ (3) Wait 0.4s ➔ (4) R Knee Pitch 90° & R Hip Pitch -65°. (Use the ▲ / ▼ arrow buttons on each block to move them).',
      'Step 5: Click "Run Current Code" to watch the robot smoothly shift weight onto its left foot, pause, and lift into the one-legged Karate Crane Stance!',
    ],
    tips: [
      'Use the ▲ and ▼ buttons on each block to easily move blocks up or down in your program list.',
      'L Hip Roll (+16°) tilts the pelvis over the stance leg, while L Ankle Roll (-16°) keeps the left sole flat on the floor.',
      'The Wait block separates the weight shift from the leg lift so both motions do not execute at the exact same time.',
      'Watch the Left Foot Pressure bar reach 100% before the right foot lifts into the air!',
    ],
    starterBlocks: [
      { id: 'b5_1', type: 'apply_pose', params: { poseId: 'ready' } },
      // Buggy order: lifts right leg without pre-shifting weight first!
      { id: 'b5_2', type: 'set_servo', params: { joint: 'r_knee_pitch', angle: 90, duration: 400 } },
      { id: 'b5_3', type: 'set_servo', params: { joint: 'r_hip_pitch', angle: -65, duration: 400 } },
      { id: 'b5_4', type: 'wait', params: { seconds: 0.5 } },
    ],
    solutionExplanation:
      'Pre-loading the left stance foot via hip and ankle roll moves the center of mass completely inside the left foot sole before the right leg takes off.',
    requirements: [
      {
        id: 'r5_1',
        label: 'Weight-shift servo blocks added (L Hip Roll ≥ 12° & L Ankle Roll ≤ -12°)',
        check: ({ angles, executedBlocks }) => {
          const hasHipRoll = Boolean(
            executedBlocks?.some(
              (b) => b.type === 'set_servo' && b.params.joint === 'l_hip_roll' && Number(b.params.angle) >= 12
            )
          );
          const hasAnkleRoll = Boolean(
            executedBlocks?.some(
              (b) => b.type === 'set_servo' && b.params.joint === 'l_ankle_roll' && Number(b.params.angle) <= -12
            )
          );
          return hasHipRoll && hasAnkleRoll && angles.l_hip_roll >= 12 && angles.l_ankle_roll <= -12;
        },
      },
      {
        id: 'r5_2',
        label: 'Pre-shift & pause sequenced BEFORE leg lift (Weight shift & Wait precede right leg lift)',
        check: ({ executedBlocks }) => {
          if (!executedBlocks) return false;
          const hipRollIdx = executedBlocks.findIndex(
            (b) => b.type === 'set_servo' && b.params.joint === 'l_hip_roll' && Number(b.params.angle) >= 12
          );
          const waitIdx = executedBlocks.findIndex((b) => b.type === 'wait');
          const legLiftIdx = executedBlocks.findIndex(
            (b) => b.type === 'set_servo' && (b.params.joint === 'r_knee_pitch' || b.params.joint === 'r_hip_pitch')
          );
          const hipBeforeLift = hipRollIdx !== -1 && legLiftIdx !== -1 && hipRollIdx < legLiftIdx;
          const waitBeforeLift = waitIdx !== -1 && legLiftIdx !== -1 && waitIdx < legLiftIdx;
          return hipBeforeLift && waitBeforeLift;
        },
      },
      {
        id: 'r5_3',
        label: 'Right swing leg lifted off the ground (R Knee Pitch ≥ 60°)',
        check: ({ angles }) => angles.r_knee_pitch >= 60,
      },
      {
        id: 'r5_4',
        label: 'Robot stays upright on one foot (Crane stance with stable margin ≥ 4.0 cm)',
        check: ({ telemetry }) =>
          telemetry.status === 'stable' &&
          telemetry.margin >= 4.0 &&
          telemetry.leftFootContact &&
          !telemetry.rightFootContact,
      },
    ],
    rewardXP: 300,
  },
  {
    id: 6,
    title: 'Mission 6: The Walking Stride (Counter-Balance Swing)',
    category: 'Locomotion',
    badge: 'Bipedal Navigator',
    challengeType: 'Counter-Balance',
    conceptLearned: "Newton's 3rd Law & Reciprocal Dual-Arm Counter-Torque",
    studentTask: 'Counter-Balance Challenge: The starter code steps the Left Leg forward, but both arms hang motionless by the sides. Add Turn Servo blocks for BOTH arms — swing the Right Shoulder forward (-35°) AND swing the Left Shoulder backward (+20°) — to neutralize torso twisting and balance the stride!',
    summary: 'Coordinate reciprocal dual-arm motion to balance a forward leg stride and eliminate pelvic yaw twist.',
    conceptTheory:
      "Why swing both arms when walking? Newton's 3rd Law states that every action creates an equal and opposite reaction. When the heavy left leg strides forward, the hip servo exerts a twisting rotational torque (yaw) on the pelvis and torso. If arms stay still or only one arm moves, this uncountered rotational torque twists the torso away from the path. In real humanoids and humans, BOTH arms swing reciprocally: the opposite arm (Right) swings forward to neutralize leg momentum, while the same-side arm (Left) swings backward. Together, both arms cancel out 100% of the torso twisting torque, keeping the robot walking straight!",
    taskInstructions: [
      'Load and run the starter code. Watch the robot step its Left Leg forward while both arms remain frozen by its sides: notice the torso twist off-course and the "Yaw Twist: +8.8 N·m" alert pill appear!',
      'Add a Turn Servo block: Joint "R Shoulder Pitch", Angle -35° (swings the right arm forward opposite to the left leg).',
      'Add a Turn Servo block: Joint "L Shoulder Pitch", Angle +20° (swings the left arm backward to provide full reciprocal balance).',
      'Run the code: observe both arms swinging in opposite directions — neutralizing Torso Twist to 0.0 N·m and restoring a straight, balanced stride!',
    ],
    tips: [
      'Biomechanics Rule: Left leg forward ➔ Right arm swings forward (-35°) AND Left arm swings backward (+20°)!',
      'Why both arms? If you only swing one arm, the torso still experiences unbalanced torque. Both arms are required to fully neutralize yaw torque (|Yaw Torque| ≤ 3.0 N·m).',
      'Look at the Telemetry pill at the top-right: Watch the "Yaw Twist" alert disappear once both arm servos are active and balanced.',
    ],
    starterBlocks: [
      { id: 'b6_1', type: 'apply_pose', params: { poseId: 'ready' } },
      { id: 'b6_2', type: 'set_servo', params: { joint: 'l_hip_pitch', angle: -35, duration: 400 } },
      { id: 'b6_3', type: 'set_servo', params: { joint: 'l_knee_pitch', angle: 30, duration: 400 } },
      // Student must add BOTH arm counter-balance blocks below:
      // 1) R Shoulder Pitch -> -35°
      // 2) L Shoulder Pitch -> +20°
      { id: 'b6_4', type: 'wait', params: { seconds: 0.6 } },
    ],
    solutionExplanation:
      'Reciprocal dual-arm swinging neutralizes pelvic rotational momentum during bipedal gait initiation.',
    requirements: [
      {
        id: 'r6_1',
        label: 'Left leg stepped forward into stride (L Hip Pitch ≤ -25°)',
        check: ({ angles }) => angles.l_hip_pitch <= -25,
      },
      {
        id: 'r6_2',
        label: 'Right arm swung forward opposite to left leg (R Shoulder Pitch ≤ -25°)',
        check: ({ angles, executedBlocks }) => {
          const hasRightShoulderBlock = Boolean(
            executedBlocks?.some(
              (b) =>
                b.type === 'set_servo' &&
                b.params.joint === 'r_shoulder_pitch' &&
                Number(b.params.angle) <= -25
            )
          );
          return hasRightShoulderBlock && angles.r_shoulder_pitch <= -25;
        },
      },
      {
        id: 'r6_3',
        label: 'Left arm swung backward for reciprocal balance (L Shoulder Pitch ≥ +15°)',
        check: ({ angles, executedBlocks }) => {
          const hasLeftShoulderBlock = Boolean(
            executedBlocks?.some(
              (b) =>
                b.type === 'set_servo' &&
                b.params.joint === 'l_shoulder_pitch' &&
                Number(b.params.angle) >= 15
            )
          );
          return hasLeftShoulderBlock && angles.l_shoulder_pitch >= 15;
        },
      },
      {
        id: 'r6_4',
        label: 'Torso yaw torque neutralized with both arms (|Yaw Torque| ≤ 3.0 N·m)',
        check: ({ telemetry, angles }) =>
          telemetry.status === 'stable' &&
          telemetry.yawTorque !== undefined &&
          Math.abs(telemetry.yawTorque) <= 3.0 &&
          angles.r_shoulder_pitch <= -25 &&
          angles.l_shoulder_pitch >= 15,
      },
    ],
    rewardXP: 350,
  },
  {
    id: 7,
    title: 'Mission 7: The Walking Cycle Loop',
    category: 'Locomotion',
    badge: 'Gait Master',
    challengeType: 'Loop Algorithm',
    conceptLearned: 'Cyclic Gait Automation with Repeat Loops',
    studentTask: 'Algorithm Challenge: One step is not a walk! 1) Wrap the steps inside a Repeat loop (at least 2 times). 2) Add the alternating Right Step stride and pauses so the robot walks continuously.',
    summary: 'Automate continuous walking locomotion by constructing a repeating gait cycle loop.',
    conceptTheory:
      'Humanoid locomotion is a cyclic state machine: Left Step -> Double Support -> Right Step -> Double Support. In robotics programming, repeating loops eliminate redundant code and automate rhythmic tasks.',
    taskInstructions: [
      'Load the starter code. It only contains one single step.',
      'Add a "Repeat Loop" block set to at least 2 iterations.',
      'Inside the loop, alternate between "Play Pose: Walk: Left Forward Stride" and "Play Pose: Walk: Right Forward Stride".',
      'Insert 0.4s wait delays between strides to allow physical momentum transfer.',
      'Run the code to see your robot execute a continuous multi-step bipedal walk!',
    ],
    tips: [
      'Without wait pauses between poses, servos jump abruptly. Add 0.4s to 0.5s pauses!',
      'Watch the telemetry foot pressure indicators alternate rhythmically between left and right feet.',
    ],
    starterBlocks: [
      // Incomplete: only a single left step! Student must wrap in repeat loop with right step.
      { id: 'b7_1', type: 'apply_pose', params: { poseId: 'ready' } },
      { id: 'b7_2', type: 'apply_pose', params: { poseId: 'step_left' } },
      { id: 'b7_3', type: 'wait', params: { seconds: 0.5 } },
    ],
    solutionExplanation:
      'A loop automates rhythmic bipedal locomotion by iteratively executing reciprocal leg and arm movements.',
    requirements: [
      {
        id: 'r7_1',
        label: 'Program contains a Repeat loop block (times ≥ 2)',
        check: ({ executedBlocks }) =>
          Boolean(executedBlocks?.some((b) => b.type === 'repeat' && Number(b.params.times) >= 2)),
      },
      {
        id: 'r7_2',
        label: 'Both left and right walking strides are executed',
        check: ({ executedBlocks, angles }) => {
          const loop = executedBlocks?.find((b) => b.type === 'repeat');
          if (loop && loop.children) {
            const hasLeft = loop.children.some(
              (c) =>
                (c.type === 'step_forward' && c.params.foot === 'left') ||
                c.params.poseId === 'step_left' ||
                c.params.joint === 'l_hip_pitch'
            );
            const hasRight = loop.children.some(
              (c) =>
                (c.type === 'step_forward' && c.params.foot === 'right') ||
                c.params.poseId === 'step_right' ||
                c.params.joint === 'r_hip_pitch'
            );
            if (hasLeft && hasRight) return true;
          }
          return false;
        },
      },
      {
        id: 'r7_3',
        label: 'Completes continuous walking sequence without falling',
        check: ({ telemetry }) => telemetry.status !== 'fallen',
      },
    ],
    rewardXP: 400,
  },
  {
    id: 8,
    title: 'Mission 8: Karate Kick & Dynamic Counter-Mass',
    category: 'Dynamics',
    badge: 'Black Belt Bot',
    challengeType: 'Dynamic Physics',
    conceptLearned: 'Dynamic Kinetic Counter-Mass Extension',
    studentTask: 'Dynamic Physics Challenge: An aggressive front kick creates huge backward tipping force. Add counter-balance blocks: extend the Left Shoulder backward (+50° to +70°) and flex the support knee to absorb impact!',
    summary: 'Execute a powerful martial arts front kick while neutralizing tipping inertia with arm extension.',
    conceptTheory:
      'High-velocity martial arts strikes involve rapid mass displacement. When a heavy leg kicks forward, the chassis tilts backward. Robosen robots counter this by throwing the opposite arm backward as a kinetic counter-mass to keep the net CoM over the stance foot.',
    taskInstructions: [
      'Load the starter code. It kicks the right leg high (-80°), but arms stay motionless at 0°, threatening stability!',
      'Add a Turn Servo block: "L Shoulder Pitch" to +60° (extends the left arm backward).',
      'Add a Turn Servo block: "L Knee Pitch" to 28° (bends the stance knee for ground reaction absorption).',
      'Run the code to perform a movie-worthy martial arts kick with rock-solid dynamic balance!',
    ],
    tips: [
      'Keep the right kick hip angle <= -70°, left shoulder >= 45°, and stance knee flexed between 25° and 35°.',
      'Sound effects: add a motor whir or victory chime to celebrate the strike!',
    ],
    starterBlocks: [
      { id: 'b8_1', type: 'apply_pose', params: { poseId: 'ready' } },
      { id: 'b8_2', type: 'wait', params: { seconds: 0.3 } },
      { id: 'b8_3', type: 'set_servo', params: { joint: 'r_hip_pitch', angle: -80, duration: 400 } },
      // Missing counter-mass arm extension & stance knee flex! Student adds them here.
    ],
    solutionExplanation:
      'Extending the left arm rearward creates an opposing lever-arm that counteracts forward leg momentum, while flexing the stance knee grounds the pelvis and absorbs strike reaction force.',
    requirements: [
      {
        id: 'r8_1',
        label: 'Right kick angle elevated high (hip pitch ≤ -70°)',
        check: ({ angles }) => angles.r_hip_pitch <= -70,
      },
      {
        id: 'r8_2',
        label: 'Opposite arm counter-extended rearward with L Shoulder Pitch block (≥ 45°)',
        check: ({ angles, executedBlocks }) => {
          const hasArmBlock = Boolean(
            executedBlocks?.some(
              (b) =>
                b.type === 'set_servo' &&
                b.params.joint === 'l_shoulder_pitch' &&
                Number(b.params.angle) >= 45
            )
          );
          return hasArmBlock && angles.l_shoulder_pitch >= 45;
        },
      },
      {
        id: 'r8_3',
        label: 'Stance knee flexed with L Knee Pitch block (25° to 35°) for impact absorption',
        check: ({ angles, executedBlocks }) => {
          const hasKneeBlock = Boolean(
            executedBlocks?.some(
              (b) =>
                b.type === 'set_servo' &&
                b.params.joint === 'l_knee_pitch' &&
                Number(b.params.angle) >= 25 &&
                Number(b.params.angle) <= 35
            )
          );
          return hasKneeBlock && angles.l_knee_pitch >= 25 && angles.l_knee_pitch <= 35;
        },
      },
      {
        id: 'r8_4',
        label: 'Robot stays upright without toppling over (Dynamic stability margin ≥ 3.0 cm)',
        check: ({ telemetry }) =>
          (telemetry.status === 'stable' || telemetry.status === 'dynamic') &&
          telemetry.margin >= 3.0,
      },
    ],
    rewardXP: 450,
  },
  {
    id: 9,
    title: 'Mission 9: Fall Detection & Gyro Reflex',
    category: 'Dynamics',
    badge: 'Reflex Engineer',
    challengeType: 'Sensor Reflex',
    conceptLearned: 'Closed-Loop Sensor Feedback & Autonomous Emergency Reflexes',
    studentTask:
      'Sensor Reflex Lab: Open-loop programs cannot react when pushed or tilted! Start with the Stand Ready pose, then add a Gyro Reflex (`if_tilt`) inside the forever repeat loop. Inside your reflex, add warning light, sound, and a squat recovery. Run the program and use your keyboard [W/S or Up/Down Arrow Keys] to move the legs forward/back and test the robot with and without tilt protection!',
    summary:
      'Program a closed-loop reflex system in a forever monitoring loop using the 6-axis IMU gyroscope to protect the robot when tilted.',
    conceptTheory:
      'In open-loop control, a robot executes moves blindly—if pushed or unbalanced, it crashes. In closed-loop control, a forever loop continuously monitors sensor feedback (the 6-axis IMU gyroscope). When pitch tilt exceeds 15°, the reflex routine engages instantly to catch the robot.',
    taskInstructions: [
      'Load the starter code: it starts in Stand Ready (`ready` pose) followed by an empty forever repeat loop.',
      'Click "+ Inside" on the Repeat Loop block and select "Gyro Reflex" (`if_tilt`, threshold: 15°).',
      'Click "+ Inside" on your new empty If Tilt block and add your reflex actions: 1) Visor Light set to red (#ef4444), 2) Play Sound set to warning, 3) Apply Pose set to squat (or ready).',
      'Click "Run Program". The Mission 9 Fall & Balance Tester appears at the bottom with live IMU tilt data.',
      'Use Keyboard [W / ↑] or [S / ↓] (or the HUD buttons) while running to move the legs and tilt past 15° to trigger your reflex!',
      'Comparison Test: Toggle [Reflex: ON] to OFF in the bottom HUD to see the robot crash helplessly without its reflex protection.',
    ],
    tips: [
      'The forever loop runs continuously while you experiment. You can click [■ STOP] anytime to halt the program.',
      'In the steady Ready Pose, IMU tilt is ~7° (safe). Pressing [W / ↑] tilts the hips forward until tilt passes 15°, triggering the reflex.',
      'Click "+ Inside" on any container block (like Repeat or If Tilt) to add nested blocks inside it.',
      'You can also click [Reflex: ON / OFF] in the bottom HUD to instantly compare protected closed-loop behavior vs unprotected open-loop tipping.',
    ],
    starterBlocks: [
      { id: 'b9_1', type: 'apply_pose', params: { poseId: 'ready' } },
      {
        id: 'b9_2',
        type: 'repeat',
        params: { times: 'forever', forever: true },
        children: [],
      },
    ],
    solutionExplanation:
      'The program starts upright in Stand Ready, then enters a loop continuously polling the IMU gyroscope. When excessive pitch tilt (> 15°) is registered, the reflex routine engages: flashing red visor LEDs, sounding the alarm, and squatting to recover balance.',
    requirements: [
      {
        id: 'r9_1',
        label: 'Program starts in Stand Ready (`ready` pose) and includes an `if_tilt` condition in a loop',
        check: ({ executedBlocks }) => {
          const hasReady = executedBlocks?.some(
            (b) => b.type === 'apply_pose' && b.params.poseId === 'ready'
          );
          const hasTilt = (list?: CodeBlock[]): boolean => {
            if (!list) return false;
            return list.some(
              (b) => b.type === 'if_tilt' || (b.children && hasTilt(b.children))
            );
          };
          return Boolean(hasReady && hasTilt(executedBlocks));
        },
      },
      {
        id: 'r9_2',
        label: 'Reflex condition includes alert signaling (Visor Light or Alert Audio)',
        check: ({ executedBlocks }) => {
          const findTilt = (list?: CodeBlock[]): CodeBlock | undefined => {
            if (!list) return undefined;
            for (const b of list) {
              if (b.type === 'if_tilt') return b;
              if (b.children) {
                const found = findTilt(b.children);
                if (found) return found;
              }
            }
            return undefined;
          };
          const tiltBlock = findTilt(executedBlocks);
          if (!tiltBlock || !tiltBlock.children) return false;
          return tiltBlock.children.some(
            (b) => b.type === 'set_eye_color' || b.type === 'play_sound'
          );
        },
      },
      {
        id: 'r9_3',
        label: 'Reflex condition inside the loop includes a recovery pose (Squat or Ready Pose) to restore stability',
        check: ({ executedBlocks, telemetry }) => {
          const findTilt = (list?: CodeBlock[]): CodeBlock | undefined => {
            if (!list) return undefined;
            for (const b of list) {
              if (b.type === 'if_tilt') return b;
              if (b.children) {
                const found = findTilt(b.children);
                if (found) return found;
              }
            }
            return undefined;
          };
          const tiltBlock = findTilt(executedBlocks);
          if (!tiltBlock || !tiltBlock.children) return false;

          // MUST have an autonomous recovery pose block inside the if_tilt reflex
          const hasPoseBlock = tiltBlock.children.some(
            (b) =>
              (b.type === 'apply_pose' &&
                (b.params.poseId === 'squat' ||
                  b.params.poseId === 'ready' ||
                  b.params.poseId === 'stand')) ||
              b.type === 'squat'
          );

          return hasPoseBlock && telemetry.status === 'stable';
        },
      },
    ],
    rewardXP: 500,
  },
  {
    id: 10,
    title: 'Mission 10: RoboCup Penalty Kick & Championship Celebration',
    category: 'Robotics Master',
    badge: 'RoboCup Champion',
    challengeType: 'Capstone Penalty Shootout',
    conceptLearned:
      'RoboCup Dynamic Striking: Single-Leg Stance Pre-Load, Kick Swing Momentum, & Equilibrium Celebration',
    studentTask:
      'RoboCup Grand Finale: You are the Lead Robotics Coach! Program the humanoid robot to score the tournament-winning penalty kick and execute a championship celebration: 1) System Boot (Cyan visor & audio chime in Ready stance). 2) Weight Transfer (Pre-load body mass over left stance leg via L Hip Roll +16° & L Ankle Roll -16° with a 0.3s pause). 3) Power Kick (Swing Right Leg forward with R Hip Pitch ≤ -60° and R Knee Pitch ≥ 30° to strike the soccer ball into the goal net). 4) Post-Kick Stabilization (Return to Ready stance on both feet so the robot does not topple). 5) Victory Celebration (Flash Gold visor #facc15, trigger goal fanfare, and perform a celebration wave/pose without falling)!',
    summary:
      'Transfer stance weight, strike the 3D soccer ball deep into the goal net, replant both feet to prevent toppling, and celebrate the RoboCup championship with a victory pose.',
    conceptTheory:
      'In humanoid soccer competitions like RoboCup, kicking a ball is the supreme test of bipedal dynamics. When the right kicking leg takes flight, the support polygon collapses to the left sole alone. If the robot kicks without pre-shifting weight (hip and ankle roll), gravity topples the robot before foot-ball impact. Furthermore, holding the kicking leg in the air after the kick creates an ungrounded tipping torque that will cause the humanoid to fall forward unless both feet are immediately replanted onto the turf before starting the victory celebration!',
    taskInstructions: [
      'Load the starter template: Phase 1 (Visor Cyan, Boot Audio, Stand Ready, and 0.4s pause) is pre-configured.',
      'Phase 2 (Weight Shift): Add Turn Servo "L Hip Roll" to +16° and "L Ankle Roll" to -16°, followed by a Wait block (0.3s) so the robot safely anchors its entire weight onto the left stance leg.',
      'Phase 3 (The Strike Swing): Add Turn Servo "R Hip Pitch" to -65° and "R Knee Pitch" to 35° (Duration 300ms) to launch the kicking leg forward into the soccer ball, plus a Play Sound block set to "Soccer Kick"!',
      'Phase 4 (Stabilize & Plant): Add a Play Pose block ("ready") followed by a Wait (0.4s) to return both feet flat onto the turf. (Essential: if the right leg is left suspended in the air, the robot will topple and fall!).',
      'Phase 5 (Championship Celebration): Change Visor Light to Championship Gold (#facc15), Play Sound ("Goal & Whistle" or "Victory Fanfare"), and add a celebration pose (Play Pose "wave" or a repeat waving gesture loop)!',
      'Click "RUN CURRENT CODE" and watch your robot launch the ball straight into the goal net and celebrate like a champion!',
    ],
    tips: [
      'Remember: Shift weight onto the left leg BEFORE kicking with the right leg, otherwise the robot topples sideways!',
      'Watch the 3D soccer ball launch across the green pitch deep into the goal net when the right foot connects!',
      'Phase 4 is required: Re-planting both feet onto the turf prevents the robot from toppling over after the kick.',
      'Phase 5 requires all three elements: Gold visor (#facc15), celebration sound, AND a celebration pose/wave!',
      'Use the "↺ Re-spot Ball" button in the 3D viewport anytime to place the soccer ball back on the penalty spot.',
    ],
    starterBlocks: [
      // Phase 1: Boot & Target Alignment
      { id: 'b10_1', type: 'set_eye_color', params: { color: '#00e5ff' } },
      { id: 'b10_2', type: 'play_sound', params: { sound: 'boot' } },
      { id: 'b10_3', type: 'apply_pose', params: { poseId: 'ready' } },
      { id: 'b10_4', type: 'wait', params: { seconds: 0.4 } },
      // Student builds the championship sequence below:
      // 1) Weight Shift: L Hip Roll +16°, L Ankle Roll -16°, Wait 0.3s
      // 2) Strike Swing: R Hip Pitch -65°, R Knee Pitch 35°, Play Sound 'kick'
      // 3) Stabilize: Play Pose 'ready', Wait 0.4s
      // 4) Celebration: Visor Gold #facc15, Play Sound 'goal', Play Pose 'wave' (or Repeat wave loop)
    ],
    solutionExplanation:
      'The penalty kick coordinates pre-emptive single-leg weight shift, dynamic momentum transfer through the swing leg into the ball, rapid ground replanting to prevent toppling, and celebration pose execution.',
    requirements: [
      {
        id: 'r10_1',
        label: 'Phase 2: Weight-shift pre-load on left stance leg (L Hip Roll ≥ 12° & L Ankle Roll ≤ -12°)',
        check: ({ executedBlocks }) => {
          const collectBlocks = (list?: CodeBlock[]): CodeBlock[] => {
            if (!list) return [];
            let out: CodeBlock[] = [];
            for (const b of list) {
              out.push(b);
              if (b.children) out = out.concat(collectBlocks(b.children));
            }
            return out;
          };
          const all = collectBlocks(executedBlocks);
          const hasHipRoll = all.some(
            (b) => b.type === 'set_servo' && b.params.joint === 'l_hip_roll' && Number(b.params.angle) >= 12
          );
          const hasAnkleRoll = all.some(
            (b) => b.type === 'set_servo' && b.params.joint === 'l_ankle_roll' && Number(b.params.angle) <= -12
          );
          return Boolean(hasHipRoll && hasAnkleRoll);
        },
      },
      {
        id: 'r10_2',
        label: 'Phase 3: Kicking swing sequence (R Hip Pitch ≤ -50° swinging forward to shoot ball)',
        check: ({ executedBlocks }) => {
          const collectBlocks = (list?: CodeBlock[]): CodeBlock[] => {
            if (!list) return [];
            let out: CodeBlock[] = [];
            for (const b of list) {
              out.push(b);
              if (b.children) out = out.concat(collectBlocks(b.children));
            }
            return out;
          };
          const all = collectBlocks(executedBlocks);
          return all.some(
            (b) => b.type === 'set_servo' && b.params.joint === 'r_hip_pitch' && Number(b.params.angle) <= -50
          );
        },
      },
      {
        id: 'r10_3',
        label: 'Goal Scored! (Soccer ball struck and launched deep into the goal net)',
        check: ({ ballScored }) => Boolean(ballScored),
      },
      {
        id: 'r10_4',
        label: 'Phase 4: Post-Kick Stabilization (Both feet replanted flat on turf in ready stance)',
        check: ({ angles, telemetry, ballScored, executedBlocks }) => {
          if (!ballScored) return false;
          const collectBlocks = (list?: CodeBlock[]): CodeBlock[] => {
            if (!list) return [];
            let out: CodeBlock[] = [];
            for (const b of list) {
              out.push(b);
              if (b.children) out = out.concat(collectBlocks(b.children));
            }
            return out;
          };
          const all = collectBlocks(executedBlocks);
          const hasRecoveryBlock = all.some(
            (b) =>
              (b.type === 'apply_pose' && (b.params.poseId === 'ready' || b.params.poseId === 'zero')) ||
              b.type === 'reset_pose' ||
              (b.type === 'set_servo' && b.params.joint === 'r_hip_pitch' && Number(b.params.angle) >= -20)
          );
          const bothFeetPlanted =
            telemetry.leftFootContact &&
            telemetry.rightFootContact &&
            angles.r_hip_pitch >= -20 &&
            angles.l_hip_pitch >= -20;
          return Boolean(hasRecoveryBlock && bothFeetPlanted && telemetry.status !== 'fallen');
        },
      },
      {
        id: 'r10_5',
        label: 'Phase 5: Championship Celebration (Gold Visor, Goal/Victory Sound, & Celebration Wave Pose)',
        check: ({ executedBlocks, ballScored, telemetry }) => {
          if (!ballScored) return false;
          if (telemetry.status === 'fallen') return false;

          const collectBlocks = (list?: CodeBlock[]): CodeBlock[] => {
            if (!list) return [];
            let out: CodeBlock[] = [];
            for (const b of list) {
              out.push(b);
              if (b.children) out = out.concat(collectBlocks(b.children));
            }
            return out;
          };
          const all = collectBlocks(executedBlocks);

          // 1. Visor color: gold/yellow or any custom celebratory color change from initial cyan
          const eyeColorBlocks = all.filter((b) => b.type === 'set_eye_color');
          const hasCelebrationColor =
            eyeColorBlocks.some(
              (b) =>
                b.params.color === '#facc15' ||
                b.params.color === '#fbbf24' ||
                b.params.color === '#eab308' ||
                b.params.color === '#ffd700' ||
                b.params.color === '#ffff00' ||
                b.params.color === '#f59e0b' ||
                b.params.color !== '#00e5ff'
            ) && eyeColorBlocks.length >= 2;

          // 2. Sound: goal, success, cheer, or any victory celebration sound
          const hasSound =
            all.some(
              (b) =>
                b.type === 'play_sound' &&
                (b.params.sound === 'goal' ||
                  b.params.sound === 'cheer' ||
                  b.params.sound === 'success')
            ) || all.filter((b) => b.type === 'play_sound').length >= 2;

          // 3. Celebration pose: wave/t_pose pose block, repeat waving loop, or celebration arm servos
          const hasCelebrationPose = all.some(
            (b) =>
              (b.type === 'apply_pose' && (b.params.poseId === 'wave' || b.params.poseId === 't_pose')) ||
              (b.type === 'repeat' &&
                b.children?.some(
                  (c) =>
                    (c.type === 'apply_pose' && (c.params.poseId === 'wave' || c.params.poseId === 't_pose')) ||
                    (c.type === 'set_servo' &&
                      (c.params.joint === 'r_elbow_pitch' ||
                        c.params.joint === 'r_shoulder_pitch' ||
                        c.params.joint === 'r_shoulder_roll' ||
                        c.params.joint === 'l_shoulder_pitch' ||
                        c.params.joint === 'l_shoulder_roll'))
                )) ||
              (b.type === 'set_servo' &&
                (b.params.joint === 'r_shoulder_pitch' || b.params.joint === 'l_shoulder_pitch') &&
                Number(b.params.angle) <= -45)
          );

          return Boolean(hasCelebrationColor && hasSound && hasCelebrationPose);
        },
      },
      {
        id: 'r10_6',
        label: 'Equilibrium Preserved (Robot finishes upright on both feet with stable margin ≥ 8.0 cm)',
        check: ({ ballScored, telemetry, angles }) =>
          Boolean(
            ballScored &&
              telemetry.status === 'stable' &&
              telemetry.margin >= 8.0 &&
              telemetry.leftFootContact &&
              telemetry.rightFootContact &&
              angles.r_hip_pitch >= -20
          ),
      },
    ],
    rewardXP: 600,
  },
];
