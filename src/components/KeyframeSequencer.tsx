import React, { useState } from 'react';
import { Keyframe, JointAngles } from '../types/robot';
import { soundManager } from '../utils/audio';

interface KeyframeSequencerProps {
  keyframes: Keyframe[];
  onChangeKeyframes: (keyframes: Keyframe[]) => void;
  onApplyKeyframe: (angles: JointAngles) => void;
  currentAngles: JointAngles;
  isPlayingSequence: boolean;
  activeKeyframeIndex: number | null;
  onPlaySequence: () => void;
  onStopSequence: () => void;
}

export const KeyframeSequencer: React.FC<KeyframeSequencerProps> = ({
  keyframes,
  onChangeKeyframes,
  onApplyKeyframe,
  currentAngles,
  isPlayingSequence,
  activeKeyframeIndex,
  onPlaySequence,
  onStopSequence,
}) => {
  const [keyframeName, setKeyframeName] = useState<string>('Pose ' + (keyframes.length + 1));
  const [transitionDuration, setTransitionDuration] = useState<number>(500);

  const handleCapture = () => {
    const newKf: Keyframe = {
      id: 'kf_' + Math.random().toString(36).substring(2, 9),
      name: keyframeName.trim() || `Pose ${keyframes.length + 1}`,
      durationMs: transitionDuration,
      angles: { ...currentAngles },
    };
    onChangeKeyframes([...keyframes, newKf]);
    setKeyframeName(`Pose ${keyframes.length + 2}`);
    soundManager.playClick();
  };

  const handleDelete = (id: string) => {
    onChangeKeyframes(keyframes.filter((k) => k.id !== id));
    soundManager.playClick();
  };

  const handleMove = (index: number, dir: 'left' | 'right') => {
    const targetIdx = dir === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= keyframes.length) return;
    const next = [...keyframes];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    onChangeKeyframes(next);
  };

  return (
    <div className="bg-slate-950/90 border-t border-slate-800 p-2.5 text-slate-200 select-none">
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-tech font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Motion Timeline Sequencer
          </span>
          <span className="text-[11px] font-mono text-slate-400">({keyframes.length} Keyframes)</span>
        </div>

        <div className="flex items-center gap-2">
          {isPlayingSequence ? (
            <button
              onClick={onStopSequence}
              className="bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold px-3 py-1 rounded transition-colors flex items-center gap-1"
            >
              ■ Stop Sequence
            </button>
          ) : (
            <button
              onClick={onPlaySequence}
              disabled={keyframes.length === 0}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-mono text-xs font-bold px-3 py-1 rounded transition-colors flex items-center gap-1 shadow-sm"
            >
              ▶ Play Timeline
            </button>
          )}

          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            <input
              type="text"
              value={keyframeName}
              onChange={(e) => setKeyframeName(e.target.value)}
              placeholder="Pose name"
              className="bg-slate-900 border border-slate-700 text-xs px-2 py-1 rounded w-24 text-slate-200 font-mono"
            />
            <button
              onClick={handleCapture}
              className="bg-slate-800 hover:bg-cyan-900 hover:text-cyan-300 text-slate-200 font-mono text-xs px-2.5 py-1 rounded border border-slate-700 transition-colors"
            >
              + Record Current Pose
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal timeline keyframe blocks */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
        {keyframes.length === 0 ? (
          <div className="text-[11px] text-slate-500 italic py-1">
            No keyframes captured yet. Position joints with sliders and click "+ Record Current Pose" to build a motion choreography!
          </div>
        ) : (
          keyframes.map((kf, idx) => {
            const isActive = activeKeyframeIndex === idx;
            return (
              <div
                key={kf.id}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all shrink-0 ${
                  isActive
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/60'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => {
                    onApplyKeyframe(kf.angles);
                    soundManager.playClick();
                  }}
                  className="font-bold hover:text-cyan-400 text-left"
                  title="Click to preview pose"
                >
                  <span className="text-[10px] text-slate-500 block">#{idx + 1}</span>
                  <span>{kf.name}</span>
                </button>

                <div className="flex items-center gap-1 pl-1 border-l border-slate-800 text-[10px]">
                  <button
                    onClick={() => handleMove(idx, 'left')}
                    disabled={idx === 0}
                    className="text-slate-500 hover:text-white disabled:opacity-20"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'right')}
                    disabled={idx === keyframes.length - 1}
                    className="text-slate-500 hover:text-white disabled:opacity-20"
                  >
                    ▶
                  </button>
                  <button
                    onClick={() => handleDelete(kf.id)}
                    className="text-red-400 hover:text-red-300 ml-1"
                    title="Delete keyframe"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
