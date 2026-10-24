'use client';

// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Telegram Branded Graphic Generator (Canvas 1080x1080)
// =============================================================================

import React, { useRef, useEffect, useState } from 'react';

export interface GraphicCardData {
  title: string;
  badge: string;
  location?: string;
  grade?: string;
  subjects?: string;
  rate?: string;
  cta: string;
  footerNote?: string;
}

interface TelegramGraphicCanvasProps {
  cardData: GraphicCardData;
  filenamePrefix?: string;
}

export function TelegramGraphicCanvas({
  cardData,
  filenamePrefix = 'bruh-tesfa-graphic',
}: TelegramGraphicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set 1080x1080 high-res dimensions
    const W = 1080;
    const H = 1080;
    canvas.width = W;
    canvas.height = H;

    // 1. Background Gradient (Rich Deep Slate Navy)
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#0a0f1d');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Ethiopian Accent Border / Top Stripe (Green, Yellow, Red subtle elegance)
    const stripeGrad = ctx.createLinearGradient(0, 0, W, 0);
    stripeGrad.addColorStop(0, '#059669'); // Emerald
    stripeGrad.addColorStop(0.5, '#d97706'); // Amber
    stripeGrad.addColorStop(1, '#dc2626'); // Crimson
    ctx.fillStyle = stripeGrad;
    ctx.fillRect(0, 0, W, 14);

    // Decorative background ambient glow circles
    const glow1 = ctx.createRadialGradient(200, 200, 50, 200, 200, 400);
    glow1.addColorStop(0, 'rgba(5, 150, 105, 0.15)');
    glow1.addColorStop(1, 'rgba(5, 150, 105, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, 800, 800);

    const glow2 = ctx.createRadialGradient(900, 900, 50, 900, 900, 450);
    glow2.addColorStop(0, 'rgba(217, 119, 6, 0.12)');
    glow2.addColorStop(1, 'rgba(217, 119, 6, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(400, 400, 800, 800);

    // 3. Central Rounded Card Container
    const cardX = 60;
    const cardY = 60;
    const cardW = 960;
    const cardH = 960;
    const cardR = 32;

    ctx.save();
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(cardX + cardR, cardY);
    ctx.lineTo(cardX + cardW - cardR, cardY);
    ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + cardR);
    ctx.lineTo(cardX + cardW, cardY + cardH - cardR);
    ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - cardR, cardY + cardH);
    ctx.lineTo(cardX + cardR, cardY + cardH);
    ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - cardR);
    ctx.lineTo(cardX, cardY + cardR);
    ctx.quadraticCurveTo(cardX, cardY, cardX + cardR, cardY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 4. Brand Header Pill
    ctx.save();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(100, 100, 440, 56, 28);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.fillText('🌟 BRUH TESFA • ብሩህ ተስፋ', 125, 137);
    ctx.restore();

    // Badge / Category (Top Right)
    ctx.save();
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'right';
    ctx.fillText(cardData.badge.toUpperCase(), 940, 137);
    ctx.restore();

    // 5. Main Title
    ctx.save();
    ctx.font = 'bold 44px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';

    // Word wrap title
    const maxTitleW = 860;
    const words = cardData.title.split(' ');
    let line = '';
    let currentY = 240;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTitleW && n > 0) {
        ctx.fillText(line, 100, currentY);
        line = words[n] + ' ';
        currentY += 56;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 100, currentY);
    ctx.restore();

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, currentY + 30);
    ctx.lineTo(980, currentY + 30);
    ctx.stroke();

    // 6. Structured Info Items
    let itemY = currentY + 80;
    const items = [
      cardData.location ? { icon: '📍', label: 'Location:', val: cardData.location } : null,
      cardData.grade ? { icon: '📚', label: 'Grade & Level:', val: cardData.grade } : null,
      cardData.subjects ? { icon: '🔬', label: 'Subjects:', val: cardData.subjects } : null,
      cardData.rate ? { icon: '💰', label: 'Compensation:', val: cardData.rate } : null,
    ].filter(Boolean) as { icon: string; label: string; val: string }[];

    for (const item of items) {
      ctx.font = '30px system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`${item.icon} ${item.label}`, 100, itemY);

      ctx.font = 'bold 30px system-ui, sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(item.val, 380, itemY);

      itemY += 60;
    }

    // 7. Call To Action Banner (Bottom)
    const ctaY = 800;
    ctx.save();
    const ctaGrad = ctx.createLinearGradient(100, ctaY, 980, ctaY);
    ctaGrad.addColorStop(0, '#047857');
    ctaGrad.addColorStop(1, '#059669');
    ctx.fillStyle = ctaGrad;
    ctx.beginPath();
    ctx.roundRect(100, ctaY, 880, 80, 20);
    ctx.fill();

    ctx.font = 'bold 32px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(cardData.cta.toUpperCase(), 540, ctaY + 52);
    ctx.restore();

    // 8. Safeguarding & Official Verification Footer
    const footerY = 925;
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText(
      cardData.footerNote ||
        '🛡 Safeguarded & ID-Verified • Parental Presence Enforced (Proc. No. 1321/2024) • bruhtesfa.et',
      540,
      footerY
    );

    // Generate export data URL
    try {
      const url = canvas.toDataURL('image/png');
      setDownloadUrl(url);
      setIsRendered(true);
    } catch (e) {
      console.error('Failed to create dataURL:', e);
    }
  }, [cardData]);

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${filenamePrefix}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
      <div className="relative w-full max-w-[420px] aspect-square rounded-lg overflow-hidden shadow-2xl border border-slate-700">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain block"
        />
      </div>

      <div className="flex items-center gap-3 w-full max-w-[420px]">
        <button
          type="button"
          onClick={handleDownload}
          disabled={!isRendered}
          className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg transition-all text-sm flex items-center justify-center gap-2 shadow-lg"
        >
          <span>🎨</span>
          <span>Download Branded Graphic (PNG)</span>
        </button>
      </div>
      <p className="text-xs text-slate-400 text-center">
        High-resolution 1080x1080 square poster ready for Telegram channel broadcasts or Instagram feed.
      </p>
    </div>
  );
}
