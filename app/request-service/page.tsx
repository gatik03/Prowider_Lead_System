"use client";

import React, { useState } from "react";
import Link from "next/link";

interface ProviderAssignment {
  id: string;
  providerId: number;
  assignedAt: string;
  provider: {
    id: number;
    name: string;
    leadsReceived: number;
    monthlyQuota: number;
  };
}

interface LeadResponse {
  lead: {
    id: string;
    customerName: string;
    phone: string;
    city: string;
    serviceId: number;
    description: string;
    createdAt: string;
  };
  assignments: ProviderAssignment[];
}

export default function RequestService() {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [serviceId, setServiceId] = useState<number>(1);
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<LeadResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessData(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          phone,
          city,
          serviceId,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setSuccessData(data);
      // Reset form
      setCustomerName("");
      setPhone("");
      setCity("");
      setDescription("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link
          href="/"
          className="text-sm font-medium text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-all duration-300 hover:-translate-x-1"
        >
          &larr; Back to Portal
        </Link>
      </div>

      <div className="w-full max-w-lg bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/20 transform transition-all duration-500 hover:border-slate-700">
        <div className="mb-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/50 border border-indigo-900/50 px-3 py-1 rounded-full">
            Lead Distribution System
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-4">
            Request Service
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Submit your request details to auto-assign providers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Diana Prince"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-950/40 transition-all duration-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g., 999-888-7777"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-950/40 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-2">
                City
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Gotham"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-950/40 transition-all duration-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-2">
              Select Service
            </label>
            <div className="relative">
              <select
                value={serviceId}
                onChange={(e) => setServiceId(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-950/40 transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value={1}>Service 1 (Pool: P1-P4)</option>
                <option value={2}>Service 2 (Pool: P5-P8)</option>
                <option value={3}>Service 3 (Pool: P1-P8)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-2">
              Request Description
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide some details on your request..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-950/40 transition-all duration-300 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-lg shadow-lg hover:shadow-indigo-500/20 active:translate-y-[1px] transition-all duration-300 text-sm uppercase tracking-wider flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Allocation...
              </>
            ) : (
              "Submit Request"
            )}
          </button>
        </form>

        {/* Inline Feedback Alerts */}
        <div className="mt-6 space-y-4">
          {error && (
            <div className="bg-red-950/40 border border-red-900/60 text-red-200 px-4 py-3 rounded-lg text-sm flex gap-3 animate-fade-in">
              <svg className="h-5 w-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span className="font-semibold block">Submission Failed</span>
                <span className="text-red-300/90">{error}</span>
              </div>
            </div>
          )}

          {successData && (
            <div className="bg-emerald-950/40 border border-emerald-900/60 text-emerald-200 px-4 py-4 rounded-lg text-sm flex gap-3 animate-fade-in">
              <svg className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="w-full">
                <span className="font-semibold block text-base text-white">Request Allocated Successfully!</span>
                <p className="text-slate-300 mt-1">
                  Lead <code className="bg-slate-950/60 px-1 py-0.5 rounded text-indigo-300 font-mono text-xs">{successData.lead.id.substring(0, 8)}</code> has been created and auto-assigned to 3 providers:
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {successData.assignments.map((assignment) => (
                    <div key={assignment.id} className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 text-center">
                      <span className="block font-semibold text-white text-xs">{assignment.provider.name}</span>
                      <span className="block text-[10px] text-slate-400 mt-1">Quota Used: {assignment.provider.leadsReceived}/{assignment.provider.monthlyQuota}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
