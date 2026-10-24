'use client';

import React, { useState } from 'react';
import { ShieldCheckIcon, AlertTriangleIcon, CheckCircleIcon } from '@/components/Icons';

export default function PrivacyPolicyPage() {
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [requestRef, setRequestRef] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    requester_name: '',
    requester_contact: '',
    request_type: 'deletion' as 'deletion' | 'rectification' | 'data_export',
    details: '',
  });

  const handlePrivacyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/privacy-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit privacy request');
      }

      setRequestSubmitted(true);
      setRequestRef(data.reference_number);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error submitting request');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10">
      {/* Legal Notice Callout */}
      <div className="bg-amber-50 border border-amber-200 p-4 sm:p-5 rounded-2xl flex items-start gap-3">
        <AlertTriangleIcon className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Draft Notice for Owner Review:</strong> This privacy notice is structured in alignment with the <strong>Ethiopian Personal Data Protection Proclamation No. 1321/2024</strong>. It must undergo formal review and adaptation by qualified local Ethiopian legal counsel before general commercial operation.
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
          Regulatory Compliance
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Privacy Notice & Personal Data Protection
        </h1>
        <p className="text-slate-600 text-sm">
          Effective Date: February 2026 • Proclamation No. 1321/2024 Compliance Version
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 text-slate-700 text-sm leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Data Controller & Scope</h2>
          <p>
            BRUH TESFA (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates an educational tutoring coordination service in Addis Ababa, Ethiopia. We act as the Data Controller responsible for the lawful, transparent, and secure processing of personal information submitted by tutors, parents, and guardians.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Special Protection for Minors&apos; Data</h2>
          <p>
            In strict compliance with Proclamation No. 1321/2024 and international safeguarding standards:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Minimal Collection:</strong> We do NOT collect children&apos;s full legal names, exact dates of birth, National IDs, or exact street/house numbers during initial tutoring requests.</li>
            <li><strong>No Public Profiles for Children:</strong> No child&apos;s details, learning goals, or photos are ever published publicly or indexed on search engines.</li>
            <li><strong>No Profiling or Advertising:</strong> Data regarding minors is never used for behavioral advertising, profiling, or sold to third parties.</li>
            <li><strong>Mandatory Parental Consent:</strong> Any processing of student educational requirements must be authorized by the parent or legal guardian.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Information Collected & Lawful Purpose</h2>
          <p>
            We process personal data solely for legitimate educational coordination:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 mt-2">
              <thead className="bg-slate-50 font-bold text-slate-900">
                <tr>
                  <th className="p-2 border-b">Category</th>
                  <th className="p-2 border-b">Data Elements</th>
                  <th className="p-2 border-b">Legal Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2 font-medium">Tutor Identity</td>
                  <td className="p-2">Full legal name, phone, National ID (Fayda/Kebele), degree certificate</td>
                  <td className="p-2">Background verification & fraud prevention</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Tutor Public Profile</td>
                  <td className="p-2">Display name, subjects, sub-cities, rate, bio</td>
                  <td className="p-2">Showcasing verified competence to prospective parents</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Parent Request</td>
                  <td className="p-2">Parent name, phone, general sub-city, subjects needed, budget</td>
                  <td className="p-2">Matching suitable verified tutors and placement support</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Separation of Public and Private Records</h2>
          <p>
            Public visitors may view only approved display profiles. A tutor&apos;s legal ID card, private telephone number, private address, and degree documents are stored in private cloud storage and are only accessible by authorized Bruh Tesfa staff via time-limited signed links.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">5. Data Subject Rights (Access, Correction & Deletion)</h2>
          <p>
            Under Proclamation No. 1321/2024, you have the right to request access to your recorded data, request rectification of inaccurate records, or request complete deletion (&ldquo;right to be forgotten&rdquo;).
          </p>
        </section>

      </div>

      {/* Interactive Data Subject Rights Request Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-xl mx-auto space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <h2 className="text-base font-bold text-slate-900">
            Submit a Data Protection / Deletion Request
          </h2>
          <p className="text-xs text-slate-500">
            Exercise your rights under Ethiopian Proclamation No. 1321/2024.
          </p>
        </div>

        {requestSubmitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <strong>Request Received: Reference {requestRef}</strong>
            <p>Our Data Protection Officer will verify your identity and process this request within 30 calendar days.</p>
          </div>
        ) : (
          <form onSubmit={handlePrivacyRequest} className="space-y-3">
            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs">{errorMsg}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase">Your Name</label>
                <input
                  type="text"
                  value={form.requester_name}
                  onChange={(e) => setForm({ ...form, requester_name: e.target.value })}
                  placeholder="Full name"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase">Phone / Email</label>
                <input
                  type="text"
                  value={form.requester_contact}
                  onChange={(e) => setForm({ ...form, requester_contact: e.target.value })}
                  placeholder="+251 91..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase">Request Type</label>
              <select
                value={form.request_type}
                onChange={(e) => setForm({ ...form, request_type: e.target.value as 'deletion' | 'rectification' | 'data_export' })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="deletion">Full Data Deletion (Right to Be Forgotten)</option>
                <option value="rectification">Correction of Inaccurate Information</option>
                <option value="data_export">Copy of Personal Data Held</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase">Details (Optional)</label>
              <textarea
                rows={2}
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                placeholder="Reference number or specific details..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-colors"
            >
              {isSubmitting ? 'Recording Request...' : 'Submit Privacy Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
