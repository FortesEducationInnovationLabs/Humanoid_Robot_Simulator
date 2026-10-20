import React, { useState } from 'react';
import { JointAngles, JointConfig, JOINT_CONFIGS, JointId } from '../types/robot';
import { PRESET_POSES, getLegRollCollisionLimit } from '../utils/kinematics';
import { soundManager } from '../utils/audio';

interface ServoSlidersProps {
  angles: JointAngles;
  onChangeJoint: (jointId: JointId, angle: number) => void;
  onApplyPose: (angles: Partial<JointAngles>) => void;
  onResetAll: () => void;
}

export const ServoSliders: React.FC<ServoSlidersProps> = ({
  angles,
  onChangeJoint,
  onApplyPose,
  onResetAll,
}) => {
  const [section, setSection] = useState<'arms' | 'legs' | 'head'>('arms');
  const [mirror, setMirror] = useState<boolean>(true);

  // Group joints
  const headJoints = JOINT_CONFIGS.filter((j) => j.group === 'head');
  const lArmJoints = JOINT_CONFIGS.filter((j) => j.group === 'l_arm');
  const rArmJoints = JOINT_CONFIGS.filter((j) => j.group === 'r_arm');
  const lLegJoints = JOINT_CONFIGS.filter((j) => j.group === 'l_leg');
  const rLegJoints = JOINT_CONFIGS.filter((j) => j.group === 'r_leg');

  const handleSlider = (joint: JointConfig, val: number) => {
    let appliedVal = val;
    let hitCollision = false;

    // Physical Self-Collision prevention between legs:
    // When one leg moves inward towards the other leg, it stops when it makes physical contact
    if (joint.id === 'l_hip_roll') {
      const other = angles.r_hip_roll ?? 0;
      const res = getLegRollCollisionLimit(
        'l_hip_roll',
        val,
        other,
        angles.l_hip_pitch,
        angles.r_hip_pitch,
        angles.l_knee_pitch,
        angles.r_knee_pitch,
        mirror
      );
      appliedVal = res.clampedAngle;
      hitCollision = res.isColliding;
    } else if (joint.id === 'r_hip_roll') {
      const other = angles.l_hip_roll ?? 0;
      const res = getLegRollCollisionLimit(
        'r_hip_roll',
        val,
        other,
        angles.l_hip_pitch,
        angles.r_hip_pitch,
        angles.l_knee_pitch,
        angles.r_knee_pitch,
        mirror
      );
      appliedVal = res.clampedAngle;
      hitCollision = res.isColliding;
    }

    onChangeJoint(joint.id, appliedVal);

    if (hitCollision) {
      soundManager.playClick();
    } else {
      soundManager.playServo(1);
    }

    // Mirror mode: mirrors symmetric joints across both sides
    if (mirror) {
      if (joint.id === 'l_shoulder_pitch') onChangeJoint('r_shoulder_pitch', val);
      else if (joint.id === 'l_shoulder_roll') onChangeJoint('r_shoulder_roll', -val);
      else if (joint.id === 'l_elbow_pitch') onChangeJoint('r_elbow_pitch', val);
      else if (joint.id === 'r_shoulder_pitch') onChangeJoint('l_shoulder_pitch', val);
      else if (joint.id === 'r_shoulder_roll') onChangeJoint('l_shoulder_roll', -val);
      else if (joint.id === 'r_elbow_pitch') onChangeJoint('l_elbow_pitch', val);
      // Leg Roll Mirroring (Bug #1 Fix + Bug #2 Collision Stop)
      else if (joint.id === 'l_hip_roll') onChangeJoint('r_hip_roll', -appliedVal);
      else if (joint.id === 'r_hip_roll') onChangeJoint('l_hip_roll', -appliedVal);
      // Leg Pitch Mirroring
      else if (joint.id === 'l_hip_pitch') onChangeJoint('r_hip_pitch', val);
      else if (joint.id === 'r_hip_pitch') onChangeJoint('l_hip_pitch', val);
      // Knee Mirroring
      else if (joint.id === 'l_knee_pitch') onChangeJoint('r_knee_pitch', val);
      else if (joint.id === 'r_knee_pitch') onChangeJoint('l_knee_pitch', val);
      // Ankle Pitch Mirroring
      else if (joint.id === 'l_ankle_pitch') onChangeJoint('r_ankle_pitch', val);
      else if (joint.id === 'r_ankle_pitch') onChangeJoint('l_ankle_pitch', val);
      // Ankle Roll Mirroring (Bug #1 Fix)
      else if (joint.id === 'l_ankle_roll') onChangeJoint('r_ankle_roll', -val);
      else if (joint.id === 'r_ankle_roll') onChangeJoint('l_ankle_roll', -val);
    }
  };

  const renderSliderCard = (j: JointConfig) => {
    const val = angles[j.id] ?? j.defaultVal;

    // Detect if leg is at collision stop boundary
    const otherRoll = j.id === 'l_hip_roll' ? (angles.r_hip_roll ?? 0) : (angles.l_hip_roll ?? 0);
    const isAtCollisionLimit =
      (j.id === 'l_hip_roll' &&
        getLegRollCollisionLimit('l_hip_roll', val - 1, otherRoll, angles.l_hip_pitch, angles.r_hip_pitch, angles.l_knee_pitch, angles.r_knee_pitch, mirror).isColliding &&
        val <= -3) ||
      (j.id === 'r_hip_roll' &&
        getLegRollCollisionLimit('r_hip_roll', val + 1, otherRoll, angles.l_hip_pitch, angles.r_hip_pitch, angles.l_knee_pitch, angles.r_knee_pitch, mirror).isColliding &&
        val >= 3);

    return (
      <div key={j.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-200">{j.name}</span>
            {isAtCollisionLimit && (
              <span className="text-[10px] text-amber-400 bg-amber-950/80 border border-amber-600/50 px-1 rounded font-mono">
                Contact: Leg Hit
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-yellow-300">{val}°</span>
            <button
              onClick={() => handleSlider(j, 0)}
              className="text-[10px] text-slate-400 hover:text-white bg-slate-800 px-1.5 py-0.5 rounded"
              title="Reset joint to 0°"
            >
              0°
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 w-6 text-right">{j.min}°</span>
          <input
            type="range"
            min={j.min}
            max={j.max}
            step={1}
            value={val}
            onChange={(e) => handleSlider(j, Number(e.target.value))}
            className="w-full accent-yellow-400 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 w-6">{j.max}°</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
      {/* Quick Poses Row */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40">
        <div className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
          Quick Poses:
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {PRESET_POSES.slice(0, 5).map((p) => (
            <button
              key={p.id}
              onClick={() => {
                onApplyPose(p.angles);
                soundManager.playClick();
              }}
              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-yellow-400 hover:text-slate-950 text-slate-200 transition-colors shrink-0"
            >
              {p.name}
            </button>
          ))}
          <button
            onClick={onResetAll}
            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
          >
            Reset Stand
          </button>
        </div>
      </div>

      {/* Body Part Tabs & Mirror Toggle */}
      <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setSection('arms')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              section === 'arms' ? 'bg-yellow-400 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            💪 Arms
          </button>
          <button
            onClick={() => setSection('legs')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              section === 'legs' ? 'bg-yellow-400 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            🦵 Legs
          </button>
          <button
            onClick={() => setSection('head')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              section === 'head' ? 'bg-yellow-400 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            🤖 Head
          </button>
        </div>

        <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={mirror}
            onChange={(e) => setMirror(e.target.checked)}
            className="accent-yellow-400 rounded w-4 h-4"
          />
          <span>Mirror Mode</span>
        </label>
      </div>

      {/* Sliders Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {section === 'head' && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-yellow-400">Head (1 Joint)</div>
            {headJoints.map(renderSliderCard)}
          </div>
        )}

        {section === 'arms' && (
          <div className="space-y-3">
            <div>
              <div className="text-xs font-bold text-yellow-400 mb-1.5">Left Arm</div>
              <div className="space-y-1.5">{lArmJoints.map(renderSliderCard)}</div>
            </div>

            <div>
              <div className="text-xs font-bold text-yellow-400 mb-1.5">Right Arm</div>
              <div className="space-y-1.5">{rArmJoints.map(renderSliderCard)}</div>
            </div>
          </div>
        )}

        {section === 'legs' && (
          <div className="space-y-3">
            <div>
              <div className="text-xs font-bold text-yellow-400 mb-1.5">Left Leg</div>
              <div className="space-y-1.5">{lLegJoints.map(renderSliderCard)}</div>
            </div>

            <div>
              <div className="text-xs font-bold text-yellow-400 mb-1.5">Right Leg</div>
              <div className="space-y-1.5">{rLegJoints.map(renderSliderCard)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
