import { GoogleGenAI, Type } from "@google/genai";

// Shared Gemini copy-generation logic, used by both the local Express dev
// server (server.ts) and the Vercel serverless function (api/gemini/generate.ts)
// so the two never drift.

export interface GenerateCopyInput {
  bioText?: string;
  title?: string;
  currentTagline?: string;
  styleMode?: string;
  role?: string;
}

export interface GeneratedCopy {
  taglines: string[];
  skills: string[];
  subtitles: string[];
}

export async function generateCopy(
  input: GenerateCopyInput,
  apiKey: string
): Promise<GeneratedCopy> {
  const { bioText, title, currentTagline, styleMode, role } = input;

  // Role is free text — cap length to avoid prompt bloat/abuse, fall back to
  // a neutral descriptor if empty.
  const safeRole = (typeof role === "string" ? role : "").trim().slice(0, 80) || "professional";
  const safeTone = (typeof styleMode === "string" ? styleMode : "").trim().slice(0, 80) || "Impact & Results-focused";

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

    const systemInstruction = `You are an expert LinkedIn profile optimizer and personal branding designer.
The user works as a "${safeRole}". Tailor all copy to that field's language, tools, and outcomes.
Your goal is to analyze the user's professional background and generate high-impact, minimalist copy suitable for a LinkedIn cover banner.
LinkedIn banners are wide and short (1584x396). Text must be extremely concise (typically a single powerful sentence/tagline and 4-6 primary skills/badges).
Focus on concrete, field-relevant impact, scale, and shipped work. Avoid generic buzzwords not specific to the "${safeRole}" field.`;

    const prompt = `Analyze the following professional context and generate copy suggestions:
- Role / Field: ${safeRole}
- Name/Target Title: ${title || "N/A"}
- Current Tagline: ${currentTagline || "N/A"}
- Raw Bio/Details: ${bioText || "N/A"}
- Requested Tone: ${safeTone}

Please provide:
1. Three variations of an elegant, crisp, single-sentence tagline (under 100 characters each) that highlights concrete, field-relevant expertise for a ${safeRole}.
2. A list of 6-8 core skills, tools, or specialties that represent a ${safeRole}'s focus.
3. Two variations of secondary contact/social taglines summarizing their specialty.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            taglines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Three distinct, professional, punchy taglines under 100 characters.",
            },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A highly relevant list of 6-8 skill, tool, or specialty names.",
            },
            subtitles: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Two secondary specialty subtitles.",
            },
          },
          required: ["taglines", "skills", "subtitles"],
        },
      },
    });

    const responseText = response.text || "{}";
    return JSON.parse(responseText.trim());
  } catch (err: any) {
    console.warn("Gemini API call failed (e.g. 429 rate limit/quota), switching to instant fallback copy generation:", err?.message || err);
    return getFallbackCopy(input);
  }
}

function getFallbackCopy(input: GenerateCopyInput): GeneratedCopy {
  const role = (input.role || input.title || "Software Engineer").toLowerCase();
  
  if (role.includes("design") || role.includes("ux") || role.includes("ui") || role.includes("product manager")) {
    return {
      taglines: [
        "Crafting intuitive digital products that connect user needs with business growth.",
        "Transforming complex systems into clear, accessible visual design architectures.",
        "Designing human-centered experiences backed by data and user research."
      ],
      skills: ["Design Systems", "UI/UX Design", "Figma", "User Research", "Prototyping", "Interaction Design"],
      subtitles: ["Design Systems • UX Research • Product Strategy", "Human-Centered Design • Digital Strategy"]
    };
  }

  if (role.includes("data") || role.includes("analytics") || role.includes("machine learning") || role.includes("ai")) {
    return {
      taglines: [
        "Turning massive datasets into strategic foresight and measurable business impact.",
        "Building scalable ML pipelines and predictive models that drive decision making.",
        "Architecting data infrastructure to power real-time analytics and intelligent systems."
      ],
      skills: ["Python", "SQL", "Machine Learning", "Data Modeling", "PyTorch", "Data Pipelines"],
      subtitles: ["Predictive Modeling • Data Engineering • Business Intelligence", "AI Systems • Big Data • Analytics"]
    };
  }

  if (role.includes("market") || role.includes("growth") || role.includes("sales") || role.includes("founder")) {
    return {
      taglines: [
        "Scaling brand presence and accelerating organic customer acquisition.",
        "Connecting innovative products with global audiences through strategic narrative.",
        "Driving revenue expansion and sustainable go-to-market execution."
      ],
      skills: ["Go-To-Market", "Growth Marketing", "Brand Strategy", "Customer Acquisition", "SEO & Content", "Funnel Optimization"],
      subtitles: ["GTM Strategy • Growth Optimization • Brand Building", "Customer Acquisition • Revenue Growth"]
    };
  }

  // Default fallback for Software Engineers / Tech Roles
  return {
    taglines: [
      "Engineering high-performance, scalable distributed systems and cloud applications.",
      "Building resilient web architectures and modern digital experiences that scale.",
      "Transforming complex engineering challenges into clean, maintainable code."
    ],
    skills: ["TypeScript", "React", "Node.js", "System Design", "Cloud Infrastructure", "API Architecture"],
    subtitles: ["Distributed Systems • Cloud Native • Web Architecture", "Full Stack Development • Performance Optimization"]
  };
}
