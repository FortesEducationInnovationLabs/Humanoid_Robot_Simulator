/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  JointAngles,
  JointId,
  DEFAULT_JOINTS,
  StabilityTelemetry,
  CodeBlock,
} from './types/robot';
import { Robot3DCanvas } from './components/Robot3DCanvas';
import { ServoSliders } from './components/ServoSliders';
import { BlockCodeEditor } from './components/BlockCodeEditor';
import { MissionsPanel } from './components/MissionsPanel';
import { TelemetryOverlay } from './components/TelemetryOverlay';
import { HeaderNav } from './components/HeaderNav';
import { PRESET_POSES, calculateRobotKinematics, getLegRollCollisionLimit } from './utils/kinematics';
import { MISSIONS } from './data/missions';
import { soundManager } from './utils/audio';

export default function App() {
  // Robot Joint State
  const [jointAngles, setJointAngles] = useState<JointAngles>(DEFAULT_JOINTS);
  const [eyeColor, setEyeColor] = useState<string>('#00e5ff');

  // Simulation & Visual Options
  const [physicsMode, setPhysicsMode] = useState<boolean>(true);
  const [showCoM, setShowCoM] = useState<boolean>(true);
  const [showSupportPoly, setShowSupportPoly] = useState<boolean>(true);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Live Telemetry
  const [telemetry, setTelemetry] = useState<StabilityTelemetry>(() => {
    return calculateRobotKinematics(DEFAULT_JOINTS).telemetry;
  });

  // UI View Mode: 'missions' | 'code' | 'sliders'
  const [activeView, setActiveView] = useState<'missions' | 'code' | 'sliders'>('missions');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Visual Code Blocks
  const [blocks, setBlocks] = useState<CodeBlock[]>(() => MISSIONS[0].starterBlocks);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentRunningBlockId, setCurrentRunningBlockId] = useState<string | null>(null);

  // Progression Missions
  const [currentMissionId, setCurrentMissionId] = useState<number>(1);
  const [completedMissions, setCompletedMissions] = useState<number[]>([]);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [tiltProtectionEnabled, setTiltProtectionEnabled] = useState<boolean>(true);
  const [ballScored, setBallScored] = useState<boolean>(false);

  // Refs for async code execution engine control
  const executionAbortedRef = useRef<boolean>(false);
  const jointAnglesRef = useRef<JointAngles>(jointAngles);
  const telemetryRef = useRef<StabilityTelemetry>(telemetry);

  jointAnglesRef.current = jointAngles;
  telemetryRef.current = telemetry;

  // Single joint update handler
  const handleChangeJoint = useCallback((jointId: JointId, angle: number) => {
    setJointAngles((prev) => {
      let finalAngle = angle;
      if (jointId === 'l_hip_roll') {
        finalAngle = getLegRollCollisionLimit(
          'l_hip_roll',
          angle,
          prev.r_hip_roll ?? 0,
          prev.l_hip_pitch,
          prev.r_hip_pitch,
          prev.l_knee_pitch,
          prev.r_knee_pitch
        ).clampedAngle;
      } else if (jointId === 'r_hip_roll') {
        finalAngle = getLegRollCollisionLimit(
          'r_hip_roll',
          angle,
          prev.l_hip_roll ?? 0,
          prev.l_hip_pitch,
          prev.r_hip_pitch,
          prev.l_knee_pitch,
          prev.r_knee_pitch
        ).clampedAngle;
      }
      return {
        ...prev,
        [jointId]: finalAngle,
      };
    });
  }, []);

  // Smoothly interpolate joints over a given duration (ms)
  const animateJointsTo = useCallback((targetAngles: Partial<JointAngles>, durationMs: number = 400): Promise<void> => {
    return new Promise((resolve) => {
      const startAngles = { ...jointAnglesRef.current };
      const startTime = performance.now();
      const adjustedDuration = Math.max(durationMs, 50);

      const step = (now: number) => {
        if (executionAbortedRef.current) {
          resolve();
          return;
        }

        const elapsed = now - startTime;
        const progress = Math.min(elapsed / adjustedDuration, 1);
        const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const next: JointAngles = { ...startAngles };
        for (const [key, val] of Object.entries(targetAngles)) {
          const jointKey = key as JointId;
          const startVal = startAngles[jointKey] || 0;
          next[jointKey] = Number((startVal + (val - startVal) * ease).toFixed(1));
        }

        setJointAngles(next);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(step);
    });
  }, []);

  // Apply Pose Preset with smooth transition
  const handleApplyPose = useCallback((anglesToApply: Partial<JointAngles>) => {
    animateJointsTo(anglesToApply, 450);
  }, [animateJointsTo]);

  // Reset all joints to standard stand
  const handleResetRobot = useCallback(() => {
    executionAbortedRef.current = true;
    setIsRunning(false);
    setCurrentRunningBlockId(null);
    const defaultCopy = { ...DEFAULT_JOINTS };
    jointAnglesRef.current = defaultCopy;
    setJointAngles(defaultCopy);
    setEyeColor('#00e5ff');
    setResetTrigger((prev) => prev + 1);
    setBallScored(false);
    setTelemetry(calculateRobotKinematics(defaultCopy).telemetry);
    soundManager.playClick();
  }, []);

  // Async delay helper with fast abort polling
  const waitExecution = (seconds: number): Promise<void> => {
    return new Promise((resolve) => {
      if (executionAbortedRef.current) {
        resolve();
        return;
      }
      const ms = Math.max(seconds * 1000, 20);
      const timer = setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, ms);

      const checkInterval = setInterval(() => {
        if (executionAbortedRef.current) {
          clearTimeout(timer);
          clearInterval(checkInterval);
          resolve();
        }
      }, 25);
    });
  };

  // Execute single code block
  const executeSingleBlock = async (block: CodeBlock): Promise<void> => {
    if (executionAbortedRef.current) return;

    setCurrentRunningBlockId(block.id);

    switch (block.type) {
      case 'set_servo': {
        const joint = block.params.joint as JointId;
        const angle = Number(block.params.angle);
        const duration = Number(block.params.duration || 400);
        soundManager.playServo(1);
        await animateJointsTo({ [joint]: angle }, duration);
        break;
      }
      case 'apply_pose': {
        const poseId = block.params.poseId;
        const pose = PRESET_POSES.find((p) => p.id === poseId);
        if (pose) {
          soundManager.playClick();
          await animateJointsTo(pose.angles, 450);
        }
        break;
      }
      case 'reset_pose': {
        soundManager.playClick();
        await animateJointsTo(DEFAULT_JOINTS, 400);
        break;
      }
      case 'step_forward': {
        const foot = block.params.foot || 'left';
        soundManager.playServo(2);
        if (foot === 'left') {
          const stepPose = PRESET_POSES.find((p) => p.id === 'step_left')?.angles || {};
          await animateJointsTo(stepPose, 500);
        } else {
          const stepPose = PRESET_POSES.find((p) => p.id === 'step_right')?.angles || {};
          await animateJointsTo(stepPose, 500);
        }
        break;
      }
      case 'squat': {
        const squatPose = PRESET_POSES.find((p) => p.id === 'squat')?.angles || {};
        await animateJointsTo(squatPose, 500);
        break;
      }
      case 'wait': {
        await waitExecution(Number(block.params.seconds || 0.5));
        break;
      }
      case 'repeat': {
        const isForever = block.params.times === 'forever' || block.params.forever === true;
        const times = isForever ? Infinity : Number(block.params.times || 1);
        if (block.children && block.children.length > 0) {
          let i = 0;
          while (isForever || i < times) {
            if (executionAbortedRef.current) break;
            await executeBlockList(block.children);
            // Yield a polling tick so sensor monitoring loops run smoothly over time
            await waitExecution(0.2);
            i++;
          }
        }
        break;
      }
      case 'set_eye_color': {
        setEyeColor(block.params.color || '#00e5ff');
        break;
      }
      case 'if_tilt': {
        if (!tiltProtectionEnabled) break;
        const threshold = Number(block.params.threshold ?? 15);
        const gyroPitch = Math.abs(telemetryRef.current.gyro?.pitch ?? 0);
        const gyroRoll = Math.abs(telemetryRef.current.gyro?.roll ?? 0);
        const currentTilt = Math.max(gyroPitch, gyroRoll);
        if (currentTilt > threshold && block.children && block.children.length > 0) {
          await executeBlockList(block.children);
        }
        break;
      }
      case 'play_sound': {
        const sound = block.params.sound || 'servo';
        if (sound === 'boot') soundManager.playBoot();
        else if (sound === 'success' || sound === 'cheer') soundManager.playCheer();
        else if (sound === 'warning') soundManager.playWarning();
        else if (sound === 'click') soundManager.playClick();
        else if (sound === 'kick') soundManager.playKick();
        else if (sound === 'goal') soundManager.playGoal();
        else soundManager.playServo(1);
        break;
      }
    }
  };

  // Execute a sequence of blocks, batching consecutive set_servo commands for coordinated multi-joint motion
  const executeBlockList = async (list: CodeBlock[]): Promise<void> => {
    let i = 0;
    while (i < list.length) {
      if (executionAbortedRef.current) break;
      const block = list[i];

      // If consecutive set_servo blocks exist, batch them together for coordinated motion
      if (block.type === 'set_servo') {
        const batchAngles: Partial<JointAngles> = {};
        let maxDuration = Number(block.params.duration || 400);
        let j = i;

        while (j < list.length && list[j].type === 'set_servo') {
          const cur = list[j];
          const joint = cur.params.joint as JointId;
          batchAngles[joint] = Number(cur.params.angle);
          if (cur.params.duration) {
            maxDuration = Math.max(maxDuration, Number(cur.params.duration));
          }
          j++;
        }

        setCurrentRunningBlockId(block.id);
        soundManager.playServo(Math.min(j - i, 3));
        await animateJointsTo(batchAngles, maxDuration);
        i = j;
        continue;
      }

      await executeSingleBlock(block);
      i++;
    }
  };

  const handleRunProgram = async () => {
    executionAbortedRef.current = false;
    setIsRunning(true);

    // If robot is currently fallen or toppled from a previous run/experiment,
    // reset physical orientation so the new program runs from a clean upright state
    if (telemetryRef.current.status === 'fallen' || (telemetryRef.current.status === 'unstable' && telemetryRef.current.margin <= 0)) {
      setResetTrigger((prev) => prev + 1);
    }

    try {
      await executeBlockList(blocks);
    } finally {
      setIsRunning(false);
      setCurrentRunningBlockId(null);
    }
  };

  const handleStopProgram = () => {
    executionAbortedRef.current = true;
    setIsRunning(false);
    setCurrentRunningBlockId(null);
    soundManager.playClick();
  };

  // Automatic emergency trip: halt running code if the robot falls
  const handleRobotFell = useCallback(() => {
    if (isRunning) {
      executionAbortedRef.current = true;
      setIsRunning(false);
      setCurrentRunningBlockId(null);
    }
  }, [isRunning]);

  // Mission completion callback
  const handleMissionCompleted = (missionId: number) => {
    if (!completedMissions.includes(missionId)) {
      setCompletedMissions((prev) => [...prev, missionId]);
    }
  };

  // Load starter code from mission
  const handleLoadStarterCode = (starterBlocks: CodeBlock[]) => {
    executionAbortedRef.current = true;
    setIsRunning(false);
    // Deep clone blocks so each mission load is a fresh clean copy
    setBlocks(JSON.parse(JSON.stringify(starterBlocks)));
    setJointAngles(DEFAULT_JOINTS);
    setTelemetry(calculateRobotKinematics(DEFAULT_JOINTS).telemetry);
    setCurrentRunningBlockId(null);
    setResetTrigger((prev) => prev + 1);
    setBallScored(false);
  };

  // Helper to find any if_tilt block in block tree
  const findTiltBlock = (list: CodeBlock[]): CodeBlock | undefined => {
    for (const b of list) {
      if (b.type === 'if_tilt') return b;
      if (b.children) {
        const found = findTiltBlock(b.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  // Interactive nudge/lean handler for keyboard and balance tester
  const handleNudge = useCallback((direction: 'forward' | 'backward' | 'hazard' | 'reset') => {
    soundManager.playServo(1);
    if (direction === 'reset') {
      const readyPose = PRESET_POSES.find((p) => p.id === 'ready')?.angles || {};
      setJointAngles({ ...DEFAULT_JOINTS, ...readyPose });
      setEyeColor('#00e5ff');
      setResetTrigger((prev) => prev + 1);
      return;
    }

    if (direction === 'hazard') {
      // Direct hazardous forward lean: hips bend forward -48°, causing ~22° pitch tilt
      setJointAngles((prev) => ({
        ...prev,
        l_hip_pitch: -48,
        r_hip_pitch: -48,
      }));
      return;
    }

    setJointAngles((prev) => {
      const next = { ...prev };
      if (direction === 'forward') {
        // Lean forward by decreasing hip pitch (clamped to -90)
        next.l_hip_pitch = Math.max(-90, (next.l_hip_pitch ?? -10) - 8);
        next.r_hip_pitch = Math.max(-90, (next.r_hip_pitch ?? -10) - 8);
      } else if (direction === 'backward') {
        // Lean backward by increasing hip pitch (clamped to 30)
        next.l_hip_pitch = Math.min(30, (next.l_hip_pitch ?? -10) + 8);
        next.r_hip_pitch = Math.min(30, (next.r_hip_pitch ?? -10) + 8);
      }
      return next;
    });
  }, []);

  // Autonomous reflex test runner: commands hazard tilt and executes student's reflex if present
  const handleTestReflex = useCallback(async () => {
    // 1. Tilt robot into hazard (> 15°)
    handleNudge('hazard');
    soundManager.playWarning();

    // 2. Look for student's if_tilt block
    const tiltBlock = findTiltBlock(blocks);
    if (tiltBlock && tiltBlock.children && tiltBlock.children.length > 0) {
      // Brief pause so student visibly sees the robot tip and IMU sensor flag the hazard
      await new Promise((r) => setTimeout(r, 350));
      // Autonomous reflex engages!
      await executeBlockList(tiltBlock.children);
    }
  }, [blocks, handleNudge, executeBlockList]);

  // Keyboard Controls (Only active in Mission 9 so students can test balance without interfering with other missions)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ONLY active in Mission 9!
      if (currentMissionId !== 9) return;

      // Do not capture keys if user is typing in an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleNudge('forward');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleNudge('backward');
      } else if (e.key === ' ' || e.key === 'r' || e.key === 'R') {
        if (e.key === ' ') e.preventDefault();
        handleNudge('reset');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMissionId, handleNudge]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Minimal Top Header */}
      <HeaderNav
        activeView={activeView}
        onChangeView={(view) => {
          setActiveView(view);
          setSidebarOpen(true);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={setSoundEnabled}
        onResetRobot={handleResetRobot}
        completedMissionsCount={completedMissions.length}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isRunning={isRunning}
        onRunProgram={handleRunProgram}
        onStopProgram={handleStopProgram}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 3D Simulator Canvas (Center Stage) */}
        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
          <Robot3DCanvas
            jointAngles={jointAngles}
            eyeColor={eyeColor}
            physicsMode={physicsMode}
            showCoM={showCoM}
            showSupportPoly={showSupportPoly}
            showAxes={false}
            wireframe={wireframe}
            onTelemetryUpdate={setTelemetry}
            onRobotFell={handleRobotFell}
            resetTrigger={resetTrigger}
            isSoccerMission={currentMissionId === 10}
            onBallScored={() => setBallScored(true)}
            ballScored={ballScored}
          />

          {/* Minimal Student Status Pill & Interactive Balance Tester */}
          <TelemetryOverlay
            telemetry={telemetry}
            physicsMode={physicsMode}
            onTogglePhysics={setPhysicsMode}
            showCoM={showCoM}
            onToggleCoM={setShowCoM}
            showSupportPoly={showSupportPoly}
            onToggleSupportPoly={setShowSupportPoly}
            wireframe={wireframe}
            onToggleWireframe={setWireframe}
            isRunning={isRunning}
            onStopProgram={handleStopProgram}
            onResetRobot={handleResetRobot}
            onNudge={handleNudge}
            onTestReflex={handleTestReflex}
            hasTiltReflex={Boolean(findTiltBlock(blocks))}
            showTester={currentMissionId === 9}
            tiltProtectionEnabled={tiltProtectionEnabled}
            onToggleTiltProtection={() => setTiltProtectionEnabled((prev) => !prev)}
          />
        </div>

        {/* Clean Student Side Panel */}
        {sidebarOpen && (
          <aside className="w-full md:w-[420px] lg:w-[460px] h-full border-l border-slate-800 bg-slate-900 flex flex-col shadow-2xl shrink-0 z-10 animate-in slide-in-from-right duration-200">
            {activeView === 'missions' && (
              <MissionsPanel
                currentMissionId={currentMissionId}
                onSelectMission={(id) => {
                  setCurrentMissionId(id);
                  setBallScored(false);
                }}
                completedMissions={completedMissions}
                onMissionCompleted={handleMissionCompleted}
                currentAngles={jointAngles}
                currentTelemetry={telemetry}
                currentBlocks={blocks}
                onLoadStarterCode={handleLoadStarterCode}
                onSwitchToCodeTab={() => setActiveView('code')}
                isRunning={isRunning}
                onRunProgram={handleRunProgram}
                onStopProgram={handleStopProgram}
                onResetRobot={handleResetRobot}
                ballScored={ballScored}
              />
            )}

            {activeView === 'code' && (
              <BlockCodeEditor
                blocks={blocks}
                onChangeBlocks={setBlocks}
                onRunProgram={handleRunProgram}
                onStopProgram={handleStopProgram}
                isRunning={isRunning}
                currentRunningBlockId={currentRunningBlockId}
                activeMission={MISSIONS.find((m) => m.id === currentMissionId) || MISSIONS[0]}
                onSwitchToMissions={() => setActiveView('missions')}
                onResetRobot={handleResetRobot}
                isFallen={telemetry.status === 'fallen'}
              />
            )}

            {activeView === 'sliders' && (
              <ServoSliders
                angles={jointAngles}
                onChangeJoint={handleChangeJoint}
                onApplyPose={handleApplyPose}
                onResetAll={handleResetRobot}
              />
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
