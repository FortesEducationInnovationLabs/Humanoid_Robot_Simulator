import React from 'react';
import confetti from 'canvas-confetti';
import { JointAngles, StabilityTelemetry, CodeBlock } from '../types/robot';
import { MISSIONS } from '../data/missions';
import { soundManager } from '../utils/audio';

interface MissionsPanelProps {
  currentMissionId: number;
  onSelectMission: (missionId: number) => void;
  completedMissions: number[];
  onMissionCompleted: (missionId: number) => void;
  currentAngles: JointAngles;
  currentTelemetry: StabilityTelemetry;
  currentBlocks: CodeBlock[];
  onLoadStarterCode: (blocks: CodeBlock[]) => void;
  onSwitchToCodeTab: () => void;
  isRunning?: boolean;
  onRunProgram?: () => void;
  onStopProgram?: () => void;
  onResetRobot?: () => void;
  ballScored?: boolean;
}

export const MissionsPanel: React.FC<MissionsPanelProps> = ({
  currentMissionId,
  onSelectMission,
  completedMissions,
  onMissionCompleted,
  currentAngles,
  currentTelemetry,
  currentBlocks,
  onLoadStarterCode,
  onSwitchToCodeTab,
  isRunning = false,
  onRunProgram,
  onStopProgram,
  onResetRobot,
  ballScored = false,
}) => {
  const activeMission = MISSIONS.find((m) => m.id === currentMissionId) || MISSIONS[0];
  const isCompleted = completedMissions.includes(activeMission.id);

  // Evaluate requirements live
  const reqStatus = activeMission.requirements.map((req) => ({
    ...req,
    satisfied: req.check({
      angles: currentAngles,
      telemetry: currentTelemetry,
      executedBlocks: currentBlocks,
      ballScored,
    }),
  }));

  const satisfiedCount = reqStatus.filter((r) => r.satisfied).length;
  const allSatisfied = reqStatus.every((r) => r.satisfied);

  const handleCompleteMission = () => {
    if (!allSatisfied) return;
    onMissionCompleted(activeMission.id);
    soundManager.playSuccess();
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#facc15', '#38bdf8', '#10b981'],
      });
    } catch {}
  };

  const handleNext = () => {
    if (activeMission.id < MISSIONS.length) {
      onSelectMission(activeMission.id + 1);
      soundManager.playClick();
    }
  };

  const handlePrev = () => {
    if (activeMission.id > 1) {
      onSelectMission(activeMission.id - 1);
      soundManager.playClick();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
      {/* Stage Stepper Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={activeMission.id === 1}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
            title="Previous Mission"
          >
            ◀
          </button>
          <span className="text-xs font-bold text-yellow-400 font-tech uppercase tracking-wide">
            Mission {activeMission.id} of {MISSIONS.length}
          </span>
          <button
            onClick={handleNext}
            disabled={activeMission.id === MISSIONS.length}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
            title="Next Mission"
          >
            ▶
          </button>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          {completedMissions.length} / 10 Completed
        </div>
      </div>

      {/* Mission Quick Selector dots */}
      <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {MISSIONS.map((m) => {
          const isDone = completedMissions.includes(m.id);
          const isSelected = m.id === currentMissionId;
          return (
            <button
              key={m.id}
              onClick={() => {
                onSelectMission(m.id);
                soundManager.playClick();
              }}
              className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300'
                  : isDone
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {isDone ? '✓' : m.id}
            </button>
          );
        })}
      </div>

      {/* Main Mission Card */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title, Badge & STEM Concept */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
              {activeMission.challengeType}
            </span>
            {isCompleted && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span>✓</span> Completed
              </span>
            )}
            <span className="text-[11px] text-sky-400 font-medium">
              💡 {activeMission.conceptLearned}
            </span>
          </div>

          <h2 className="text-base font-bold text-white font-tech">
            {activeMission.title.replace(/^Mission \d+:\s*/, '')}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {activeMission.summary}
          </p>
        </div>

        {/* Highlighted Student Coding Task */}
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <span>🛠️ Your Coding Task (What to modify or add):</span>
          </div>
          <p className="text-xs text-amber-100/95 leading-relaxed font-medium">
            {activeMission.studentTask}
          </p>
        </div>

        {/* STEM Physics & Robotics Mechanics Insight */}
        {activeMission.conceptTheory && (
          <div className="bg-sky-950/40 border border-sky-500/30 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
              <span>🔬 Robotics Physics Insight:</span>
            </div>
            <p className="text-xs text-sky-200/90 leading-relaxed">
              {activeMission.conceptTheory}
            </p>
          </div>
        )}

        {/* Step-by-Step Instructions */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="text-xs font-bold text-slate-200">Step-by-step instructions:</div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
            {activeMission.taskInstructions.map((instruction, idx) => (
              <li key={idx}>{instruction}</li>
            ))}
          </ul>
        </div>

        {/* Tips & Experiments if available */}
        {activeMission.tips && activeMission.tips.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 space-y-1.5">
            <div className="text-[11px] font-bold text-yellow-300 flex items-center gap-1">
              <span>💡 Lesson Tips & Observations:</span>
            </div>
            <ul className="text-[11px] text-slate-300 space-y-1 list-disc pl-4 leading-relaxed">
              {activeMission.tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Live Goal Checklist */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-200">Goal Checklist:</div>
          <div className="space-y-1.5">
            {reqStatus.map((req) => (
              <div
                key={req.id}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg text-xs transition-colors border ${
                  req.satisfied
                    ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    req.satisfied ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {req.satisfied ? '✓' : '○'}
                </div>
                <span className="flex-1">{req.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2">
          {/* Direct Run / Stop Execution Button inside Missions Panel */}
          {isRunning ? (
            <button
              onClick={onStopProgram}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-950 animate-pulse cursor-pointer"
            >
              <span className="text-sm">■</span> STOP CODE EXECUTION
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={onRunProgram}
                disabled={currentBlocks.length === 0}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 cursor-pointer"
              >
                <span>▶</span> Run Current Code
              </button>
              <button
                onClick={onSwitchToCodeTab}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs px-3 py-2.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title="Edit Blocks"
              >
                <span>🧩</span> Edit Code
              </button>
            </div>
          )}

          {/* Reset Stand Button */}
          {onResetRobot && (
            <button
              onClick={onResetRobot}
              className={`w-full text-xs py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentTelemetry.status === 'fallen'
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-950 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <span>↺</span> {currentTelemetry.status === 'fallen' ? '⚠️ Robot Fallen - Click to Stand Up' : 'Reset Robot to Stand'}
            </button>
          )}

          <button
            onClick={() => {
              onLoadStarterCode(activeMission.starterBlocks);
              onSwitchToCodeTab();
              soundManager.playClick();
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 text-yellow-300 font-semibold text-xs py-2.5 rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            {activeMission.id === 1 ? (
              <span>▶ Load Tutorial Code (Ready to Run)</span>
            ) : (
              <span>🧩 Load Challenge Starter Code (Needs Your Edits!)</span>
            )}
          </button>

          <button
            onClick={handleCompleteMission}
            disabled={!allSatisfied}
            className={`w-full font-bold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              allSatisfied
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950 cursor-pointer animate-pulse'
                : 'bg-slate-800 text-slate-400 cursor-not-allowed opacity-75'
            }`}
          >
            {allSatisfied ? (
              <>
                <span>★</span> {isCompleted ? '✓ Re-Verify & Celebrate!' : 'Check & Complete Mission'}
              </>
            ) : (
              <>
                <span>⏳</span> Goals Incomplete ({satisfiedCount} of {reqStatus.length} Met)
              </>
            )}
          </button>

          {isCompleted && activeMission.id < MISSIONS.length && (
            <button
              onClick={handleNext}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs py-2 rounded-lg transition-colors"
            >
              Next Mission ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
