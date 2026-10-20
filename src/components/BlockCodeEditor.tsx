import React, { useState } from 'react';
import { CodeBlock, BlockType, JOINT_CONFIGS } from '../types/robot';
import { PRESET_POSES } from '../utils/kinematics';
import { soundManager } from '../utils/audio';

interface BlockCodeEditorProps {
  blocks: CodeBlock[];
  onChangeBlocks: (blocks: CodeBlock[]) => void;
  onRunProgram: () => void;
  onStopProgram: () => void;
  isRunning: boolean;
  currentRunningBlockId: string | null;
  activeMission?: {
    id: number;
    title: string;
    studentTask: string;
    challengeType: string;
  };
  onSwitchToMissions?: () => void;
  onResetRobot?: () => void;
  isFallen?: boolean;
}

export const BlockCodeEditor: React.FC<BlockCodeEditorProps> = ({
  blocks,
  onChangeBlocks,
  onRunProgram,
  onStopProgram,
  isRunning,
  currentRunningBlockId,
  activeMission,
  onSwitchToMissions,
  onResetRobot,
  isFallen,
}) => {
  const [viewPython, setViewPython] = useState<boolean>(false);
  const [showAddMenu, setShowAddMenu] = useState<boolean>(false);
  const [targetParentId, setTargetParentId] = useState<string | null>(null);

  const createBlock = (type: BlockType): CodeBlock => {
    const id = 'blk_' + Math.random().toString(36).substring(2, 9);
    switch (type) {
      case 'set_servo':
        return { id, type, params: { joint: 'head_yaw', angle: 0, duration: 400 } };
      case 'apply_pose':
        return { id, type, params: { poseId: 'wave' } };
      case 'reset_pose':
        return { id, type, params: {} };
      case 'step_forward':
        return { id, type, params: { foot: 'left', distance: 1 } };
      case 'squat':
        return { id, type, params: { depth: 50 } };
      case 'wait':
        return { id, type, params: { seconds: 0.5 } };
      case 'repeat':
        return {
          id,
          type,
          params: { times: 2 },
          children: [
            {
              id: 'blk_' + Math.random().toString(36).substring(2, 9),
              type: 'set_servo',
              params: { joint: 'r_elbow_pitch', angle: 80, duration: 300 },
            },
            {
              id: 'blk_' + Math.random().toString(36).substring(2, 9),
              type: 'wait',
              params: { seconds: 0.3 },
            },
            {
              id: 'blk_' + Math.random().toString(36).substring(2, 9),
              type: 'set_servo',
              params: { joint: 'r_elbow_pitch', angle: 20, duration: 300 },
            },
            {
              id: 'blk_' + Math.random().toString(36).substring(2, 9),
              type: 'wait',
              params: { seconds: 0.3 },
            },
          ],
        };
      case 'set_eye_color':
        return { id, type, params: { color: '#00e5ff' } };
      case 'play_sound':
        return { id, type, params: { sound: 'servo' } };
      case 'if_tilt':
        return {
          id,
          type,
          params: { threshold: 15 },
          children: [],
        };
      default:
        return { id, type: 'wait', params: { seconds: 0.5 } };
    }
  };

  const handleAddBlock = (type: BlockType) => {
    const newBlock = createBlock(type);
    if (!targetParentId) {
      onChangeBlocks([...blocks, newBlock]);
    } else {
      const addNested = (list: CodeBlock[]): CodeBlock[] => {
        return list.map((b) => {
          if (b.id === targetParentId) {
            return { ...b, children: [...(b.children || []), newBlock] };
          }
          if (b.children) {
            return { ...b, children: addNested(b.children) };
          }
          return b;
        });
      };
      onChangeBlocks(addNested(blocks));
    }
    setShowAddMenu(false);
    setTargetParentId(null);
    soundManager.playClick();
  };

  const handleDeleteBlock = (id: string) => {
    const removeBlock = (list: CodeBlock[]): CodeBlock[] => {
      return list
        .filter((b) => b.id !== id)
        .map((b) => ({
          ...b,
          children: b.children ? removeBlock(b.children) : undefined,
        }));
    };
    onChangeBlocks(removeBlock(blocks));
    soundManager.playClick();
  };

  const handleMoveBlock = (id: string, direction: 'up' | 'down') => {
    const moveInList = (list: CodeBlock[]): CodeBlock[] => {
      const idx = list.findIndex((b) => b.id === id);
      if (idx !== -1) {
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= list.length) return list;
        const copy = [...list];
        const [moved] = copy.splice(idx, 1);
        copy.splice(targetIdx, 0, moved);
        return copy;
      }
      return list.map((b) => {
        if (b.children) {
          return { ...b, children: moveInList(b.children) };
        }
        return b;
      });
    };
    onChangeBlocks(moveInList(blocks));
    soundManager.playClick();
  };

  const handleUpdateParam = (id: string, paramKey: string, value: any) => {
    const updateBlock = (list: CodeBlock[]): CodeBlock[] => {
      return list.map((b) => {
        if (b.id === id) {
          return { ...b, params: { ...b.params, [paramKey]: value } };
        }
        if (b.children) {
          return { ...b, children: updateBlock(b.children) };
        }
        return b;
      });
    };
    onChangeBlocks(updateBlock(blocks));
  };

  // Convert blocks to simple Python script
  const generatePython = (list: CodeBlock[], indent: string = ''): string => {
    let code = '';
    for (const b of list) {
      switch (b.type) {
        case 'set_servo':
          code += `${indent}robot.set_servo("${b.params.joint}", ${b.params.angle})\n`;
          break;
        case 'apply_pose':
          code += `${indent}robot.play_pose("${b.params.poseId}")\n`;
          break;
        case 'reset_pose':
          code += `${indent}robot.reset_stand()\n`;
          break;
        case 'step_forward':
          code += `${indent}robot.step("${b.params.foot}")\n`;
          break;
        case 'squat':
          code += `${indent}robot.squat()\n`;
          break;
        case 'wait':
          code += `${indent}time.sleep(${b.params.seconds})\n`;
          break;
        case 'repeat':
          if (b.params.times === 'forever' || b.params.forever) {
            code += `${indent}while True:\n`;
          } else {
            code += `${indent}for step in range(${b.params.times || 5}):\n`;
          }
          code += b.children && b.children.length > 0 ? generatePython(b.children, indent + '    ') : `${indent}    pass\n`;
          break;
        case 'set_eye_color':
          code += `${indent}robot.set_visor_color("${b.params.color}")\n`;
          break;
        case 'play_sound':
          code += `${indent}robot.play_sound("${b.params.sound}")\n`;
          break;
        case 'if_tilt':
          code += `${indent}if robot.gyro.pitch_tilt > ${b.params.threshold || 15}:\n`;
          code += b.children && b.children.length > 0 ? generatePython(b.children, indent + '    ') : `${indent}    pass\n`;
          break;
      }
    }
    return code;
  };

  const renderBlock = (b: CodeBlock, depth = 0) => {
    const isCurrent = currentRunningBlockId === b.id;

    return (
      <div
        key={b.id}
        className={`rounded-xl p-2.5 my-1.5 border transition-all ${
          isCurrent
            ? 'bg-yellow-400 text-slate-950 border-yellow-300 ring-2 ring-yellow-400 shadow-md font-bold'
            : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700'
        }`}
        style={{ marginLeft: `${depth * 16}px` }}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {b.type === 'set_servo' && (
              <>
                <span className="font-semibold text-sky-400">Turn</span>
                <select
                  value={b.params.joint}
                  onChange={(e) => handleUpdateParam(b.id, 'joint', e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-100 rounded px-1.5 py-0.5 text-xs font-mono"
                >
                  {JOINT_CONFIGS.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.name}
                    </option>
                  ))}
                </select>
                <span>to</span>
                <input
                  type="number"
                  value={b.params.angle}
                  onChange={(e) => handleUpdateParam(b.id, 'angle', Number(e.target.value))}
                  className="w-14 bg-slate-900 border border-slate-700 text-center rounded px-1 py-0.5 text-xs font-mono text-yellow-300 font-bold"
                />
                <span>°</span>
              </>
            )}

            {b.type === 'apply_pose' && (
              <>
                <span className="font-semibold text-emerald-400">Play Pose</span>
                <select
                  value={b.params.poseId}
                  onChange={(e) => handleUpdateParam(b.id, 'poseId', e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-100 rounded px-2 py-0.5 text-xs font-medium"
                >
                  {PRESET_POSES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            {b.type === 'wait' && (
              <>
                <span className="font-semibold text-amber-400">Wait</span>
                <input
                  type="number"
                  step={0.1}
                  min={0.1}
                  max={10}
                  value={b.params.seconds}
                  onChange={(e) => handleUpdateParam(b.id, 'seconds', Number(e.target.value))}
                  className="w-14 bg-slate-900 border border-slate-700 text-center rounded px-1 py-0.5 text-xs font-mono text-amber-300 font-bold"
                />
                <span>seconds</span>
              </>
            )}

            {b.type === 'repeat' && (
              <>
                <span className="font-semibold text-purple-400">Repeat</span>
                <select
                  value={b.params.times === 'forever' || b.params.forever ? 'forever' : 'count'}
                  onChange={(e) => {
                    if (e.target.value === 'forever') {
                      handleUpdateParam(b.id, 'times', 'forever');
                      handleUpdateParam(b.id, 'forever', true);
                    } else {
                      handleUpdateParam(b.id, 'times', 5);
                      handleUpdateParam(b.id, 'forever', false);
                    }
                  }}
                  className="bg-slate-900 border border-slate-700 text-purple-300 font-bold rounded px-2 py-0.5 text-xs font-mono"
                >
                  <option value="forever">Forever (∞)</option>
                  <option value="count">Count (times)</option>
                </select>
                {b.params.times !== 'forever' && !b.params.forever && (
                  <>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={b.params.times || 5}
                      onChange={(e) => handleUpdateParam(b.id, 'times', Math.max(1, Number(e.target.value)))}
                      className="w-12 bg-slate-900 border border-slate-700 text-center rounded px-1 py-0.5 text-xs font-mono text-purple-300 font-bold"
                    />
                    <span>times:</span>
                  </>
                )}
                {(b.params.times === 'forever' || b.params.forever) && (
                  <span className="text-[11px] text-purple-300/80 font-mono italic">continuously:</span>
                )}
              </>
            )}

            {b.type === 'step_forward' && (
              <>
                <span className="font-semibold text-blue-400">Step</span>
                <select
                  value={b.params.foot}
                  onChange={(e) => handleUpdateParam(b.id, 'foot', e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-100 rounded px-2 py-0.5 text-xs font-medium"
                >
                  <option value="left">Left Leg</option>
                  <option value="right">Right Leg</option>
                </select>
                <span>forward</span>
              </>
            )}

            {b.type === 'squat' && (
              <span className="font-semibold text-amber-400">Squat Crouch</span>
            )}

            {b.type === 'if_tilt' && (
              <>
                <span className="font-semibold text-rose-400">If Tilt &gt;</span>
                <input
                  type="number"
                  min={5}
                  max={45}
                  value={b.params.threshold ?? 15}
                  onChange={(e) => handleUpdateParam(b.id, 'threshold', Number(e.target.value))}
                  className="w-12 bg-slate-900 border border-slate-700 text-center rounded px-1 py-0.5 text-xs font-mono text-rose-300 font-bold"
                />
                <span>° (Gyroscope):</span>
              </>
            )}

            {b.type === 'reset_pose' && (
              <span className="font-semibold text-slate-300">Reset to Stand</span>
            )}

            {b.type === 'set_eye_color' && (
              <>
                <span className="font-semibold text-cyan-400">Visor Light</span>
                <input
                  type="color"
                  value={b.params.color}
                  onChange={(e) => handleUpdateParam(b.id, 'color', e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border border-slate-700"
                />
              </>
            )}

            {b.type === 'play_sound' && (
              <>
                <span className="font-semibold text-emerald-400">Play Sound</span>
                <select
                  value={b.params.sound}
                  onChange={(e) => handleUpdateParam(b.id, 'sound', e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-100 rounded px-2 py-0.5 text-xs"
                >
                  <option value="servo">Motor Whir</option>
                  <option value="boot">Boot Chime</option>
                  <option value="kick">⚽ Soccer Kick</option>
                  <option value="goal">🎉 Goal & Whistle</option>
                  <option value="success">Victory Fanfare</option>
                  <option value="warning">Alert Buzz</option>
                </select>
              </>
            )}
          </div>

          {/* Delete & Add inside actions */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Move Up / Move Down buttons */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded overflow-hidden">
              <button
                onClick={() => handleMoveBlock(b.id, 'up')}
                className="text-slate-400 hover:text-yellow-300 hover:bg-slate-800 px-1.5 py-0.5 text-[10px] transition-colors"
                title="Move block UP"
              >
                ▲
              </button>
              <span className="w-px h-3 bg-slate-800"></span>
              <button
                onClick={() => handleMoveBlock(b.id, 'down')}
                className="text-slate-400 hover:text-yellow-300 hover:bg-slate-800 px-1.5 py-0.5 text-[10px] transition-colors"
                title="Move block DOWN"
              >
                ▼
              </button>
            </div>

            {b.children !== undefined && (
              <button
                onClick={() => {
                  setTargetParentId(b.id);
                  setShowAddMenu(true);
                }}
                className="text-[11px] text-yellow-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
              >
                + Inside
              </button>
            )}
            <button
              onClick={() => handleDeleteBlock(b.id)}
              className="text-slate-400 hover:text-red-400 hover:bg-red-950/40 px-1.5 py-0.5 text-xs rounded transition-colors"
              title="Remove block"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Nested Blocks for Loops and Conditions */}
        {b.children && (
          <div className="mt-2 pl-3 border-l-2 border-slate-800 space-y-1">
            {b.children.length === 0 ? (
              <div className="text-[11px] text-slate-400 italic py-1.5 px-2.5 bg-slate-950/40 rounded-lg border border-dashed border-slate-700/60 flex items-center justify-between gap-2">
                <span>
                  {b.type === 'if_tilt'
                    ? 'Empty reflex condition: add light, sound, or pose recovery.'
                    : 'Empty loop: click "+ Inside" to add commands.'}
                </span>
                <button
                  onClick={() => {
                    setTargetParentId(b.id);
                    setShowAddMenu(true);
                  }}
                  className="text-[10px] text-yellow-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-600 not-italic font-bold cursor-pointer transition-colors"
                >
                  + Inside
                </button>
              </div>
            ) : (
              b.children.map((child) => renderBlock(child, depth + 1))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
      {/* Execution Controls Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <button
              onClick={onRunProgram}
              disabled={blocks.length === 0}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950"
            >
              <span>▶</span> RUN CODE
            </button>
          ) : (
            <button
              onClick={onStopProgram}
              className="bg-red-500 hover:bg-red-400 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-red-950"
            >
              <span>■</span> STOP
            </button>
          )}

          <button
            onClick={() => {
              setTargetParentId(null);
              setShowAddMenu(true);
            }}
            className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs px-3 py-2 rounded-xl transition-all"
          >
            + Add Block
          </button>

          {onResetRobot && (
            <button
              onClick={onResetRobot}
              className={`text-xs px-3 py-2 rounded-xl transition-all font-bold flex items-center gap-1 cursor-pointer ${
                isFallen
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-950 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
              }`}
              title="Reset robot to standing pose and upright balance"
            >
              <span>↺</span> {isFallen ? 'Stand Up (Fallen)' : 'Reset Stand'}
            </button>
          )}
        </div>

        {/* Python View Toggle */}
        <button
          onClick={() => setViewPython(!viewPython)}
          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
            viewPython
              ? 'bg-yellow-400 text-slate-950 font-bold border-yellow-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          {viewPython ? '🧩 Blocks View' : '🐍 Python Code'}
        </button>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Active Mission Reminder Banner */}
        {activeMission && (
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-2.5 mb-3 flex items-start justify-between gap-2 text-xs">
            <div className="space-y-0.5 flex-1">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>🎯 Mission {activeMission.id}: {activeMission.challengeType}</span>
              </div>
              <div className="text-amber-100/90 leading-relaxed text-[11px]">
                {activeMission.studentTask}
              </div>
            </div>
            {onSwitchToMissions && (
              <button
                onClick={onSwitchToMissions}
                className="text-[10px] text-amber-300 hover:text-white bg-amber-900/40 hover:bg-amber-900/70 border border-amber-600/40 px-2 py-1 rounded shrink-0 font-medium cursor-pointer transition-colors"
                title="View mission checklist and test results"
              >
                Goals ➔
              </button>
            )}
          </div>
        )}

        {viewPython ? (
          <div className="h-full">
            <pre className="font-mono text-xs text-yellow-300 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed h-full">
              {`# Humanoid Simulator v1.0 Python Program\nimport humanoid_sim\nimport time\n\nrobot = humanoid_sim.Robot()\n\n${generatePython(blocks)}\nprint("Done!")`}
            </pre>
          </div>
        ) : (
          <div>
            {blocks.length === 0 ? (
              <div className="text-center py-16 text-slate-500 space-y-3">
                <div className="text-3xl">🧩</div>
                <div className="text-sm font-semibold text-slate-300">Your Code is Empty</div>
                <div className="text-xs text-slate-400 max-w-xs mx-auto">
                  Click "+ Add Block" or load a mission from the Missions tab to start programming.
                </div>
                <button
                  onClick={() => setShowAddMenu(true)}
                  className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl"
                >
                  + Add First Block
                </button>
              </div>
            ) : (
              <div className="space-y-1">{blocks.map((b) => renderBlock(b, 0))}</div>
            )}
          </div>
        )}
      </div>

      {/* Simple Add Block Menu */}
      {showAddMenu && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="text-sm font-bold text-white font-tech uppercase">Choose a Block</div>
              <button
                onClick={() => setShowAddMenu(false)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                onClick={() => handleAddBlock('set_servo')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-sky-950/60 border border-slate-700 hover:border-sky-400 transition-colors text-xs font-semibold text-slate-200"
              >
                Turn Servo
              </button>

              <button
                onClick={() => handleAddBlock('apply_pose')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-400 transition-colors text-xs font-semibold text-slate-200"
              >
                Play Pose
              </button>

              <button
                onClick={() => handleAddBlock('step_forward')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-blue-950/60 border border-slate-700 hover:border-blue-400 transition-colors text-xs font-semibold text-slate-200"
              >
                Take Step
              </button>

              <button
                onClick={() => handleAddBlock('wait')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-amber-950/60 border border-slate-700 hover:border-amber-400 transition-colors text-xs font-semibold text-slate-200"
              >
                Wait Seconds
              </button>

              <button
                onClick={() => handleAddBlock('repeat')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-purple-950/60 border border-slate-700 hover:border-purple-400 transition-colors text-xs font-semibold text-slate-200"
              >
                Repeat Loop
              </button>

              <button
                onClick={() => handleAddBlock('set_eye_color')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-400 transition-colors text-xs font-semibold text-slate-200"
              >
                Visor Light
              </button>

              <button
                onClick={() => handleAddBlock('play_sound')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-400 transition-colors text-xs font-semibold text-slate-200"
              >
                Play Sound
              </button>

              <button
                onClick={() => handleAddBlock('squat')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-amber-950/60 border border-slate-700 hover:border-amber-400 transition-colors text-xs font-semibold text-slate-200"
              >
                Squat Stance
              </button>

              <button
                onClick={() => handleAddBlock('if_tilt')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-400 transition-colors text-xs font-semibold text-slate-200"
              >
                Gyro Reflex
              </button>

              <button
                onClick={() => handleAddBlock('reset_pose')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-xs font-semibold text-slate-200 col-span-2 text-center"
              >
                Reset Stand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
