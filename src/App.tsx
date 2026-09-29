import React, { useEffect, useState, useRef } from "react";
import { BannerConfig } from "./types";
import BannerCanvas from "./components/BannerCanvas";
import MockProfile from "./components/MockProfile";
import EditorPanel from "./components/EditorPanel";
import AIHelper from "./components/AIHelper";
import AuthPanel from "./components/AuthPanel";
import DriveModal from "./components/DriveModal";
import QelomaMark from "./components/Logo";
import {
  Download,
  Eye,
  EyeOff,
  Shield,
  Award,
  CheckCircle2,
  RefreshCw,
  Laptop,
  Sun,
  Moon,
  HardDrive
} from "lucide-react";

// Neutral, fictional demo avatar as an inline SVG data URI: no real person,
// no external host, and — because data URIs are same-origin — it never
// taints the canvas, so the default banner always exports cleanly.
const DEMO_AVATAR =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#2b44e6"/><stop offset="1" stop-color="#6e83ff"/>' +
      "</linearGradient></defs>" +
      '<rect width="200" height="200" fill="url(#g)"/>' +
      '<circle cx="100" cy="78" r="36" fill="#eaf0ff"/>' +
      '<path d="M28 188c10-44 40-64 72-64s62 20 72 64v12H28z" fill="#eaf0ff"/>' +
      "</svg>",
  );

// Neutral, fictional demo profile — no real personal data (org privacy rule).
// A marketing persona on purpose: it shows the studio serves every
// profession, not just engineers. Single source of truth for the initial
// state and "Reset Demo".
const DEFAULT_CONFIG: BannerConfig = {
  name: "Jordan Ellis",
  title: "Product Marketing Lead",
  tagline: "I turn products into stories that convert — and campaigns that scale.",
  subTitle: "Brand Strategy • Demand Generation • Marketing Analytics",
  email: "jordan.ellis@example.com",
  location: "Singapore",
  skills: [
    "Brand Strategy",
    "Go-to-Market",
    "SEO & Content",
    "Lifecycle Email",
    "Analytics",
    "Paid Social",
  ],
  templateId: "sophisticated-dark",
  themeColor: "sophisticated-dark",
  accentColor: "#3b82f6",
  textColor: "#ffffff",
  bgPattern: "grid",
  customLogoUrl: "",
  customAvatarUrl: DEMO_AVATAR,
  showProfileSafeZone: true,
  safeZoneDevice: "desktop",
  gridOverlay: true,
  fontWeight: "bold",
  fontFamily: "Space Grotesk",
  customBgUrl: "",
  aiStyleMode: "Impact & Results-focused",
  highlights: [
    { label: "Experience", value: "8+ Years" },
    { label: "Launches", value: "40+ Campaigns" },
    { label: "Growth", value: "3× Pipeline" },
  ],
};

type Theme = "light" | "dark";

export default function App() {
  const [config, setConfig] = useState<BannerConfig>(DEFAULT_CONFIG);

  const [notification, setNotification] = useState<string | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);

  // Initial value comes from the pre-paint bootstrap in index.html.
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === "light" ? "light" : "dark",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("qeloma-theme", theme);
  }, [theme]);

  // Reference to hold the download/export function triggered from the canvas child
  const triggerExportRef = useRef<() => void>(() => {});

  const handleUpdateConfig = (updates: Partial<BannerConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleTriggerExport = () => {
    if (triggerExportRef.current) {
      triggerExportRef.current();
      showToast("High-resolution LinkedIn cover (1584x396px) generated and downloaded!");
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleResetToDefault = () => {
    setConfig(DEFAULT_CONFIG);
    showToast("Reset to the default demo profile!");
  };

  return (
    <div
      className="min-h-screen text-ink app-glow-grid flex flex-col font-sans relative transition-colors"
      id="studio-app-root">
      {/* Toast alert */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-surface border border-emerald-500/40 text-emerald-500 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider">{notification}</span>
        </div>
      )}

      {/* Header bar */}
      <header className="border-b border-line bg-surface/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3">
          <QelomaMark className="w-9 h-9 shrink-0" />
          <div>
            <h1 className="text-lg font-display font-bold tracking-tight text-ink flex items-center gap-2">
              Qeloma Cover Studio
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-brand/10 border border-brand/20 text-brand uppercase tracking-widest">
                Beta
              </span>
            </h1>
            <p className="text-xs text-muted hidden md:block">
              A standout LinkedIn cover for any profession — AI-drafted copy, safe-zone
              guides, high-res export
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsDriveModalOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-brand/30 bg-brand/10 hover:bg-brand/20 text-xs text-brand font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Open Google Drive integration studio">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Google Drive</span>
          </button>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg border border-line hover:bg-raised text-muted hover:text-ink transition-all cursor-pointer"
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={handleResetToDefault}
            className="px-3 py-1.5 rounded-lg border border-line hover:bg-raised text-xs text-muted hover:text-ink font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset text & style variables">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded bg-raised border border-line text-[10px] font-mono font-semibold text-faint">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Canvas Ready</span>
          </div>

          <AuthPanel />
        </div>
      </header>

      {/* Main dashboard content container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Dynamic Canvas Designer Area */}
        <section className="space-y-4" id="banner-canvas-section">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand" />
              <span>Real-Time Canvas Workspace (1584 x 396 px)</span>
            </h3>

            <div className="flex items-center gap-2.5">
              {/* Grid overlay toggle */}
              <button
                onClick={() => handleUpdateConfig({ gridOverlay: !config.gridOverlay })}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  config.gridOverlay
                    ? "bg-brand/10 border-brand/30 text-brand"
                    : "border-line text-faint hover:text-ink"
                }`}
                title="Toggle bento separator boundaries">
                <span>Bento Grid Borders:</span>
                <span className="font-mono uppercase">{config.gridOverlay ? "ON" : "OFF"}</span>
              </button>

              {/* Safe zone overlay indicator toggle */}
              <button
                onClick={() =>
                  handleUpdateConfig({ showProfileSafeZone: !config.showProfileSafeZone })
                }
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  config.showProfileSafeZone
                    ? "bg-mark/10 border-mark/30 text-mark"
                    : "border-line text-faint hover:text-ink"
                }`}
                title="Toggle LinkedIn profile image shadow region">
                {config.showProfileSafeZone ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span>Avatar Overlap Guide</span>
              </button>
            </div>
          </div>

          {/* Active Canvas wrapper */}
          <div className="relative group rounded-xl overflow-hidden p-0.5 bg-raised border border-line">
            <BannerCanvas
              config={config}
              onExportRef={(fn) => {
                triggerExportRef.current = fn;
              }}
            />

            {/* Embedded Action Bar */}
            <div className="absolute right-4 bottom-4 flex items-center gap-2.5">
              <button
                onClick={() => setIsDriveModalOpen(true)}
                className="px-4 py-2.5 bg-surface/90 backdrop-blur-md hover:bg-surface border border-line text-ink font-bold rounded-lg text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer">
                <HardDrive className="w-4 h-4 text-brand" />
                <span className="hidden sm:inline">Save to Google Drive</span>
              </button>

              <button
                onClick={handleTriggerExport}
                className="px-5 py-2.5 bg-brand hover:opacity-90 text-on-brand font-extrabold rounded-lg text-xs transition-all flex items-center gap-2 shadow-xl shadow-brand/20 cursor-pointer">
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download High-Res PNG</span>
              </button>
            </div>
          </div>
        </section>

        {/* Column splits: Controls vs Previews & AI */}
        {/* Split at xl (not lg) so scaled/mid-width displays get stacked,
            full-width sections instead of two cramped columns. */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="controls-preview-grid">
          {/* LEFT: Controls (Style settings, inputs, badges) (7 cols) */}
          <div className="xl:col-span-7 space-y-6">
            {/* The Tabbed Editor panel */}
            <EditorPanel config={config} onChangeConfig={handleUpdateConfig} />

            {/* Profile Placement mockup simulator */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-brand" />
                  <span>Simulated LinkedIn Profile Preview</span>
                </div>
              </h3>
              <MockProfile config={config} />
            </div>
          </div>

          {/* RIGHT: AI Copywriter & guidance (5 cols) */}
          <div className="xl:col-span-5 space-y-6">
            {/* AI Copywriting draft assistant */}
            <AIHelper config={config} onChangeConfig={handleUpdateConfig} />

            {/* Quick Tips & Platform Guidelines card */}
            <div className="bg-surface border border-line rounded-xl p-5 space-y-4 transition-colors">
              <h4 className="text-xs font-bold text-ink uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand" />
                <span>Design Checklist & Safe-Zone Rules</span>
              </h4>

              <ul className="space-y-3 text-xs text-muted">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-ink">Keep text clear of the avatar</strong>:
                    LinkedIn's profile photo covers the bottom-left of your banner. Keep
                    your name, title, and tagline center-right so nothing important is
                    hidden on desktop or mobile.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-ink">One message per banner</strong>: a name, a
                    role, and a single value line beat a wall of text. Use the highlights
                    panel for numbers — years, launches, certifications — instead of
                    cramming them into the tagline.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-ink">Contrast is credibility</strong>: pick a
                    preset that matches your headshot's lighting — dark themes for studio
                    shots, <em>Minimal Light</em> for bright outdoor photos — so the whole
                    profile reads as one design.
                  </span>
                </li>
              </ul>

              <div className="bg-raised rounded-lg p-3.5 border border-line flex items-center gap-3">
                <Award className="w-6 h-6 text-amber-500 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-ink uppercase tracking-wider">
                    LinkedIn Spec Optimization
                  </p>
                  <p className="text-[10px] text-faint">
                    1584x396px output at exactly 4:1 aspect ratio, meeting LinkedIn's
                    precise uploading standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer bar */}
      <footer className="mt-12 border-t border-line bg-surface/80 py-6 px-6 text-center text-xs text-faint transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-2">
            <QelomaMark className="w-4 h-4" />
            <span>© 2026 Qeloma Cover Studio. Craft a standout LinkedIn banner in minutes.</span>
          </p>
          <div className="flex items-center gap-4">
            <span>Built by Qeloma • Powered by Gemini AI</span>
            <span>•</span>
            <span className="hover:text-muted cursor-pointer">Privacy-first</span>
          </div>
        </div>
      </footer>

      {/* Google Drive Integration Modal */}
      <DriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        config={config}
        onLoadConfig={(newConfig) => {
          setConfig(newConfig);
          showToast("Loaded banner template from Google Drive!");
        }}
        getCanvasDataUrl={() => {
          const canvas = document.querySelector("#banner-canvas-section canvas") as HTMLCanvasElement;
          return canvas ? canvas.toDataURL("image/png") : null;
        }}
      />
    </div>
  );
}
