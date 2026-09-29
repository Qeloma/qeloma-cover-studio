import React, { useState } from "react";
import { BannerConfig, AISuggestions } from "../types";
import { ROLE_SUGGESTIONS, ARCHETYPES, DEFAULT_ROLE, DEFAULT_ARCHETYPE, EXAMPLE_BIO } from "../lib/personas";
import { Sparkles, ArrowRight, Loader2, RefreshCw, Check, Code, Layers, FileText, Briefcase, KeyRound, Eye, EyeOff } from "lucide-react";

interface AIHelperProps {
  config: BannerConfig;
  onChangeConfig: (updates: Partial<BannerConfig>) => void;
}

// Session-only: cleared when the tab closes, never sent anywhere but
// directly to our own generation endpoint for the request that needs it.
const API_KEY_SESSION_STORAGE_KEY = "gemini_api_key";

// Shared field styling for the assistant's inputs.
const inputCls =
  "w-full bg-app border border-line focus:border-brand rounded-lg px-3 py-2 text-xs text-ink placeholder-faint focus:ring-1 focus:ring-brand transition-all outline-none";
const labelCls = "block text-xs font-bold uppercase tracking-wider text-muted mb-1.5 flex items-center gap-1.5";

export default function AIHelper({ config, onChangeConfig }: AIHelperProps) {
  const [role, setRole] = useState(DEFAULT_ROLE);

  const [apiKey, setApiKey] = useState(
    () => sessionStorage.getItem(API_KEY_SESSION_STORAGE_KEY) || ""
  );
  const [showApiKey, setShowApiKey] = useState(false);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    if (value) {
      sessionStorage.setItem(API_KEY_SESSION_STORAGE_KEY, value);
    } else {
      sessionStorage.removeItem(API_KEY_SESSION_STORAGE_KEY);
    }
  };

  const [bioText, setBioText] = useState(EXAMPLE_BIO);
  const [titleInput, setTitleInput] = useState(config.title);
  const [taglineInput, setTaglineInput] = useState(config.tagline);
  const [styleMode, setStyleMode] = useState(DEFAULT_ARCHETYPE);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Demo suggestions match the fictional default persona (a marketer) so the
  // panel shows what "apply" does before the first real generation runs.
  const [suggestions, setSuggestions] = useState<AISuggestions | null>({
    taglines: [
      "I turn products into stories that convert — and campaigns that scale.",
      "From positioning to pipeline: full-funnel marketing that proves its numbers.",
      "8+ years of launches where brand, demand, and lifecycle work as one system."
    ],
    skills: ["Brand Strategy", "Go-to-Market", "SEO & Content", "Lifecycle Email", "Analytics", "Paid Social"],
    subtitles: [
      "Brand Strategy • Demand Generation • Marketing Analytics",
      "Positioning, launches & full-funnel growth for B2B products"
    ]
  });

  const [appliedTaglineIdx, setAppliedTaglineIdx] = useState<number | null>(null);
  const [appliedSubtitleIdx, setAppliedSubtitleIdx] = useState<number | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setAppliedTaglineIdx(null);
    setAppliedSubtitleIdx(null);

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey.trim() ? { "X-Gemini-Api-Key": apiKey.trim() } : {}),
        },
        body: JSON.stringify({
          bioText,
          title: titleInput,
          currentTagline: taglineInput,
          styleMode,
          role
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to contact server AI assistant.");
      }

      const data = await response.json();
      if (data.taglines && data.skills && data.subtitles) {
        setSuggestions(data);
      } else {
        throw new Error("Invalid format returned by AI.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during generation. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  const applyTagline = (tagline: string, index: number) => {
    onChangeConfig({ tagline });
    setAppliedTaglineIdx(index);
    setTimeout(() => setAppliedTaglineIdx(null), 2000);
  };

  const applySubtitle = (subTitle: string, index: number) => {
    onChangeConfig({ subTitle });
    setAppliedSubtitleIdx(index);
    setTimeout(() => setAppliedSubtitleIdx(null), 2000);
  };

  const applySkills = (skills: string[]) => {
    onChangeConfig({ skills });
  };

  return (
    <div className="bg-surface border border-line rounded-xl p-6 space-y-6 transition-colors" id="ai-copywriter-assistant">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-brand/10 rounded-lg border border-brand/20">
            <Sparkles className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink text-base flex items-center gap-2">
              <span>AI Personal Brand Writer</span>
            </h3>
            <p className="text-xs text-muted">Optimize banner copy for any profession</p>
          </div>
        </div>
        <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-faint px-2 py-1 bg-raised border border-line rounded">
          Powered by Gemini
        </div>
      </div>

      {/* Inputs Form */}
      <div className="space-y-4">
        <div>
          <label className={labelCls}>
            <Briefcase className="w-3.5 h-3.5 text-faint" />
            Your Role / Field
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Product Designer, Sales Executive, Founder…"
            className={inputCls}
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {ROLE_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setRole(suggestion)}
                className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold transition-all cursor-pointer ${
                  role === suggestion
                    ? "bg-brand/15 border-brand/40 text-brand"
                    : "bg-app/60 border-line text-muted hover:border-faint hover:text-ink"
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>
            <KeyRound className="w-3.5 h-3.5 text-faint" />
            Your Gemini API Key (optional)
          </label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="Paste your own key to generate without limits"
              autoComplete="off"
              className={`${inputCls} pr-9`}
            />
            <button
              type="button"
              onClick={() => setShowApiKey((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-faint hover:text-ink cursor-pointer"
              aria-label={showApiKey ? "Hide API key" : "Show API key"}
            >
              {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-[10px] text-faint mt-1">
            {apiKey.trim()
              ? "Using your key — kept only in this browser tab's session, never saved to our servers."
              : "Without a key, generation uses a shared demo quota and may be rate-limited. Get a free key at aistudio.google.com/apikey."}
          </p>
        </div>

        <div>
          <label className={labelCls}>
            <FileText className="w-3.5 h-3.5 text-faint" />
            Your Experience / Bio details (to analyze)
          </label>
          <textarea
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            rows={3}
            placeholder="Paste your resume points, LinkedIn summary, or certifications here..."
            className={`${inputCls} p-3 resize-none`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>
              <Code className="w-3.5 h-3.5 text-faint" />
              Target Position Title
            </label>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="e.g. Senior Product Designer"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              <Layers className="w-3.5 h-3.5 text-faint" />
              Desired Brand Archetype
            </label>
            <select
              value={styleMode}
              onChange={(e) => setStyleMode(e.target.value)}
              className={`${inputCls} cursor-pointer`}
            >
              {ARCHETYPES.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-brand hover:opacity-90 text-on-brand font-bold py-2.5 px-4 rounded-lg text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand/10 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing bio and drafting copy...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Draft Brand Copy with Gemini AI
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-mark/10 border border-mark/20 rounded-lg text-[11px] text-mark">
            {error}
          </div>
        )}
      </div>

      {/* Suggested outputs display */}
      {suggestions && (
        <div className="space-y-4 pt-4 border-t border-line">

          {/* Tagline variations */}
          <div>
            <h4 className="text-xs font-bold text-brand uppercase tracking-widest mb-2.5">Suggested Main Banner Taglines</h4>
            <div className="space-y-2">
              {suggestions.taglines.map((tagline, idx) => (
                <div
                  key={idx}
                  onClick={() => applyTagline(tagline, idx)}
                  className="p-3 bg-app/40 border border-line hover:border-brand rounded-lg text-xs cursor-pointer transition-all flex items-start gap-2.5 group"
                >
                  <div className="mt-0.5 min-w-[18px] h-[18px] rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-[10px] text-brand font-bold">
                    {idx + 1}
                  </div>
                  <p className="flex-1 text-muted leading-relaxed group-hover:text-ink">{tagline}</p>
                  <button className="text-[10px] font-bold text-brand bg-brand/5 px-2 py-1 rounded border border-brand/10 flex items-center gap-1 shrink-0 group-hover:bg-brand/20 transition-all">
                    {appliedTaglineIdx === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500">Applied</span>
                      </>
                    ) : (
                      <>
                        <span>Apply</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Subtitles & Specialty listings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">

            {/* Subtitles list */}
            <div>
              <h4 className="text-xs font-bold text-brand uppercase tracking-widest mb-2.5">Suggested Sub-specialties</h4>
              <div className="space-y-2">
                {suggestions.subtitles.map((sub, idx) => (
                  <div
                    key={idx}
                    onClick={() => applySubtitle(sub, idx)}
                    className="p-2.5 bg-app/40 border border-line hover:border-brand rounded-lg text-[11px] text-muted cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <span className="truncate flex-1 group-hover:text-ink pr-2">{sub}</span>
                    <span className="text-[9px] font-bold text-brand bg-brand/5 px-1.5 py-0.5 rounded border border-brand/10 shrink-0">
                      {appliedSubtitleIdx === idx ? "Applied" : "Apply"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Skills recommendation */}
            <div>
              <h4 className="text-xs font-bold text-brand uppercase tracking-widest mb-2.5">AI Selected Skill Tags</h4>
              <div className="bg-app/30 border border-line rounded-lg p-3 space-y-3">
                <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto">
                  {suggestions.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-raised border border-line text-[10px] font-mono rounded text-muted"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => applySkills(suggestions.skills)}
                  className="w-full py-1 px-2 bg-brand/10 hover:bg-brand/20 border border-brand/30 text-brand text-[10px] font-bold rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  Apply All Recommended Badges
                </button>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
