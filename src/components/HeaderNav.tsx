import React from 'react';
import { soundManager } from '../utils/audio';
import { SUNMARKE_SCHOOL_LOGO, APP_NAME, APP_SUBTITLE } from '../constants/branding';

interface HeaderNavProps {
  activeView: 'code' | 'sliders' | 'missions';
  onChangeView: (view: 'code' | 'sliders' | 'missions') => void;
  soundEnabled: boolean;
  onToggleSound: (val: boolean) => void;
  onResetRobot: () => void;
  completedMissionsCount: number;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  isRunning?: boolean;
  onRunProgram?: () => void;
  onStopProgram?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeView,
  onChangeView,
  soundEnabled,
  onToggleSound,
  onResetRobot,
  completedMissionsCount,
  sidebarOpen,
  onToggleSidebar,
  isRunning = false,
  onRunProgram,
  onStopProgram,
}) => {
  const [showExportModal, setShowExportModal] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);

  const handleDownloadHtml = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/download-html');
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Humanoid_Simulator_v1.0.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading HTML:', err);
      window.location.href = '/api/download-html';
    } finally {
      setDownloading(false);
    }
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between select-none shrink-0 z-20">
      {/* Brand */}
      <div className="flex items-center gap-3">
        {/* Sunmarke School Logo */}
        <div className="flex items-center">
          <div className="h-9 px-2.5 bg-white rounded-lg border border-slate-700/50 flex items-center justify-center shadow-sm">
            <img
              src={SUNMARKE_SCHOOL_LOGO}
              alt="Sunmarke School Logo"
              className="h-7 w-auto max-w-[130px] object-contain"
            />
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 hidden sm:block" />

        {/* Humanoid Robot Logo Emblem */}
        <div
          className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-slate-950 flex items-center justify-center shadow-md shadow-amber-950/40 shrink-0"
          title="Humanoid Simulator"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Robot Head */}
            <circle cx="12" cy="4" r="2.2" strokeWidth="1.8" />
            <circle cx="12" cy="4" r="0.8" fill="currentColor" />
            {/* Torso */}
            <path d="M9 7.5h6a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5H9a1.5 1.5 0 0 1-1.5-1.5V9A1.5 1.5 0 0 1 9 7.5z" strokeWidth="1.8" />
            {/* Center Core Indicator */}
            <circle cx="12" cy="11" r="1" fill="currentColor" />
            {/* Arms */}
            <path d="M7.5 9L5 12.5l1.5 2" strokeWidth="1.8" />
            <path d="M16.5 9L19 12.5l-1.5 2" strokeWidth="1.8" />
            {/* Pelvis to Legs */}
            <path d="M10 14.5L9 18l-1.5 3.5" strokeWidth="1.8" />
            <path d="M14 14.5L15 18l1.5 3.5" strokeWidth="1.8" />
          </svg>
        </div>

        <div>
          <div className="font-tech font-bold text-slate-100 text-sm tracking-wide uppercase leading-tight">
            {APP_NAME}
          </div>
          <div className="text-[11px] text-yellow-400 font-medium tracking-wide">
            {APP_SUBTITLE}
          </div>
        </div>
      </div>

      {/* 3 Main Student Tabs */}
      <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => {
            onChangeView('missions');
            soundManager.playClick();
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeView === 'missions' && sidebarOpen
              ? 'bg-yellow-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <span>🎯 Missions</span>
          <span className="text-[10px] opacity-80">({completedMissionsCount}/10)</span>
        </button>

        <button
          onClick={() => {
            onChangeView('code');
            soundManager.playClick();
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeView === 'code' && sidebarOpen
              ? 'bg-yellow-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <span>🧩 Code Blocks</span>
        </button>

        <button
          onClick={() => {
            onChangeView('sliders');
            soundManager.playClick();
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeView === 'sliders' && sidebarOpen
              ? 'bg-yellow-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <span>🎛️ Sliders</span>
        </button>
      </nav>

      {/* Quick Toolbar */}
      <div className="flex items-center gap-2">
        {/* Run / Stop Code Global Control */}
        {isRunning ? (
          <button
            onClick={onStopProgram}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 transition-all shadow-md shadow-red-950 animate-pulse"
            title="Stop running program immediately"
          >
            <span>■</span> STOP CODE
          </button>
        ) : onRunProgram ? (
          <button
            onClick={onRunProgram}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950"
            title="Run code blocks"
          >
            <span>▶</span> RUN CODE
          </button>
        ) : null}

        <button
          onClick={onResetRobot}
          className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1"
          title="Reset robot to standing pose and upright balance"
        >
          <span>↺</span> Reset Stand
        </button>

        {/* Download Standalone HTML Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            setShowExportModal(true);
            handleDownloadHtml();
          }}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 transition-all flex items-center gap-1.5 shadow-md shadow-amber-950/40"
          title="Download standalone offline HTML file"
        >
          <span>📥</span>
          <span>Download HTML</span>
        </button>

        <button
          onClick={() => {
            onToggleSound(!soundEnabled);
            soundManager.enabled = !soundEnabled;
          }}
          className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title={soundEnabled ? 'Mute Sounds' : 'Turn Sound On'}
        >
          {soundEnabled ? '🔊 Sound' : '🔇 Muted'}
        </button>

        <button
          onClick={onToggleSidebar}
          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
            sidebarOpen
              ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              : 'bg-yellow-400 text-slate-950 font-bold border-yellow-300'
          }`}
          title={sidebarOpen ? 'Collapse side panel for large 3D view' : 'Open side panel'}
        >
          {sidebarOpen ? 'Full 3D' : 'Open Tools ➔'}
        </button>
      </div>

      {/* Export / Standalone HTML Dialog */}
      {showExportModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowExportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors text-base"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center text-xl border border-amber-400/40 shrink-0">
                📥
              </div>
              <div>
                <h3 className="font-tech font-bold text-base text-white tracking-wide">
                  Download Humanoid Simulator v1.0
                </h3>
                <p className="text-xs text-amber-400 font-mono">
                  100% Self-Contained Offline Webapp (.html)
                </p>
              </div>
            </div>

            {/* Download Status Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-semibold text-slate-200">
                    {downloading ? 'Preparing download...' : 'File ready: Humanoid_Simulator_v1.0.html'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">~1.2 MB</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Your browser should automatically prompt or save the HTML file to your Downloads folder.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleDownloadHtml}
                  disabled={downloading}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span>⬇️</span>
                  <span>{downloading ? 'Downloading...' : 'Click Here to Download Again'}</span>
                </button>
                <a
                  href="/api/download-html"
                  download="Humanoid_Simulator_v1.0.html"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  Direct Link
                </a>
              </div>
            </div>

            {/* How to use offline */}
            <div className="space-y-3 mb-5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                How to use your downloaded file:
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">1.</span>
                  <span>
                    <strong>Open directly:</strong> Double-click <code className="text-amber-300 bg-slate-800 px-1 py-0.5 rounded text-[11px]">Humanoid_Simulator_v1.0.html</code> or drag it into Chrome, Edge, Safari, or Firefox.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">2.</span>
                  <span>
                    <strong>No internet needed:</strong> All 3D WebGL meshes, kinematics, audio synth, and 10 coding missions are fully embedded inside the HTML.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">3.</span>
                  <span>
                    <strong>Easy sharing:</strong> Distribute it to students via Google Classroom, USB drives, or school network drives.
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
