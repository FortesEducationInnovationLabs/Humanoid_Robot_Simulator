import React, { useState } from 'react';
import { StabilityTelemetry } from '../types/robot';

interface TelemetryOverlayProps {
  telemetry: StabilityTelemetry;
  physicsMode: boolean;
  onTogglePhysics: (val: boolean) => void;
  showCoM: boolean;
  onToggleCoM: (val: boolean) => void;
  showSupportPoly: boolean;
  onToggleSupportPoly: (val: boolean) => void;
  wireframe: boolean;
  onToggleWireframe: (val: boolean) => void;
  isRunning?: boolean;
  onStopProgram?: () => void;
  onResetRobot?: () => void;
  onNudge?: (dir: 'forward' | 'backward' | 'hazard' | 'reset') => void;
  onTestReflex?: () => void;
  hasTiltReflex?: boolean;
  showTester?: boolean;
  tiltProtectionEnabled?: boolean;
  onToggleTiltProtection?: () => void;
}

export const TelemetryOverlay: React.FC<TelemetryOverlayProps> = ({
  telemetry,
  physicsMode,
  onTogglePhysics,
  showCoM,
  onToggleCoM,
  showSupportPoly,
  onToggleSupportPoly,
  wireframe,
  onToggleWireframe,
  isRunning = false,
  onStopProgram,
  onResetRobot,
  onNudge,
  onTestReflex,
  hasTiltReflex,
  showTester = false,
  tiltProtectionEnabled = true,
  onToggleTiltProtection,
}) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [testerCollapsed, setTesterCollapsed] = useState<boolean>(false);

  const currentTilt = Math.max(
    Math.abs(telemetry.gyro?.pitch ?? 0),
    Math.abs(telemetry.gyro?.roll ?? 0)
  );

  const getStatusText = () => {
    switch (telemetry.status) {
      case 'stable':
        return { label: 'Balanced', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' };
      case 'dynamic':
        return { label: 'Moving', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' };
      case 'unstable':
        if (telemetry.yawTorque !== undefined && Math.abs(telemetry.yawTorque) > 3.0) {
          return { label: 'Unbalanced (Yaw Twist)', color: 'bg-amber-500/25 text-amber-300 border-amber-500/40', dot: 'bg-amber-400' };
        }
        return { label: 'Tipping Over', color: 'bg-red-500/20 text-red-300 border-red-500/30', dot: 'bg-red-500' };
      case 'fallen':
        return { label: 'Fallen Down', color: 'bg-red-500/30 text-red-200 border-red-400', dot: 'bg-red-600' };
    }
  };

  const status = getStatusText();

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 select-none font-sans overflow-hidden">
      {/* Top Right: Minimal Student Status Pill & Quick Controls */}
      <div className="self-end pointer-events-auto flex flex-col items-end gap-1.5">
      {/* Minimal Student Status Pill */}
      <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-full shadow-lg">
        {/* Stop Program button right on overlay when running */}
        {isRunning && onStopProgram && (
          <button
            onClick={onStopProgram}
            className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center gap-1 transition-all shadow-md shadow-red-950 animate-pulse cursor-pointer"
            title="Stop running program immediately"
          >
            <span>■</span> Stop
          </button>
        )}

        {/* Balance Status */}
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${status.color}`}>
          <span className={`w-2 h-2 rounded-full ${status.dot} ${telemetry.status === 'unstable' ? 'animate-ping' : ''}`} />
          <span>{status.label}</span>
        </div>

        {/* Dynamic Torso Yaw / Twist Alert Pill (shows if unbalanced arm-leg stride) */}
        {telemetry.yawTorque !== undefined && Math.abs(telemetry.yawTorque) > 3.0 && (
          <div
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300 text-xs font-semibold animate-pulse"
            title={`Torso twisting torque: ${telemetry.yawTorque > 0 ? '+' : ''}${telemetry.yawTorque} N·m (Veering off course)`}
          >
            <span>↻</span>
            <span>Yaw Twist: {telemetry.yawTorque > 0 ? '+' : ''}{telemetry.yawTorque} N·m</span>
          </div>
        )}

        {/* Quick Stand button if fallen */}
        {(telemetry.status === 'fallen' || (telemetry.status === 'unstable' && telemetry.margin <= 0)) && onResetRobot && (
          <button
            onClick={onResetRobot}
            className="text-xs px-2 py-0.5 rounded-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold transition-all shadow cursor-pointer flex items-center gap-1"
            title="Reset robot back to upright stand"
          >
            <span>↺</span> Stand Up
          </button>
        )}

        {/* Physics Toggle Button */}
        <button
          onClick={() => onTogglePhysics(!physicsMode)}
          className={`text-xs px-2.5 py-0.5 rounded-full transition-colors font-medium border ${
            physicsMode
              ? 'bg-amber-400 text-slate-950 font-bold border-amber-300'
              : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
          }`}
          title="Turn Gravity and Falling on or off"
        >
          Physics: {physicsMode ? 'ON' : 'OFF'}
        </button>

        {/* Quiet Details Drawer Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-slate-400 hover:text-slate-200 px-1 py-0.5 rounded"
          title="Toggle sensor readings"
        >
          {showDetails ? '✕' : '⚙'}
        </button>
      </div>

      {/* Optional Minimal Settings Card (shown only when student clicks ⚙) */}
      {showDetails && (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-xl w-60 text-xs text-slate-300 space-y-2.5 animate-in fade-in slide-in-from-top-2">
          <div className="font-semibold text-slate-200 flex items-center justify-between pb-1 border-b border-slate-800">
            <span>Visual Overlays</span>
            <span className="text-[10px] text-slate-500 font-mono">Sensors</span>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center justify-between cursor-pointer hover:text-white">
              <span>Show Center of Mass</span>
              <input
                type="checkbox"
                checked={showCoM}
                onChange={(e) => onToggleCoM(e.target.checked)}
                className="accent-yellow-400 rounded w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-white">
              <span>Show Feet Footprint</span>
              <input
                type="checkbox"
                checked={showSupportPoly}
                onChange={(e) => onToggleSupportPoly(e.target.checked)}
                className="accent-yellow-400 rounded w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:text-white">
              <span>Wireframe View</span>
              <input
                type="checkbox"
                checked={wireframe}
                onChange={(e) => onToggleWireframe(e.target.checked)}
                className="accent-yellow-400 rounded w-4 h-4"
              />
            </label>
          </div>

          <div className="pt-1.5 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Tilt: {Math.round(Math.abs(telemetry.gyro.pitch))}°</span>
              <span>Feet: {telemetry.footPressureL}% L / {telemetry.footPressureR}% R</span>
            </div>
            {telemetry.yawTorque !== undefined && (
              <div className="flex justify-between items-center text-[11px]">
                <span>Torso Twist (Yaw):</span>
                <span className={`font-mono font-semibold ${
                  Math.abs(telemetry.yawTorque) <= 2.0
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}>
                  {telemetry.yawTorque > 0 ? '+' : ''}{telemetry.yawTorque} N·m {Math.abs(telemetry.yawTorque) <= 2.0 ? '✓ Balanced' : '⚠ Veering'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Interactive Fall & Balance Tester (Only displayed in Mission 9) */}
      {showTester && (
        <div className="self-center pointer-events-auto flex flex-col items-center">
          {testerCollapsed ? (
            <button
              onClick={() => setTesterCollapsed(false)}
              className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 px-3 py-1 rounded-full shadow-xl text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Expand Fall & Balance Tester"
            >
              <span>🎮</span>
              <span className="font-semibold">Mission 9 Fall & Balance Tester</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                  currentTilt > 15
                    ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                Tilt: {Math.round(currentTilt)}° {currentTilt > 15 ? '🚨 HAZARD' : 'Safe'}
              </span>
              <span className="text-[10px] text-slate-400">▲ Expand</span>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-2 sm:p-2.5 rounded-2xl shadow-2xl text-xs max-w-[95vw] animate-in fade-in slide-in-from-bottom-2">
              {/* Header row */}
              <div className="flex items-center justify-between w-full gap-3 px-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                  <span className="text-amber-400">🎮</span>
                  <span>Mission 9: Fall & Balance Tester</span>
                </div>

                {/* Real-time Gyro IMU Gauge */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-bold transition-all ${
                    currentTilt > 15
                      ? 'bg-red-500/25 text-red-300 border-red-500/50 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                  title={`Live 6-axis IMU Gyro Pitch/Roll: ${Math.round(currentTilt)}°`}
                >
                  <span className={`w-2 h-2 rounded-full ${currentTilt > 15 ? 'bg-red-400 animate-ping' : 'bg-emerald-400'}`} />
                  <span>Tilt: {Math.round(currentTilt)}°</span>
                  <span className="text-[10px] uppercase tracking-wider font-sans">
                    {currentTilt > 15 ? '🚨 Hazard (>15°)' : 'Safe'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden lg:inline-block text-[10px] text-slate-400 font-mono">
                    Keys: [W/↑ Lean Fwd] [S/↓ Lean Back] [Space Reset]
                  </span>
                  <button
                    onClick={() => setTesterCollapsed(true)}
                    className="text-slate-400 hover:text-slate-200 text-xs px-1 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    title="Minimize tester toolbar"
                  >
                    ▼
                  </button>
                </div>
              </div>

              {/* Interactive Control Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1.5 border-t border-slate-800/80 w-full">
                {/* Reflex Toggle: With vs Without Tilt Protection */}
                {onToggleTiltProtection && (
                  <button
                    onClick={onToggleTiltProtection}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      tiltProtectionEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                    }`}
                    title="Toggle closed-loop Gyro Reflex protection to compare behavior with and without protection"
                  >
                    <span>{tiltProtectionEnabled ? '🛡️ Reflex: ON' : '⚠️ Reflex: OFF (Open-Loop)'}</span>
                  </button>
                )}

                <button
                  onClick={() => onNudge?.('forward')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 hover:text-white rounded-lg border border-slate-700 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                  title="Move legs/torso forward (Keyboard: W or ArrowUp)"
                >
                  <span>⬆️</span> Lean Fwd <kbd className="text-[9px] bg-slate-950 px-1 py-0.5 rounded text-slate-400 font-mono">W</kbd>
                </button>

                <button
                  onClick={() => onNudge?.('backward')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 hover:text-white rounded-lg border border-slate-700 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                  title="Move legs/torso backward (Keyboard: S or ArrowDown)"
                >
                  <span>⬇️</span> Lean Back <kbd className="text-[9px] bg-slate-950 px-1 py-0.5 rounded text-slate-400 font-mono">S</kbd>
                </button>

                <button
                  onClick={() => onNudge?.('hazard')}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg border border-amber-500/40 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  title="Command a dangerous 22° forward tilt to test if the robot detects falling"
                >
                  <span>⚡</span> 22° Tilt Hazard
                </button>

                {onTestReflex && (
                  <button
                    onClick={() => onTestReflex()}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-lg border border-red-400 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-950 transition-all cursor-pointer"
                    title="Command hazard tilt and trigger your Gyro Reflex routine"
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>🚨 Test Reflex</span>
                  </button>
                )}

                <button
                  onClick={() => onNudge?.('reset')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                  title="Reset robot to steady upright stand (Keyboard: Space or R)"
                >
                  <span>↺</span> Stand <kbd className="text-[9px] bg-slate-950 px-1 py-0.5 rounded text-slate-400 font-mono">Space</kbd>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
