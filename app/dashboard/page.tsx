"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface AssignedLead {
  assignmentId: string;
  assignedAt: string;
  leadId: string;
  customerName: string;
  phone: string;
  city: string;
  serviceId: number;
  description: string;
  createdAt: string;
}

interface Provider {
  id: number;
  name: string;
  monthlyQuota: number;
  leadsReceived: number;
  quotaRemaining: number;
  assignedLeads: AssignedLead[];
}

export default function Dashboard() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [sseStatus, setSseStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProvider, setExpandedProvider] = useState<number | null>(null);

  const fetchProviders = async () => {
    try {
      const response = await fetch("/api/providers");
      if (!response.ok) {
        throw new Error("Failed to fetch provider data");
      }
      const data = await response.json();
      setProviders(data);
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to load providers list:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchProviders();

    // SSE connection
    let eventSource: EventSource;

    function connectSSE() {
      setSseStatus("connecting");
      eventSource = new EventSource("/api/sse");

      eventSource.onopen = () => {
        console.log("[SSE Dashboard] Connection open");
        setSseStatus("connected");
      };

      eventSource.onerror = (err) => {
        console.error("[SSE Dashboard] Connection error:", err);
        setSseStatus("disconnected");
        eventSource.close();

        // Reconnect after 3 seconds
        setTimeout(() => {
          connectSSE();
        }, 3000);
      };

      eventSource.addEventListener("new_lead", (event: MessageEvent) => {
        console.log("[SSE Dashboard] Received new_lead event");
        try {
          const updatedProviders = JSON.parse(event.data);
          setProviders(updatedProviders);
        } catch (e) {
          console.error("Failed to parse SSE payload, refetching...", e);
          fetchProviders();
        }
      });
    }

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const toggleExpand = (providerId: number) => {
    setExpandedProvider(expandedProvider === providerId ? null : providerId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      {/* Navbar / Header */}
      <header className="max-w-7xl mx-auto mb-8 sm:mb-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-all duration-300 hover:-translate-x-0.5"
          >
            &larr; Portal Home
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
            Real-Time Allocation Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor provider lead quotas, assignments, and SSE live streams.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-full px-4 py-2 text-xs">
          <span className="text-slate-400 font-medium">SSE Stream Status:</span>
          <div className="flex items-center gap-1.5 font-semibold">
            {sseStatus === "connected" && (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 uppercase tracking-wider">Live</span>
              </>
            )}
            {sseStatus === "connecting" && (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="text-amber-400 uppercase tracking-wider">Connecting</span>
              </>
            )}
            {sseStatus === "disconnected" && (
              <>
                <span className="inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                <span className="text-red-400 uppercase tracking-wider">Offline (Retrying)</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-400 text-sm">Loading provider profiles...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6 text-center max-w-xl mx-auto">
            <span className="text-red-400 font-semibold block text-lg mb-2">Error Loading Dashboard</span>
            <span className="text-red-300 text-sm">{error}</span>
            <button
              onClick={fetchProviders}
              className="mt-4 bg-red-900/40 hover:bg-red-900/60 border border-red-800 text-white rounded-lg px-4 py-2 text-sm transition-all"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => {
              const quotaPercentage = Math.min(
                100,
                (provider.leadsReceived / provider.monthlyQuota) * 100
              );
              const isQuotaExhausted = provider.quotaRemaining === 0;

              return (
                <div
                  key={provider.id}
                  className={`bg-slate-900/40 backdrop-blur-md border rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
                    expandedProvider === provider.id
                      ? "border-indigo-500/55 shadow-indigo-950/20 lg:col-span-2"
                      : "border-slate-800 hover:border-slate-700 hover:translate-y-[-2px]"
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-slate-900/60 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Provider #{provider.id}</span>
                      <h3 className="text-xl font-bold text-white mt-0.5">{provider.name}</h3>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        isQuotaExhausted
                          ? "bg-red-950/40 border-red-900/60 text-red-400"
                          : "bg-emerald-950/40 border-emerald-900/60 text-emerald-400"
                      }`}
                    >
                      {isQuotaExhausted ? "Quota Met" : "Active"}
                    </span>
                  </div>

                  {/* Quota Details */}
                  <div className="p-6 space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-2">
                        <span className="text-slate-400">Leads Received</span>
                        <span className="text-white font-mono">
                          {provider.leadsReceived} / {provider.monthlyQuota}
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 border border-slate-900 rounded-full h-3.5 p-0.5 overflow-hidden">
                        <div
                          style={{ width: `${quotaPercentage}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            isQuotaExhausted
                              ? "bg-gradient-to-r from-red-600 to-amber-600"
                              : "bg-gradient-to-r from-indigo-500 to-emerald-500"
                          }`}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-950/50 border border-slate-900 rounded-lg p-3 text-center">
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Remaining</span>
                        <span className={`block text-lg font-bold mt-1 ${isQuotaExhausted ? "text-slate-500 font-mono" : "text-white"}`}>
                          {provider.quotaRemaining}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Allocations</span>
                        <span className="block text-lg font-bold text-white mt-1">
                          {provider.assignedLeads.length}
                        </span>
                      </div>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => toggleExpand(provider.id)}
                      className="w-full flex items-center justify-center gap-2 border border-slate-800 hover:border-slate-700 bg-slate-900/20 text-xs font-semibold text-slate-300 py-2.5 rounded-lg transition-all"
                    >
                      {expandedProvider === provider.id ? (
                        <>
                          Hide Assignment History &uarr;
                        </>
                      ) : (
                        <>
                          View Assignment History ({provider.assignedLeads.length}) &darr;
                        </>
                      )}
                    </button>
                  </div>

                  {/* History Section (Collapsible) */}
                  {expandedProvider === provider.id && (
                    <div className="bg-slate-950/90 border-t border-slate-900/80 p-6 animate-fade-in">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Assigned Leads History</h4>
                      
                      {provider.assignedLeads.length === 0 ? (
                        <p className="text-slate-500 text-xs text-center py-4 italic">No assignments yet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-900 text-slate-500 font-semibold uppercase font-mono text-[10px]">
                                <th className="pb-2.5">Lead Details</th>
                                <th className="pb-2.5">Service ID</th>
                                <th className="pb-2.5">Location</th>
                                <th className="pb-2.5 text-right">Assigned At</th>
                              </tr>
                            </thead>
                            <tbody>
                              {provider.assignedLeads.map((lead) => (
                                <tr key={lead.assignmentId} className="border-b border-slate-900 last:border-0 hover:bg-slate-900/30">
                                  <td className="py-3 pr-2">
                                    <span className="font-bold block text-white">{lead.customerName}</span>
                                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{lead.phone}</span>
                                  </td>
                                  <td className="py-3">
                                    <span className="bg-slate-900 border border-slate-800 text-indigo-400 font-mono font-bold px-2 py-0.5 rounded text-[10px]">
                                      Service {lead.serviceId}
                                    </span>
                                  </td>
                                  <td className="py-3 text-slate-300">{lead.city}</td>
                                  <td className="py-3 text-right text-slate-400 font-mono text-[10px]">
                                    {new Date(lead.assignedAt).toLocaleTimeString()}
                                    <span className="block text-[8px] text-slate-600 mt-0.5">
                                      {new Date(lead.assignedAt).toLocaleDateString()}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
