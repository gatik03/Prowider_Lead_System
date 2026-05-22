"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      <main className="max-w-4xl w-full text-center space-y-12 animate-fade-in">
        {/* Title / Brand */}
        <div className="space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400 bg-indigo-950/60 border border-indigo-900/60 px-3.5 py-1.5 rounded-full shadow-inner">
            Prowider Mini Lead Distribution System
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Lead Distribution <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Portal</span>
          </h1>
          <p className="max-w-xl mx-auto text-slate-400 text-sm sm:text-base">
            Configure, request, and monitor real-time automated lead routing and quota allocations.
          </p>
        </div>

        {/* Portal Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
          {/* Service Request Card */}
          <Link
            href="/request-service"
            className="group relative bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-indigo-950/20"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl"></div>
            <div className="h-12 w-12 rounded-xl bg-indigo-950/80 border border-indigo-900/60 flex items-center justify-center text-indigo-400 mb-4 transition-all duration-300 group-hover:scale-110">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Request Service</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Submit new service requests with customer details. Automatically triggers allocation algorithm rules.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 mt-4 group-hover:text-indigo-300 transition-colors">
              Submit Lead &rarr;
            </span>
          </Link>

          {/* Real-time Dashboard Card */}
          <Link
            href="/dashboard"
            className="group relative bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-950/20"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl"></div>
            <div className="h-12 w-12 rounded-xl bg-emerald-950/80 border border-emerald-900/60 flex items-center justify-center text-emerald-400 mb-4 transition-all duration-300 group-hover:scale-110">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Live Dashboard</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Observe lead distributions in real-time. Subscribes to SSE stream and updates provider stats automatically.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 mt-4 group-hover:text-emerald-300 transition-colors">
              Open Dashboard &rarr;
            </span>
          </Link>

          {/* Test Tools Card */}
          <Link
            href="/test-tools"
            className="group relative bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-amber-500/60 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-950/20"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl"></div>
            <div className="h-12 w-12 rounded-xl bg-amber-950/80 border border-amber-900/60 flex items-center justify-center text-amber-400 mb-4 transition-all duration-300 group-hover:scale-110">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Testing Tools</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Reset quotas, trigger concurrent allocations, and verify webhook idempotency key logic.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 mt-4 group-hover:text-amber-300 transition-colors">
              Access Tools &rarr;
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
