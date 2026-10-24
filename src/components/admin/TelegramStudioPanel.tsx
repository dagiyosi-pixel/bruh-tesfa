'use client';

// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Telegram Studio & Growth Marketing Panel
// =============================================================================

import React, { useState, useEffect } from 'react';
import {
  TutoringVacancy,
  TelegramStudioTemplate,
  TelegramBroadcastLog,
} from '@/lib/types';
import { TelegramGraphicCanvas, GraphicCardData } from './TelegramGraphicCanvas';

interface TelegramStudioPanelProps {
  vacancies: TutoringVacancy[];
}

export function TelegramStudioPanel({ vacancies }: TelegramStudioPanelProps) {
  const [templates, setTemplates] = useState<TelegramStudioTemplate[]>([]);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('vacancy_announcement');
  const [selectedVacancyId, setSelectedVacancyId] = useState<string>('');
  const [useAmharic, setUseAmharic] = useState<boolean>(false);
  const [caption, setCaption] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');

  // Status & Metrics
  const [isBotConfigured, setIsBotConfigured] = useState<boolean>(false);
  const [channelId, setChannelId] = useState<string>('@bruhtesfa_announcements');
  const [metrics, setMetrics] = useState<{
    totalSubscribers: number;
    activeSubscribers: number;
    totalBroadcasts: number;
    telegramAttributedTutors: number;
    telegramAttributedParents: number;
    telegramAttributedVacancyApps: number;
  }>({
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalBroadcasts: 0,
    telegramAttributedTutors: 0,
    telegramAttributedParents: 0,
    telegramAttributedVacancyApps: 0,
  });
  const [broadcastLogs, setBroadcastLogs] = useState<TelegramBroadcastLog[]>([]);

  // Webhook Management
  const [webhookInfo, setWebhookInfo] = useState<any>(null);
  const [webhookLoading, setWebhookLoading] = useState<boolean>(false);
  const [webhookMsg, setWebhookMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Publish & Action states
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [linkCopySuccess, setLinkCopySuccess] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string } | null>(null);
  const [dispatchAlerts, setDispatchAlerts] = useState<boolean>(true);

  const openVacancies = vacancies.filter((v) => v.status === 'open' || v.status === 'closing_soon');

  // Load Studio Data
  useEffect(() => {
    async function loadStudioData() {
      try {
        const res = await fetch('/api/admin/telegram/studio');
        const data = await res.json();
        if (data.success) {
          setTemplates(data.templates || []);
          setIsBotConfigured(Boolean(data.isBotConfigured));
          if (data.channelId) setChannelId(data.channelId);
          if (data.metrics) setMetrics(data.metrics);
          if (data.recentLogs) setBroadcastLogs(data.recentLogs);
        }
      } catch (err) {
        console.error('Failed to load studio data:', err);
      }
    }
    loadStudioData();
  }, []);

  // Set default vacancy if available
  useEffect(() => {
    if (openVacancies.length > 0 && !selectedVacancyId) {
      setSelectedVacancyId(openVacancies[0].id);
    }
  }, [openVacancies, selectedVacancyId]);

  // Re-render template caption whenever template or vacancy changes
  useEffect(() => {
    async function renderTemplate() {
      if (!selectedTemplateKey) return;
      try {
        const res = await fetch('/api/admin/telegram/studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateKey: selectedTemplateKey,
            vacancyId: selectedVacancyId || undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          const currentTpl = templates.find((t) => t.key === selectedTemplateKey);
          if (useAmharic && currentTpl?.default_caption_am) {
            // Apply Amharic with basic placeholders replaced
            let am = currentTpl.default_caption_am;
            const vac = vacancies.find((v) => v.id === selectedVacancyId);
            if (vac) {
              am = am
                .replace(/{{VACANCY_CODE}}/g, vac.vacancy_code)
                .replace(/{{TITLE}}/g, vac.title)
                .replace(/{{LOCATION}}/g, `${vac.sub_city}, አዲስ አበባ`)
                .replace(/{{GRADE}}/g, vac.grade_level)
                .replace(/{{HOURLY_RATE}}/g, String(vac.hourly_rate_etb))
                .replace(/{{SCHEDULE}}/g, `${vac.lesson_frequency} • ${vac.time_window || 'ከሰአት'}`)
                .replace(/{{APPLY_URL}}/g, data.targetUrl);
            }
            setCaption(am);
          } else {
            setCaption(data.caption);
          }
          setTargetUrl(data.targetUrl);
          setShareUrl(data.shareUrl);
        }
      } catch (err) {
        console.error('Failed to render template:', err);
      }
    }
    renderTemplate();
  }, [selectedTemplateKey, selectedVacancyId, useAmharic, templates, vacancies]);

  // Webhook status check
  const handleCheckWebhook = async () => {
    setWebhookLoading(true);
    setWebhookMsg(null);
    try {
      const res = await fetch('/api/admin/telegram/webhook-setup');
      const data = await res.json();
      if (data.success) {
        setWebhookInfo(data.webhookInfo);
        setWebhookMsg({
          success: true,
          text: data.webhookInfo?.url
            ? `Webhook active: ${data.webhookInfo.url}`
            : 'No webhook registered yet. Use Register Webhook to connect.',
        });
      } else {
        setWebhookMsg({ success: false, text: data.error || 'Failed to check webhook status' });
      }
    } catch {
      setWebhookMsg({ success: false, text: 'Network failure checking webhook' });
    } finally {
      setWebhookLoading(false);
    }
  };

  // Register Webhook
  const handleRegisterWebhook = async () => {
    setWebhookLoading(true);
    setWebhookMsg(null);
    try {
      const res = await fetch('/api/admin/telegram/webhook-setup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setWebhookMsg({ success: true, text: `🎉 Webhook registered: ${data.webhookUrl}` });
        handleCheckWebhook();
      } else {
        setWebhookMsg({ success: false, text: data.error || 'Webhook registration failed' });
      }
    } catch {
      setWebhookMsg({ success: false, text: 'Network failure registering webhook' });
    } finally {
      setWebhookLoading(false);
    }
  };

  // Copy caption
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      alert('Could not auto-copy to clipboard. Please select text manually.');
    }
  };

  // Copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setLinkCopySuccess(true);
      setTimeout(() => setLinkCopySuccess(false), 2500);
    } catch {
      alert('Could not copy link.');
    }
  };

  // Auto-Publish
  const handlePublishToChannel = async () => {
    if (!selectedVacancyId) {
      alert('Please select a vacancy to broadcast.');
      return;
    }

    setIsPublishing(true);
    setPublishResult(null);

    try {
      const res = await fetch('/api/admin/telegram/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vacancyId: selectedVacancyId,
          customCaption: caption,
          dispatchSubscribers: dispatchAlerts,
          forceRepublish: false,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        if (confirm(`${data.error}\n\nDo you want to FORCE republish this announcement?`)) {
          const forceRes = await fetch('/api/admin/telegram/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              vacancyId: selectedVacancyId,
              customCaption: caption,
              dispatchSubscribers: dispatchAlerts,
              forceRepublish: true,
            }),
          });
          const forceData = await forceRes.json();
          if (forceData.success) {
            setPublishResult({
              success: true,
              message: `✅ Successfully published to channel (Msg ID: ${forceData.channelResult.messageId}). Notified ${forceData.alertResult.notifiedCount} subscriber(s).`,
            });
          } else {
            setPublishResult({ success: false, message: forceData.error || 'Failed to republish' });
          }
        }
        return;
      }

      if (data.success) {
        setPublishResult({
          success: true,
          message: `✅ Published to channel (Msg ID: ${data.channelResult.messageId}). Dispatched ${data.alertResult.notifiedCount} direct subscriber alert(s).`,
        });
      } else {
        setPublishResult({
          success: false,
          message: data.error || data.channelResult?.error || 'Failed to broadcast to Telegram',
        });
      }
    } catch (err: any) {
      setPublishResult({ success: false, message: err.message || 'Network error during publish' });
    } finally {
      setIsPublishing(false);
    }
  };

  // Build card data for downloadable graphic
  const selectedVac = vacancies.find((v) => v.id === selectedVacancyId);
  const graphicData: GraphicCardData = {
    title: selectedVac ? selectedVac.title : 'Screened Private Tutors for Ethiopian Students',
    badge: selectedVac ? `VACANCY • ${selectedVac.vacancy_code}` : 'BRUH TESFA • ADDIS ABABA',
    location: selectedVac ? `${selectedVac.sub_city}, Addis Ababa` : 'All Addis Ababa Sub-Cities & Online',
    grade: selectedVac ? selectedVac.grade_level : 'Grades 1-12 & University Prep',
    subjects: selectedVac ? selectedVac.subjects.join(', ') : 'Mathematics, Physics, Chemistry, English',
    rate: selectedVac ? `${selectedVac.hourly_rate_etb} ETB / hour` : 'Starting from 350 ETB / hour',
    cta: selectedVac ? 'Apply Online: bruhtesfa.et' : 'Find Your Tutor: bruhtesfa.et',
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Channel Integration Status */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📢</span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Telegram Marketing Studio & Growth Desk
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Official channel broadcasting, 12 marketing templates, opt-in vacancy alerts, and graphic generator.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                isBotConfigured
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isBotConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {isBotConfigured ? `Channel Connected (${channelId})` : 'Manual Copy-Paste Mode'}
            </span>

            <button
              onClick={handleCheckWebhook}
              disabled={webhookLoading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              {webhookLoading ? 'Checking...' : 'Webhook Status'}
            </button>

            <button
              onClick={handleRegisterWebhook}
              disabled={webhookLoading}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              Register Webhook
            </button>
          </div>
        </div>

        {webhookMsg && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-medium border ${
              webhookMsg.success
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                : 'bg-rose-950/60 text-rose-300 border-rose-800'
            }`}
          >
            {webhookMsg.text}
          </div>
        )}

        {/* Growth & Attribution Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Alert Subscribers</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">{metrics.activeSubscribers}</div>
            <span className="text-[10px] text-slate-400">Total: {metrics.totalSubscribers}</span>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Broadcasts Sent</span>
            <div className="text-xl font-bold text-sky-400 mt-1">{metrics.totalBroadcasts}</div>
            <span className="text-[10px] text-slate-400">Channel & Alerts</span>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Telegram Parents</span>
            <div className="text-xl font-bold text-amber-400 mt-1">{metrics.telegramAttributedParents}</div>
            <span className="text-[10px] text-slate-400">Attributed Requests</span>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Telegram Tutors</span>
            <div className="text-xl font-bold text-indigo-400 mt-1">{metrics.telegramAttributedTutors}</div>
            <span className="text-[10px] text-slate-400">Attributed Signups</span>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Vacancy Applicants</span>
            <div className="text-xl font-bold text-purple-400 mt-1">{metrics.telegramAttributedVacancyApps}</div>
            <span className="text-[10px] text-slate-400">Attributed Apps</span>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Live Openings</span>
            <div className="text-xl font-bold text-teal-400 mt-1">{openVacancies.length}</div>
            <span className="text-[10px] text-slate-400">Ready to Broadcast</span>
          </div>
        </div>
      </div>

      {/* 2. Content Studio Main Workspace (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template Config & Caption Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>📝</span> Campaign Copy & Template Builder
              </h3>

              {/* Language Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setUseAmharic(false)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    !useAmharic ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setUseAmharic(true)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    useAmharic ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  አማርኛ (Draft)
                </button>
              </div>
            </div>

            {/* Template Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Choose Marketing Template (12 Strategic Presets)
              </label>
              <select
                value={selectedTemplateKey}
                onChange={(e) => setSelectedTemplateKey(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                {templates.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Vacancy Selector (if template uses vacancy data) */}
            {selectedTemplateKey.includes('vacancy') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Real Database Vacancy to Feature
                </label>
                <select
                  value={selectedVacancyId}
                  onChange={(e) => setSelectedVacancyId(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  {openVacancies.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vacancy_code} • {v.title} ({v.sub_city} - {v.hourly_rate_etb} ETB/hr)
                    </option>
                  ))}
                  {openVacancies.length === 0 && (
                    <option value="">No open vacancies available (create one under Vacancies tab)</option>
                  )}
                </select>
              </div>
            )}

            {/* Caption Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Editable Post Caption</label>
                <span className="text-[11px] text-slate-400 font-mono">{caption.length} chars</span>
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={11}
                className="w-full text-xs font-mono text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 focus:outline-hidden leading-relaxed"
                placeholder="Compose or edit Telegram announcement text..."
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tip: Bold headings with *asterisks*, bullet points, and clear calls to action perform best in Ethiopian Telegram groups.
              </p>
            </div>

            {/* Campaign Link & Actions */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="font-mono text-slate-600 truncate mr-2">{targetUrl}</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-200 transition-colors shrink-0"
                >
                  {linkCopySuccess ? '✓ Link Copied!' : 'Copy UTM Link'}
                </button>
              </div>

              {/* Publish & Alert check */}
              {isBotConfigured && (
                <div className="flex items-center justify-between p-3 bg-sky-50 border border-sky-100 rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-sky-900">
                    <input
                      type="checkbox"
                      checked={dispatchAlerts}
                      onChange={(e) => setDispatchAlerts(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                    />
                    <span>Also notify {metrics.activeSubscribers} opt-in subscribers matching this subject & area</span>
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                    copySuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <span>{copySuccess ? '✓ Copied to Clipboard!' : '📋 Copy Announcement Text'}</span>
                </button>

                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-4 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>✈️ Share in Group</span>
                </a>

                {isBotConfigured && (
                  <button
                    type="button"
                    onClick={handlePublishToChannel}
                    disabled={isPublishing}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{isPublishing ? 'Publishing...' : '🚀 Publish to Channel'}</span>
                  </button>
                )}
              </div>

              {publishResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium border ${
                    publishResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border-amber-200'
                  }`}
                >
                  {publishResult.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Branded Graphic Canvas (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>🎨</span> Branded Visual Poster Generator
            </h3>
            <p className="text-xs text-slate-500">
              Generated automatically from live database values. Formatted at 1080x1080 for high-contrast viewing on mobile screens.
            </p>

            <TelegramGraphicCanvas
              cardData={graphicData}
              filenamePrefix={`bruh-tesfa-${selectedTemplateKey}`}
            />
          </div>

          {/* Recent Broadcasts Log */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span>🕒</span> Recent Channel Broadcasts
            </h4>
            {broadcastLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No broadcasts sent yet.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {broadcastLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        Msg #{log.message_id} • {log.channel_id}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
