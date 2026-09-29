import React, { useEffect, useRef } from "react";
import { BannerConfig } from "../types";

interface BannerCanvasProps {
  config: BannerConfig;
  className?: string;
  onExportRef?: (exportFn: () => void) => void;
  /** Frameless mode for embedding inside other previews (e.g. the LinkedIn mockup). */
  embedded?: boolean;
}

export default function BannerCanvas({ config, className = "", onExportRef, embedded = false }: BannerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cache of loaded <img> elements keyed by URL, plus a version counter that
  // bumps when a new image finishes loading so the canvas re-draws.
  const imageCacheRef = useRef<Record<string, HTMLImageElement | "error">>({});
  const [imageVersion, setImageVersion] = React.useState(0);

  // High-res dimensions
  const WIDTH = 1584;
  const HEIGHT = 396;

  const getLoadedImage = (url: string): HTMLImageElement | null => {
    const cached = imageCacheRef.current[url];
    return cached && cached !== "error" && cached.complete && cached.naturalWidth > 0
      ? cached
      : null;
  };

  // Draw an image with "cover" fit into a target box.
  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ) => {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const boxRatio = dw / dh;
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
    if (imgRatio > boxRatio) {
      // image wider than box — crop sides
      sw = img.naturalHeight * boxRatio;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      // image taller than box — crop top/bottom
      sh = img.naturalWidth / boxRatio;
      sy = (img.naturalHeight - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  };

  const drawCanvas = (ctx: CanvasRenderingContext2D, isExporting: boolean, skipImages = false) => {
    // 1. Clear background
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Set styling based on config.themeColor
    const bgGrad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    
    // Choose theme colors
    let primaryBg = "#0b132b";
    let secondaryBg = "#1c2541";
    let accentColor = config.accentColor || "#38bdf8";
    let textColor = config.textColor || "#ffffff";
    let subtitleColor = "#94a3b8";
    let badgeBg = "rgba(56, 189, 248, 0.1)";
    let badgeBorder = "rgba(56, 189, 248, 0.2)";

    if (config.themeColor === "sophisticated-dark") {
      primaryBg = "#050505";
      secondaryBg = "#0a0a0a";
      subtitleColor = "#888888";
    } else if (config.themeColor === "tech-navy") {
      primaryBg = "#0a1128";
      secondaryBg = "#101f42";
      subtitleColor = "#94a3b8";
    } else if (config.themeColor === "deep-space") {
      primaryBg = "#030712";
      secondaryBg = "#111827";
      subtitleColor = "#9ca3af";
    } else if (config.themeColor === "warm-sunset") {
      primaryBg = "#0c0a09";
      secondaryBg = "#1c1917";
      subtitleColor = "#d6d3d1";
    } else if (config.themeColor === "minimal-white") {
      primaryBg = "#f8fafc";
      secondaryBg = "#e2e8f0";
      subtitleColor = "#475569";
    } else if (config.themeColor === "cyan-gradient") {
      primaryBg = "#022c22";
      secondaryBg = "#064e3b";
      subtitleColor = "#a7f3d0";
    }

    bgGrad.addColorStop(0, primaryBg);
    bgGrad.addColorStop(1, secondaryBg);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 1b. Custom background image (cover-fit) + legibility overlay so text
    // stays readable regardless of the image.
    const bgImg = !skipImages && config.customBgUrl ? getLoadedImage(config.customBgUrl) : null;
    if (bgImg) {
      drawImageCover(ctx, bgImg, 0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = config.themeColor === "minimal-white"
        ? "rgba(255, 255, 255, 0.55)"
        : "rgba(5, 5, 5, 0.55)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    // 2. Draw Decorative BG Patterns
    if (config.bgPattern === "grid" || config.bgPattern === "circuit") {
      // Dotted Grid
      ctx.strokeStyle = config.themeColor === "minimal-white" ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      const gridSize = 44;
      for (let x = 0; x < WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
      }
    }

    // Circuit board traces (tech-forward aesthetic)
    if (config.bgPattern === "circuit" || config.bgPattern === "polygons") {
      ctx.strokeStyle = accentColor;
      ctx.fillStyle = accentColor;
      
      // We draw repeatable mock circuit traces on the right and center-right areas
      const traces = [
        // Trace 1
        {
          points: [
            { x: 1100, y: 50 },
            { x: 1250, y: 50 },
            { x: 1300, y: 100 },
            { x: 1450, y: 100 }
          ],
          nodeSize: 4
        },
        // Trace 2
        {
          points: [
            { x: 1050, y: 220 },
            { x: 1150, y: 220 },
            { x: 1200, y: 170 },
            { x: 1350, y: 170 },
            { x: 1380, y: 200 }
          ],
          nodeSize: 3
        },
        // Trace 3
        {
          points: [
            { x: 1200, y: 350 },
            { x: 1300, y: 350 },
            { x: 1350, y: 300 },
            { x: 1500, y: 300 }
          ],
          nodeSize: 5
        },
        // Left-side light tech traces (only high up to clear profile picture area)
        {
          points: [
            { x: 100, y: 40 },
            { x: 250, y: 40 },
            { x: 290, y: 80 }
          ],
          nodeSize: 3
        }
      ];

      traces.forEach((trace, idx) => {
        ctx.beginPath();
        ctx.lineWidth = idx === 0 ? 1.5 : 1;
        // Fade lines using alpha
        ctx.strokeStyle = `${accentColor}${idx === 3 ? "22" : "33"}`;
        ctx.fillStyle = `${accentColor}${idx === 3 ? "33" : "55"}`;
        
        ctx.moveTo(trace.points[0].x, trace.points[0].y);
        for (let i = 1; i < trace.points.length; i++) {
          ctx.lineTo(trace.points[i].x, trace.points[i].y);
        }
        ctx.stroke();

        // Draw node circles at ends
        const lastPt = trace.points[trace.points.length - 1];
        ctx.beginPath();
        ctx.arc(lastPt.x, lastPt.y, trace.nodeSize, 0, Math.PI * 2);
        ctx.fill();

        const firstPt = trace.points[0];
        ctx.beginPath();
        ctx.arc(firstPt.x, firstPt.y, trace.nodeSize - 1, 0, Math.PI * 2);
        ctx.fill();
      });

      // Drawing modern square tech structures on the right side (AI chip vibe)
      ctx.fillStyle = `${accentColor}11`;
      ctx.strokeStyle = `${accentColor}44`;
      ctx.lineWidth = 1;
      
      // Simulated chip on far right
      const chipX = 1350;
      const chipY = 80;
      const chipW = 150;
      const chipH = 150;
      
      ctx.fillRect(chipX, chipY, chipW, chipH);
      ctx.strokeRect(chipX, chipY, chipW, chipH);
      
      // Draw inner lines for the chip
      ctx.strokeRect(chipX + 15, chipY + 15, chipW - 30, chipH - 30);
      ctx.fillStyle = `${accentColor}22`;
      ctx.font = 'bold 24px "Space Grotesk", "Inter", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("AI", chipX + chipW / 2, chipY + chipH / 2 + 8);
      
      // Chip connectors
      ctx.strokeStyle = `${accentColor}38`;
      const connLength = 20;
      for (let i = 25; i < chipW; i += 30) {
        // Top connections
        ctx.beginPath();
        ctx.moveTo(chipX + i, chipY);
        ctx.lineTo(chipX + i, chipY - connLength);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(chipX + i, chipY - connLength, 2, 0, Math.PI * 2);
        ctx.fill();

        // Bottom connections
        ctx.beginPath();
        ctx.moveTo(chipX + i, chipY + chipH);
        ctx.lineTo(chipX + i, chipY + chipH + connLength);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(chipX + i, chipY + chipH + connLength, 2, 0, Math.PI * 2);
        ctx.fill();

        // Left connections
        ctx.beginPath();
        ctx.moveTo(chipX, chipY + i);
        ctx.lineTo(chipX - connLength, chipY + i);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(chipX - connLength, chipY + i, 2, 0, Math.PI * 2);
        ctx.fill();

        // Right connections
        ctx.beginPath();
        ctx.moveTo(chipX + chipW, chipY + i);
        ctx.lineTo(chipX + chipW + connLength, chipY + i);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(chipX + chipW + connLength, chipY + i, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (config.bgPattern === "waves" || config.bgPattern === "polygons") {
      // Smooth gradient waves
      ctx.strokeStyle = `${accentColor}11`;
      ctx.fillStyle = `${accentColor}0a`;
      ctx.lineWidth = 1;

      for (let offset = 0; offset < 120; offset += 30) {
        ctx.beginPath();
        ctx.moveTo(700, HEIGHT);
        ctx.bezierCurveTo(900, HEIGHT - 180 - offset, 1100, 100 - offset, WIDTH, HEIGHT - 50);
        ctx.lineTo(WIDTH, HEIGHT);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // Bento line separators (elegant grid boxes)
    if (config.bgPattern === "grid" && config.gridOverlay) {
      ctx.strokeStyle = config.themeColor === "minimal-white" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1.5;
      // Drawing horizontal split
      ctx.beginPath();
      ctx.moveTo(400, 260);
      ctx.lineTo(1150, 260);
      ctx.stroke();

      // Vertical split on left text area border
      ctx.beginPath();
      ctx.moveTo(400, 40);
      ctx.lineTo(400, 350);
      ctx.stroke();

      // Vertical split on right side
      ctx.beginPath();
      ctx.moveTo(1150, 40);
      ctx.lineTo(1150, 350);
      ctx.stroke();
    }

    // 3. Render Texts & Content
    // Font styling — keys must match the Banner Font Family options in the
    // editor panel; every family here is loaded via index.css.
    const FONT_FAMILIES: Record<string, string> = {
      "Space Grotesk": '"Space Grotesk", "Inter", sans-serif',
      "Inter": '"Inter", sans-serif',
      "Sora": '"Sora", "Inter", sans-serif',
      "Manrope": '"Manrope", "Inter", sans-serif',
      "JetBrains Mono": '"JetBrains Mono", monospace',
    };
    const sansFamily = FONT_FAMILIES[config.fontFamily] || '"Inter", sans-serif';
    const serifFamily = '"Playfair Display", "Georgia", serif';
    const primaryFont = config.fontFamily === "editorial" ? serifFamily : sansFamily;

    // LEFT OFFSET CONFIGURATION (IMPORTANT SAFE-ZONE RECONCILIATION)
    // To accommodate the profile picture fully (on left on desktop, and central on mobile),
    // we push the main layout to the right.
    // Left border boundary for text content = x = 450 (comfortably clears the 170px wide profile picture + offsets).
    // If the layout is centered, x is computed differently.
    const startX = 450;
    // Right boundary for the main text column (bento panel starts at x = 1150).
    const textMaxWidth = 1150 - startX - 30;

    // Auto-fit helper: shrink the font size until the text fits maxWidth.
    // Sets ctx.font as a side effect and returns the chosen size.
    const fitFont = (
      text: string,
      stylePrefix: string, // e.g. "bold" or "italic 500"
      baseSize: number,
      family: string,
      maxWidth: number,
      minSize = 12
    ): number => {
      let size = baseSize;
      ctx.font = `${stylePrefix} ${size}px ${family}`;
      while (size > minSize && ctx.measureText(text).width > maxWidth) {
        size -= 1;
        ctx.font = `${stylePrefix} ${size}px ${family}`;
      }
      return size;
    };

    // A. User Name & Title
    ctx.textAlign = "left";

    // Name (auto-shrinks for long names)
    ctx.fillStyle = textColor;
    fitFont(config.name, "bold", 42, primaryFont, textMaxWidth, 24);
    ctx.fillText(config.name, startX, 85);

    // Title / Specialty (auto-shrinks for long titles)
    ctx.fillStyle = subtitleColor;
    fitFont(config.title, "500", 21, sansFamily, textMaxWidth, 13);
    ctx.fillText(config.title, startX, 125);

    // B. Core Scaling Tagline (The highlight sentence)
    // Draw a nice subtle glow or accent bar next to the tagline
    ctx.fillStyle = accentColor;
    ctx.fillRect(startX, 155, 4, 34); // Accent bar on the left of tagline

    ctx.fillStyle = textColor;

    // Word-wrap helper for the tagline at a given font size.
    const wrapTagline = (size: number): string[] => {
      ctx.font = `italic 500 ${size}px ${sansFamily}`;
      const words = config.tagline.split(" ");
      const wrapped: string[] = [];
      let line = "";
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        if (ctx.measureText(testLine).width > maxTaglineWidth && n > 0) {
          wrapped.push(line);
          line = words[n] + " ";
        } else {
          line = testLine;
        }
      }
      wrapped.push(line);
      return wrapped;
    };

    // Auto font sizing: start at 20px and shrink until the tagline fits in
    // two lines (down to a floor of 14px) instead of truncating overflow.
    const maxTaglineWidth = textMaxWidth - 16;
    const taglineY = 180;
    let taglineSize = 20;
    let lines = wrapTagline(taglineSize);
    while (lines.length > 2 && taglineSize > 14) {
      taglineSize -= 1;
      lines = wrapTagline(taglineSize);
    }

    // Render lines (max 2)
    const taglineLineH = taglineSize + 8;
    lines.slice(0, 2).forEach((taglineLine, idx) => {
      ctx.fillText(taglineLine, startX + 16, taglineY + (idx * taglineLineH));
    });

    // C. Sub-specialties / subtitle (auto-shrinks to fit)
    if (config.subTitle) {
      ctx.fillStyle = `${textColor}dd`;
      fitFont(config.subTitle, "400", 15, sansFamily, maxTaglineWidth, 11);
      ctx.fillText(config.subTitle, startX + 16, taglineY + (lines.slice(0, 2).length * taglineLineH) + 8);
    }

    // D. Tech Badges / Skills Pills
    // Positioned below the tagline and wrapped across up to two rows so more
    // than a single line's worth of skills can display instead of silently
    // being dropped once the row filled up.
    const badgeStartY = 278;
    const badgeHeight = 28;
    const badgeRowGap = 10;
    const badgeMaxX = 1120; // stay clear of the right-hand bento panel (x = 1150)
    const maxBadgeRows = 2;
    let currentX = startX;
    let badgeRow = 0;

    ctx.font = `bold 13px ${sansFamily}`;

    for (const skill of config.skills) {
      const textWidth = ctx.measureText(skill).width;
      const padX = 14;
      const bWidth = textWidth + padX * 2;

      // Wrap to the next row when this pill would cross the right boundary.
      if (currentX + bWidth > badgeMaxX && currentX > startX) {
        badgeRow++;
        currentX = startX;
      }
      if (badgeRow >= maxBadgeRows) break; // no vertical room left

      const badgeY = badgeStartY + badgeRow * (badgeHeight + badgeRowGap);

      // Draw rounded pill container
      ctx.fillStyle = config.themeColor === "minimal-white" ? "rgba(15, 23, 42, 0.05)" : "rgba(56, 189, 248, 0.08)";
      ctx.strokeStyle = config.themeColor === "minimal-white" ? "rgba(15, 23, 42, 0.12)" : `${accentColor}33`;
      ctx.lineWidth = 1;

      // Draw rounded rectangle manually for compatibility
      const radius = 14;
      ctx.beginPath();
      ctx.moveTo(currentX + radius, badgeY);
      ctx.lineTo(currentX + bWidth - radius, badgeY);
      ctx.quadraticCurveTo(currentX + bWidth, badgeY, currentX + bWidth, badgeY + radius);
      ctx.lineTo(currentX + bWidth, badgeY + badgeHeight - radius);
      ctx.quadraticCurveTo(currentX + bWidth, badgeY + badgeHeight, currentX + bWidth - radius, badgeY + badgeHeight);
      ctx.lineTo(currentX + radius, badgeY + badgeHeight);
      ctx.quadraticCurveTo(currentX, badgeY + badgeHeight, currentX, badgeY + badgeHeight - radius);
      ctx.lineTo(currentX, badgeY + radius);
      ctx.quadraticCurveTo(currentX, badgeY, currentX + radius, badgeY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw skill text
      ctx.fillStyle = config.themeColor === "minimal-white" ? "#0f172a" : accentColor;
      ctx.textAlign = "center";
      ctx.fillText(skill, currentX + bWidth / 2, badgeY + 18);

      currentX += bWidth + 10; // offset for next pill
    }
    ctx.textAlign = "left"; // reset for subsequent left-aligned text

    // E. Highlights / Certifications Panel (Right side, bento block, nice and clean)
    // Draw 3 statistics/focus callouts
    const bentoX = 1150;
    const bentoStartY = 60;
    const bentoSpacing = 100;
    
    if (config.highlights && config.highlights.length > 0) {
      // Draw bounding container
      ctx.strokeStyle = config.themeColor === "minimal-white" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";
      ctx.fillStyle = config.themeColor === "minimal-white" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.01)";
      ctx.lineWidth = 1;
      
      const boxW = 390;
      const boxH = 310;
      
      // Draw thin container box
      ctx.beginPath();
      const bRad = 12;
      ctx.moveTo(bentoX + bRad, bentoStartY);
      ctx.lineTo(bentoX + boxW - bRad, bentoStartY);
      ctx.quadraticCurveTo(bentoX + boxW, bentoStartY, bentoX + boxW, bentoStartY + bRad);
      ctx.lineTo(bentoX + boxW, bentoStartY + boxH - bRad);
      ctx.quadraticCurveTo(bentoX + boxW, bentoStartY + boxH, bentoX + boxW - bRad, bentoStartY + boxH);
      ctx.lineTo(bentoX + bRad, bentoStartY + boxH);
      ctx.quadraticCurveTo(bentoX, bentoStartY + boxH, bentoX, bentoStartY + boxH - bRad);
      ctx.lineTo(bentoX, bentoStartY + bRad);
      ctx.quadraticCurveTo(bentoX, bentoStartY, bentoX + bRad, bentoStartY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Heading inside bento
      ctx.fillStyle = subtitleColor;
      ctx.font = `bold 12px ${sansFamily}`;
      ctx.textAlign = "left";
      ctx.fillText("PROFILE HIGHLIGHTS", bentoX + 24, bentoStartY + 30);

      // Render highlights list
      config.highlights.forEach((highlight, hIdx) => {
        const itemY = bentoStartY + 64 + (hIdx * 74);
        
        // Draw small accent dot or bullet icon
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(bentoX + 30, itemY + 22, 4, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = subtitleColor;
        ctx.font = `500 13px ${sansFamily}`;
        ctx.textAlign = "left";
        ctx.fillText(highlight.label.toUpperCase(), bentoX + 46, itemY + 16);

        // Value
        ctx.fillStyle = textColor;
        ctx.font = `bold 19px ${sansFamily}`;
        ctx.fillText(highlight.value, bentoX + 46, itemY + 40);

        // Divider
        if (hIdx < config.highlights.length - 1) {
          ctx.strokeStyle = config.themeColor === "minimal-white" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.03)";
          ctx.beginPath();
          ctx.moveTo(bentoX + 24, itemY + 58);
          ctx.lineTo(bentoX + boxW - 24, itemY + 58);
          ctx.stroke();
        }
      });
    }

    // F. Footer Contact Details (Email / Location)
    const footerY = 360;
    ctx.textAlign = "left";
    ctx.font = `500 13px ${sansFamily}`;
    
    // Labels and values are measured as they're drawn so the spacing adapts
    // to any label/content length instead of relying on fixed offsets.
    let footerX = startX;
    const drawFooterPair = (label: string, value: string) => {
      ctx.fillStyle = subtitleColor;
      ctx.font = `500 13px ${sansFamily}`;
      ctx.fillText(label, footerX, footerY);
      footerX += ctx.measureText(label).width + 10;

      ctx.fillStyle = textColor;
      ctx.font = `bold 13px ${sansFamily}`;
      ctx.fillText(value, footerX, footerY);
      footerX += ctx.measureText(value).width + 36;
    };

    if (config.email) drawFooterPair("CONTACT:", config.email);
    if (config.location) drawFooterPair("LOCATION:", config.location);

    // G. Custom logo (top-right corner, above the highlights box)
    const logoImg = !skipImages && config.customLogoUrl ? getLoadedImage(config.customLogoUrl) : null;
    if (logoImg) {
      const maxLogoW = 120;
      const maxLogoH = 40;
      const ratio = logoImg.naturalWidth / logoImg.naturalHeight;
      let lw = maxLogoW;
      let lh = lw / ratio;
      if (lh > maxLogoH) {
        lh = maxLogoH;
        lw = lh * ratio;
      }
      ctx.drawImage(logoImg, WIDTH - lw - 24, 18, lw, lh);
    }

    // Avatar zone geometry for safe-zone guide.
    // Desktop: bottom-left, overlapping the banner's bottom edge (like LinkedIn). Mobile: higher and more inset.
    let avatarCX = 190;
    let avatarCY = HEIGHT - 40; // most of the circle visible, still hugging the bottom edge
    let avatarR = 150;
    if (config.safeZoneDevice === "mobile") {
      avatarCX = 210;
      avatarCY = 250;
      avatarR = 125;
    }

    // 4. Draw Safe Zone overlay IF enabled AND NOT exporting!
    // This highlights the circular area covered by LinkedIn profile picture on real profiles.
    if (config.showProfileSafeZone && !isExporting) {
      ctx.save();

      ctx.fillStyle = "rgba(239, 68, 68, 0.12)";
      ctx.beginPath();
      ctx.arc(avatarCX, avatarCY, avatarR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(avatarCX, avatarCY, avatarR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#ef4444";
      ctx.setLineDash([]); // Reset dash
      ctx.font = `bold 12px ${sansFamily}`;
      ctx.textAlign = "center";
      ctx.fillText("LINKEDIN AVATAR OVERLAP", avatarCX, avatarCY - 10);
      ctx.fillText("SAFE ZONE", avatarCX, avatarCY + 8);

      ctx.restore();
    }
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create an offline high-res canvas specifically for drawing the export
    // to guarantee no overlay or visual grid elements are included in the downloaded PNG.
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = WIDTH;
    exportCanvas.height = HEIGHT;
    const exportCtx = exportCanvas.getContext("2d");

    if (exportCtx) {
      // Draw without safe-zones
      drawCanvas(exportCtx, true);

      let imageURL: string;
      try {
        imageURL = exportCanvas.toDataURL("image/png");
      } catch (err) {
        // A cross-origin image without CORS headers taints the canvas and
        // blocks export. Re-draw without custom images so the user still
        // gets a PNG, and warn.
        console.warn(
          "A custom image could not be included in the export due to cross-origin restrictions. " +
          "Use an image URL that allows CORS (or host it yourself).",
          err
        );
        exportCtx.clearRect(0, 0, WIDTH, HEIGHT);
        drawCanvas(exportCtx, true, true);
        imageURL = exportCanvas.toDataURL("image/png");
      }

      const link = document.createElement("a");
      link.download = `qeloma_cover_${config.name.toLowerCase().replace(/\s+/g, "_")}.png`;
      link.href = imageURL;
      link.click();
    }
  };

  // Load custom images (background + logo + avatar) as they change; bump a
  // version counter on load so the canvas re-draws.
  //
  // First attempt uses crossOrigin="anonymous" so a CORS-enabled host stays
  // untainted and can be included in the PNG export. If that fails (many hosts,
  // including some GCS buckets, don't send CORS headers) we retry WITHOUT
  // crossOrigin so the image at least renders in the live preview — the export
  // path already degrades gracefully when the canvas is tainted.
  useEffect(() => {
    const urls = [config.customBgUrl, config.customLogoUrl, config.customAvatarUrl].filter(Boolean) as string[];
    urls.forEach((url) => {
      if (imageCacheRef.current[url]) return; // already loaded or errored

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageCacheRef.current[url] = img;
        setImageVersion((v) => v + 1);
      };
      img.onerror = () => {
        // CORS/other failure — retry without crossOrigin (display-only).
        const fallback = new Image();
        fallback.onload = () => {
          imageCacheRef.current[url] = fallback;
          setImageVersion((v) => v + 1);
        };
        fallback.onerror = () => {
          imageCacheRef.current[url] = "error";
          setImageVersion((v) => v + 1);
        };
        fallback.src = url;
      };
      img.src = url;
    });
  }, [config.customBgUrl, config.customLogoUrl, config.customAvatarUrl]);

  useEffect(() => {
    if (onExportRef) {
      onExportRef(handleExport);
    }
  }, [config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw the active state
    drawCanvas(ctx, false);
  }, [config, imageVersion]);

  return (
    <div className={`relative ${className}`} id={embedded ? undefined : "canvas-container"}>
      {/* Container wrapper that maintains the exact 4:1 LinkedIn Aspect Ratio */}
      <div
        className={`w-full aspect-[4/1] bg-slate-950 overflow-hidden relative ${
          embedded ? "" : "rounded-xl shadow-2xl border border-line"
        }`}
      >
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="w-full h-full object-cover block"
        />
      </div>
    </div>
  );
}
