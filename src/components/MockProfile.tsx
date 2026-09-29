import React, { useEffect, useState } from "react";
import { BannerConfig } from "../types";
import BannerCanvas from "./BannerCanvas";
import {
  MapPin, Mail, ExternalLink, ShieldCheck, Award, Maximize2, X,
  User, UserCheck, Briefcase, GraduationCap, Building2, MessageSquare,
  Search, Bell, Grid, Compass, CheckCircle2, Share2
} from "lucide-react";

interface MockProfileProps {
  config: BannerConfig;
}

// Preset attractive avatar options for users who want a quick professional preview avatar
const PRESET_AVATARS = [
  {
    id: "silhouette",
    label: "Generic Transparent",
    url: "",
  },
  {
    id: "alex",
    label: "Professional 1",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "marcus",
    label: "Professional 2",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "sarah",
    label: "Professional 3",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
  },
];

export default function MockProfile({ config }: MockProfileProps) {
  const isMobile = config.safeZoneDevice === "mobile";
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [isFullScreenModalOpen, setIsFullScreenModalOpen] = useState(false);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(config.customAvatarUrl || "");

  useEffect(() => {
    setSelectedAvatarUrl(config.customAvatarUrl || "");
    setAvatarFailed(false);
  }, [config.customAvatarUrl]);

  // Close full screen modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullScreenModalOpen(false);
    };
    if (isFullScreenModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreenModalOpen]);

  const showAvatarImage = Boolean(selectedAvatarUrl) && !avatarFailed;

  // Generic transparent / vector silhouette avatar SVG component
  const GenericAvatarSvg = () => (
    <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden">
      <svg className="w-2/3 h-2/3 text-slate-400 dark:text-slate-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );

  return (
    <>
      <div className="bg-surface border border-line rounded-xl overflow-hidden shadow-sm transition-colors" id="mock-profile-preview">
        {/* Simulation Header bar */}
        <div className="bg-raised px-4 py-2.5 border-b border-line flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
            <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
            <div className="w-3 h-3 rounded-full bg-[#10b981]" />
            <span className="text-xs font-mono text-muted ml-2">LinkedIn Profile Preview Simulator</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand/10 text-brand uppercase tracking-widest text-[10px]">
              {config.safeZoneDevice} Mockup
            </span>

            {/* FULL SCREEN VIEW BUTTON */}
            <button
              onClick={() => setIsFullScreenModalOpen(true)}
              className="px-3 py-1 bg-brand hover:opacity-90 text-on-brand text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-brand/10 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Screen View</span>
            </button>
          </div>
        </div>

        {/* Quick Avatar Preset Selector Bar */}
        <div className="bg-app/50 px-4 py-2 border-b border-line flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-faint font-medium text-[11px]">Mockup Avatar Mode:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PRESET_AVATARS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedAvatarUrl(preset.url);
                  setAvatarFailed(false);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedAvatarUrl === preset.url
                    ? "bg-brand text-on-brand shadow-sm"
                    : "bg-surface border border-line text-muted hover:text-ink"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main mockup card container */}
        <div className="bg-surface text-ink p-0 relative">
          <div className="relative w-full select-none">
            <BannerCanvas
              config={{ ...config, showProfileSafeZone: false }}
              embedded
            />

            {/* LinkedIn profile photo overlapping banner bottom edge */}
            <div
              className={`absolute z-10 aspect-square rounded-full border-4 border-surface bg-raised transition-all duration-300 shadow-xl overflow-hidden flex items-center justify-center ${
                isMobile
                  ? "left-[6%] bottom-0 translate-y-1/3 h-[70%]"
                  : "left-[4%] bottom-0 translate-y-1/3 h-[80%]"
              }`}
            >
              {showAvatarImage ? (
                <img
                  src={selectedAvatarUrl}
                  alt={config.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <GenericAvatarSvg />
              )}
            </div>
          </div>

          {/* LinkedIn metadata detail block */}
          <div className="p-6 pt-[9%] bg-surface relative">
            <div className="absolute right-6 top-4 flex items-center gap-1.5 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-brand" />
              <span className="text-[10px] font-bold text-brand uppercase tracking-widest">AI Optimized</span>
            </div>

            <div className="space-y-1.5 mt-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-display font-bold text-ink tracking-tight">{config.name}</h2>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold">
                  <Award className="w-3 h-3" />
                  <span>GOLD CREATOR</span>
                </div>
              </div>

              <p className="text-sm font-medium text-muted max-w-2xl">{config.title}</p>

              <p className="text-xs text-muted flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-faint" />
                  {config.location}
                </span>
                <span className="text-line">•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-faint" />
                  {config.email}
                </span>
                <span className="text-line">•</span>
                <span className="text-brand hover:underline cursor-pointer flex items-center gap-1">
                  Contact info
                  <ExternalLink className="w-3 h-3" />
                </span>
              </p>

              <p className="text-xs text-muted font-semibold pt-1">
                <span className="text-ink font-bold">892</span> followers <span className="text-line">•</span> <span className="text-ink font-bold">500+</span> connections
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button className="px-5 py-1.5 rounded-full bg-brand hover:opacity-90 text-on-brand text-xs font-bold transition-all shadow-md shadow-brand/10">
                Open to work
              </button>
              <button className="px-5 py-1.5 rounded-full border border-line hover:bg-raised text-muted text-xs font-bold transition-all">
                Add profile section
              </button>
              <button className="px-5 py-1.5 rounded-full border border-line hover:bg-raised text-muted text-xs font-bold transition-all">
                More
              </button>

              <div className="ml-auto flex items-center gap-2 text-[11px] text-faint bg-raised px-3 py-1.5 rounded border border-line">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Actively looking for {config.title} roles</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-line">
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-2.5">About Focus Summary</h3>
              <p className="text-xs text-muted leading-relaxed max-w-3xl">
                {config.tagline}
                {config.subTitle ? ` ${config.subTitle}.` : ""}
                {config.skills.length > 0 ? ` Core strengths: ${config.skills.slice(0, 6).join(", ")}.` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FULL SCREEN LINKEDIN PROFILE SIMULATION MODAL */}
      {isFullScreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-8 overflow-y-auto animate-fadeIn">
          <div className="bg-[#f3f2ef] dark:bg-slate-950 w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 my-auto relative max-h-[92vh] flex flex-col">
            
            {/* Simulated Desktop Browser Titlebar */}
            <div className="bg-slate-900 text-slate-200 px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0 select-none">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                  <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                </div>
                <div className="bg-slate-800 px-3 py-1 rounded-md text-xs font-mono text-slate-400 flex items-center gap-2">
                  <span className="text-emerald-400">https://</span>
                  <span>linkedin.com/in/{config.name.toLowerCase().replace(/\s+/g, "")}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">Real Profile View Simulator</span>
                <button
                  onClick={() => setIsFullScreenModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                  title="Close Full Screen View (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simulated LinkedIn Navigation Bar */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#0a66c2] text-white font-bold flex items-center justify-center text-lg">
                  in
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md flex items-center gap-2 text-slate-500 text-xs w-48 hidden sm:flex">
                  <Search className="w-3.5 h-3.5" />
                  <span>Search LinkedIn</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-slate-500 text-[11px] font-medium">
                <div className="flex flex-col items-center gap-0.5 text-[#0a66c2] border-b-2 border-[#0a66c2] pb-0.5">
                  <Compass className="w-4 h-4" />
                  <span>Home</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 hover:text-slate-900 dark:hover:text-slate-100">
                  <User className="w-4 h-4" />
                  <span>My Network</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 hover:text-slate-900 dark:hover:text-slate-100">
                  <Briefcase className="w-4 h-4" />
                  <span>Jobs</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 hover:text-slate-900 dark:hover:text-slate-100">
                  <MessageSquare className="w-4 h-4" />
                  <span>Messaging</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 hover:text-slate-900 dark:hover:text-slate-100">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </div>
              </div>
            </div>

            {/* Simulated LinkedIn Page Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              
              {/* Profile Card Block */}
              <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                
                {/* Cover Banner Area */}
                <div className="relative w-full">
                  <BannerCanvas
                    config={{ ...config, showProfileSafeZone: false }}
                    embedded
                  />

                  {/* LinkedIn Profile Avatar overlapping */}
                  <div className="absolute left-6 md:left-8 bottom-0 translate-y-1/3 w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-2xl overflow-hidden flex items-center justify-center">
                    {showAvatarImage ? (
                      <img
                        src={selectedAvatarUrl}
                        alt={config.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <GenericAvatarSvg />
                    )}
                  </div>
                </div>

                {/* Profile Header Details */}
                <div className="p-6 md:p-8 pt-12 md:pt-16">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                          {config.name}
                        </h1>
                        <CheckCircle2 className="w-5 h-5 text-[#0a66c2]" />
                      </div>
                      <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium mt-1 max-w-2xl">
                        {config.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-2 flex flex-wrap items-center gap-3">
                        <span>{config.location}</span>
                        <span>•</span>
                        <span className="text-[#0a66c2] font-semibold hover:underline cursor-pointer">
                          Contact info
                        </span>
                      </p>
                      <p className="text-xs font-bold text-[#0a66c2] mt-2">
                        500+ connections
                      </p>
                    </div>

                    <div className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span>Senior Creator & Tech Strategist</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                        <span>Computer Science & Business</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button className="px-5 py-2 rounded-full bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-bold transition-all shadow-md">
                      Open to work
                    </button>
                    <button className="px-5 py-2 rounded-full border border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2]/10 text-xs font-bold transition-all">
                      Add profile section
                    </button>
                    <button className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all">
                      More
                    </button>
                  </div>
                </div>
              </div>

              {/* About Section Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">About</h2>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {config.tagline} {config.subTitle ? `${config.subTitle}.` : ""}
                </p>

                {config.skills.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Top Skills
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {config.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs text-slate-700 dark:text-slate-300 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                This shows exact proportion and overlap on real 1584x396 LinkedIn display displays.
              </span>
              <button
                onClick={() => setIsFullScreenModalOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

