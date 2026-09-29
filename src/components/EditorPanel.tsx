import React, { useState } from "react";
import { BannerConfig } from "../types";
import {
  User, Palette, BadgePlus, BarChart3, Plus, X, Laptop, Smartphone,
  Info, Layout, Mail, MapPin,
  Image as ImageIcon, UserCircle2, Sticker
} from "lucide-react";

interface EditorPanelProps {
  config: BannerConfig;
  onChangeConfig: (updates: Partial<BannerConfig>) => void;
}

type TabId = "text" | "style" | "skills" | "highlights" | "images";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "text", label: "Identity", icon: User },
  { id: "style", label: "Theme & Style", icon: Palette },
  { id: "skills", label: "Skill Badges", icon: BadgePlus },
  { id: "highlights", label: "Highlights", icon: BarChart3 },
  { id: "images", label: "Images", icon: ImageIcon },
];

// Shared field styling so every input in the panel stays consistent.
const inputCls =
  "w-full bg-app border border-line focus:border-brand rounded-lg px-3 py-2 text-xs text-ink placeholder-faint transition-all outline-none";
const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-muted mb-1";

export default function EditorPanel({ config, onChangeConfig }: EditorPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("text");
  const [newSkill, setNewSkill] = useState("");

  const presets = [
    {
      id: "sophisticated-dark",
      name: "Sophisticated Dark",
      themeColor: "sophisticated-dark",
      accentColor: "#3b82f6",
      textColor: "#ffffff",
      bgPattern: "grid"
    },
    {
      id: "tech-navy",
      name: "Tech Navy (AI)",
      themeColor: "tech-navy",
      accentColor: "#38bdf8",
      textColor: "#ffffff",
      bgPattern: "circuit"
    },
    {
      id: "deep-space",
      name: "Deep Space",
      themeColor: "deep-space",
      accentColor: "#10b981",
      textColor: "#f3f4f6",
      bgPattern: "grid"
    },
    {
      id: "warm-sunset",
      name: "Sunset Cyber",
      themeColor: "warm-sunset",
      accentColor: "#f97316",
      textColor: "#fafaf9",
      bgPattern: "waves"
    },
    {
      id: "minimal-white",
      name: "Minimal Light",
      themeColor: "minimal-white",
      accentColor: "#1e293b",
      textColor: "#0f172a",
      bgPattern: "grid"
    },
    {
      id: "cyan-gradient",
      name: "Teal Wave",
      themeColor: "cyan-gradient",
      accentColor: "#2dd4bf",
      textColor: "#f0fdfa",
      bgPattern: "waves"
    }
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    onChangeConfig({
      templateId: preset.id,
      themeColor: preset.themeColor,
      accentColor: preset.accentColor,
      textColor: preset.textColor,
      bgPattern: preset.bgPattern
    });
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (config.skills.includes(newSkill.trim())) {
      setNewSkill("");
      return;
    }
    onChangeConfig({
      skills: [...config.skills, newSkill.trim()]
    });
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onChangeConfig({
      skills: config.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleHighlightChange = (index: number, field: "label" | "value", newValue: string) => {
    const updated = [...config.highlights];
    updated[index] = { ...updated[index], [field]: newValue };
    onChangeConfig({ highlights: updated });
  };

  return (
    <div className="bg-surface border border-line rounded-xl overflow-hidden shadow-sm transition-colors" id="editor-control-panel">
      {/* Editor Header Bar */}
      <div className="bg-raised/80 px-4 py-2 border-b border-line flex items-center justify-between gap-2">
        <span className="text-xs font-mono font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
          <span>Design Studio Controls</span>
        </span>
      </div>

      {/* Editor Tab Navigation */}
      <div className="flex border-b border-line bg-raised/60 p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === id
                ? "bg-surface text-brand border border-line shadow-sm"
                : "text-faint hover:text-ink"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* TAB 1: IDENTITY & COPY */}
        {activeTab === "text" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 text-brand text-xs font-bold uppercase tracking-wider">
              <User className="w-4 h-4" />
              <span>Personal Identity & Position details</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => onChangeConfig({ name: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Professional Title</label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => onChangeConfig({ title: e.target.value })}
                  placeholder="e.g. Product Marketing Lead"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Main Tagline</label>
                <input
                  type="text"
                  value={config.tagline}
                  onChange={(e) => onChangeConfig({ tagline: e.target.value })}
                  className={inputCls}
                />
                <p className="text-[10px] text-faint mt-1 italic">Typically a punchy sentence summarizing your value prop.</p>
              </div>

              <div>
                <label className={labelCls}>Secondary Subtitle / Specialties</label>
                <input
                  type="text"
                  value={config.subTitle}
                  onChange={(e) => onChangeConfig({ subTitle: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`${labelCls} flex items-center gap-1`}>
                    <Mail className="w-3.5 h-3.5 text-faint" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="text"
                    value={config.email}
                    onChange={(e) => onChangeConfig({ email: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={`${labelCls} flex items-center gap-1`}>
                    <MapPin className="w-3.5 h-3.5 text-faint" />
                    <span>Location</span>
                  </label>
                  <input
                    type="text"
                    value={config.location}
                    onChange={(e) => onChangeConfig({ location: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STYLE & THEME */}
        {activeTab === "style" && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-brand text-xs font-bold uppercase tracking-wider">
              <Palette className="w-4 h-4" />
              <span>Choose a curated color preset</span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    config.templateId === preset.id
                      ? "border-brand bg-brand/5 shadow-md"
                      : "border-line bg-app/40 hover:border-faint"
                  }`}
                >
                  <span className="text-xs font-bold text-ink mb-1.5">{preset.name}</span>
                  <div className="flex gap-1.5 items-center w-full">
                    {/* Circle indicators */}
                    <div className="w-3.5 h-3.5 rounded-full border border-line shadow-sm" style={{ backgroundColor: preset.accentColor }} />
                    <div className="w-3.5 h-3.5 rounded-full border border-line shadow-sm" style={{ backgroundColor: preset.themeColor === "minimal-white" ? "#ffffff" : "#0f172a" }} />
                    <span className="text-[10px] text-faint capitalize ml-auto">{preset.bgPattern}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-line pt-4 space-y-4">
              <div className="flex items-center gap-2 text-brand text-xs font-bold uppercase tracking-wider">
                <Layout className="w-4 h-4" />
                <span>Layout & Fine-tuning</span>
              </div>

              {/* Background Graphics */}
              <div>
                <label className={labelCls}>Background Pattern style</label>
                <select
                  value={config.bgPattern}
                  onChange={(e) => onChangeConfig({ bgPattern: e.target.value })}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="grid">Bento Grid Lines (Clean Layout)</option>
                  <option value="circuit">Circuit Traces (AI / Hardware Vibe)</option>
                  <option value="waves">Smooth waves (Flowing, Organic)</option>
                  <option value="polygons">Network Polygons (Mesh Nodes)</option>
                  <option value="solid">Minimal Solid Color</option>
                </select>
              </div>

              {/* Fonts */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Banner Font Family</label>
                  <select
                    value={config.fontFamily}
                    onChange={(e) => onChangeConfig({ fontFamily: e.target.value })}
                    className={`${inputCls} cursor-pointer`}
                  >
                    <option value="Space Grotesk">Space Grotesk (Tech)</option>
                    <option value="Inter">Inter (Swiss Modern)</option>
                    <option value="Sora">Sora (Geometric Display)</option>
                    <option value="Manrope">Manrope (Friendly Modern)</option>
                    <option value="JetBrains Mono">JetBrains Mono (Mono)</option>
                    <option value="editorial">Elegant Serif (Editorial)</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Color Palette Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.accentColor}
                      onChange={(e) => onChangeConfig({ accentColor: e.target.value })}
                      className="w-8 h-8 rounded border border-line bg-transparent cursor-pointer outline-none"
                    />
                    <input
                      type="text"
                      value={config.accentColor}
                      onChange={(e) => onChangeConfig({ accentColor: e.target.value })}
                      className="flex-1 bg-app border border-line focus:border-brand rounded-lg px-2 py-1.5 text-[10px] text-muted font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Safe-Zone Overlay Configurations */}
              <div className="bg-app/40 border border-line rounded-lg p-3 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-ink">LinkedIn Profile Avatar Guide</label>
                    <span className="text-[10px] text-faint">Overlay safe zones to check layout coverage</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.showProfileSafeZone}
                      onChange={(e) => onChangeConfig({ showProfileSafeZone: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-line after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand" />
                  </label>
                </div>

                {config.showProfileSafeZone && (
                  <div className="flex items-center justify-between border-t border-line pt-2">
                    <span className="text-xs font-medium text-faint">Preview Layout Overlap:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onChangeConfig({ safeZoneDevice: "desktop" })}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          config.safeZoneDevice === "desktop"
                            ? "bg-brand/10 text-brand border border-brand/30"
                            : "bg-transparent text-faint hover:text-ink"
                        }`}
                      >
                        <Laptop className="w-3.5 h-3.5" />
                        Desktop (Left)
                      </button>
                      <button
                        onClick={() => onChangeConfig({ safeZoneDevice: "mobile" })}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          config.safeZoneDevice === "mobile"
                            ? "bg-brand/10 text-brand border border-brand/30"
                            : "bg-transparent text-faint hover:text-ink"
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        Mobile (Center)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SKILL BADGES */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand text-xs font-bold uppercase tracking-wider">
              <BadgePlus className="w-4 h-4" />
              <span>Skill Badges</span>
            </div>

            <p className="text-[11px] text-muted leading-relaxed bg-app/40 p-3 border border-line rounded-lg">
              Add the skills you want on your cover — any field works (e.g. <strong>Brand Strategy</strong>,{" "}
              <strong>Figma</strong>, <strong>Python</strong>, <strong>Negotiation</strong>). They render as
              aligned pill badges on the banner.
            </p>

            {/* List skills */}
            <div className="flex flex-wrap gap-2 py-1 max-h-[140px] overflow-y-auto pr-1 border border-line rounded-lg p-2 bg-app/20">
              {config.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-raised hover:bg-app border border-line rounded-full text-xs text-ink flex items-center gap-1.5 transition-all shadow-sm select-none"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-faint hover:text-mark focus:outline-none cursor-pointer"
                    title="Remove badge"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {config.skills.length === 0 && (
                <span className="text-xs text-faint italic p-1">No skill badges added. Add some below!</span>
              )}
            </div>

            {/* Add skill form */}
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g. Public Speaking, SQL, UX Research"
                className={inputCls}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand hover:opacity-90 text-on-brand text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-lg shadow-brand/10"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Badge</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: HIGHLIGHTS PANEL */}
        {activeTab === "highlights" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand text-xs font-bold uppercase tracking-wider">
              <BarChart3 className="w-4 h-4" />
              <span>Highlights Panel (Right-Side Bento)</span>
            </div>

            <p className="text-[11px] text-muted leading-relaxed bg-app/40 p-3 border border-line rounded-lg">
              Customize the three highlight cells displayed on the far right of the cover banner. Use them for
              concrete numbers and proof — years of experience, projects delivered, certifications, revenue won.
            </p>

            <div className="space-y-4">
              {config.highlights.map((highlight, index) => (
                <div key={index} className="p-4 bg-app/40 border border-line rounded-lg space-y-2.5">
                  <div className="text-[10px] font-bold text-faint uppercase tracking-widest">
                    Highlight cell #{index + 1}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted mb-1">Label</label>
                      <input
                        type="text"
                        value={highlight.label}
                        onChange={(e) => handleHighlightChange(index, "label", e.target.value)}
                        placeholder="e.g. EXPERIENCE"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted mb-1">Value / Metric</label>
                      <input
                        type="text"
                        value={highlight.value}
                        onChange={(e) => handleHighlightChange(index, "value", e.target.value)}
                        placeholder="e.g. 8+ Years"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: IMAGES / MEDIA (URL-based, no upload) */}
        {activeTab === "images" && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-brand text-xs font-bold uppercase tracking-wider">
              <ImageIcon className="w-4 h-4" />
              <span>Media by Image URL</span>
            </div>

            <p className="text-[11px] text-muted leading-relaxed bg-app/40 p-3 border border-line rounded-lg flex gap-2">
              <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
              <span>
                Paste a direct, public image URL (ending in .jpg / .png / .webp). There's no file upload yet.
                For the <strong>logo</strong> and <strong>background</strong> to appear in the downloaded PNG, the
                image host must allow cross-origin use (CORS) — otherwise they show in the live preview but are
                skipped from the export.
              </span>
            </p>

            {/* Avatar URL & Presets */}
            <div className="space-y-2">
              <label className={`${labelCls} flex items-center gap-1.5`}>
                <UserCircle2 className="w-3.5 h-3.5 text-faint" />
                Mockup Profile Avatar
              </label>
              
              <div className="flex flex-wrap gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => onChangeConfig({ customAvatarUrl: "" })}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                    !config.customAvatarUrl
                      ? "bg-brand/10 border-brand/30 text-brand"
                      : "bg-app border-line text-muted hover:text-ink"
                  }`}
                >
                  Generic Silhouette
                </button>
                <button
                  type="button"
                  onClick={() => onChangeConfig({ customAvatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" })}
                  className="px-2.5 py-1 rounded text-[10px] font-bold border bg-app border-line text-muted hover:text-ink transition-all cursor-pointer"
                >
                  Preset Headshot 1
                </button>
                <button
                  type="button"
                  onClick={() => onChangeConfig({ customAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" })}
                  className="px-2.5 py-1 rounded text-[10px] font-bold border bg-app border-line text-muted hover:text-ink transition-all cursor-pointer"
                >
                  Preset Headshot 2
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-app border border-line overflow-hidden shrink-0 flex items-center justify-center">
                  {config.customAvatarUrl ? (
                    <img src={config.customAvatarUrl} alt="Avatar preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserCircle2 className="w-6 h-6 text-faint" />
                  )}
                </div>
                <input
                  type="url"
                  value={config.customAvatarUrl}
                  onChange={(e) => onChangeConfig({ customAvatarUrl: e.target.value })}
                  placeholder="https://…/headshot.jpg"
                  className={inputCls}
                />
              </div>
              <p className="text-[10px] text-faint mt-1">
                Used in the LinkedIn Profile Simulator below. LinkedIn automatically overlays your account profile picture on your actual profile, so your headshot will not be duplicated inside the cover image export.
              </p>
            </div>

            {/* Logo URL */}
            <div>
              <label className={`${labelCls} flex items-center gap-1.5`}>
                <Sticker className="w-3.5 h-3.5 text-faint" />
                Logo URL
              </label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-app border border-line overflow-hidden shrink-0 flex items-center justify-center p-1">
                  {config.customLogoUrl ? (
                    <img src={config.customLogoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <Sticker className="w-6 h-6 text-faint" />
                  )}
                </div>
                <input
                  type="url"
                  value={config.customLogoUrl}
                  onChange={(e) => onChangeConfig({ customLogoUrl: e.target.value })}
                  placeholder="https://…/logo.png"
                  className={inputCls}
                />
              </div>
              <p className="text-[10px] text-faint mt-1">Rendered in the banner's top-right corner.</p>
            </div>

            {/* Background image URL */}
            <div>
              <label className={`${labelCls} flex items-center gap-1.5`}>
                <ImageIcon className="w-3.5 h-3.5 text-faint" />
                Background Image URL
              </label>
              <div className="flex items-center gap-3">
                <div className="w-20 h-12 rounded-lg bg-app border border-line overflow-hidden shrink-0 flex items-center justify-center">
                  {config.customBgUrl ? (
                    <img src={config.customBgUrl} alt="Background preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-faint" />
                  )}
                </div>
                <input
                  type="url"
                  value={config.customBgUrl}
                  onChange={(e) => onChangeConfig({ customBgUrl: e.target.value })}
                  placeholder="https://…/background.jpg"
                  className={inputCls}
                />
              </div>
              <p className="text-[10px] text-faint mt-1">
                Fills the whole banner with a readability overlay. Clear the field to return to the theme background.
              </p>
              {config.customBgUrl && (
                <button
                  onClick={() => onChangeConfig({ customBgUrl: "" })}
                  className="mt-2 text-[10px] font-bold text-mark/80 hover:text-mark flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  Remove background image
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
