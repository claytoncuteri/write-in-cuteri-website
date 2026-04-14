"use client";

import { useState } from "react";
import {
  Users,
  Mail,
  DollarSign,
  Newspaper,
  Download,
  Lock,
  LayoutDashboard,
} from "lucide-react";

// Simple client-side password gate.
// For production, replace with proper authentication (JWT, session, etc.)
// and connect to a backend API or service like Supabase.
const ADMIN_PASSWORD = "cuteri2026";

type Tab = "volunteers" | "signups" | "donations" | "contacts";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("volunteers");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-cream">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <Lock size={32} className="text-navy mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-charcoal font-serif">
              Campaign Admin
            </h1>
            <p className="text-sm text-charcoal/60 mt-1">
              Enter the admin password to continue
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-accent font-medium">{error}</p>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-navy text-white font-semibold rounded-lg hover:bg-navy-dark transition-colors"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: "volunteers", label: "Volunteers", icon: Users },
    { id: "signups", label: "Email Signups", icon: Mail },
    { id: "donations", label: "Donations", icon: DollarSign },
    { id: "contacts", label: "Press Inquiries", icon: Newspaper },
  ];

  return (
    <div className="min-h-[80vh] bg-cream">
      {/* Admin header */}
      <div className="bg-navy py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={24} className="text-white" />
            <h1 className="text-xl font-bold text-white font-serif">
              Campaign Dashboard
            </h1>
          </div>
          <button
            onClick={() => setAuthenticated(false)}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Volunteers", value: "--", icon: Users, color: "text-navy" },
            { label: "Email Signups", value: "--", icon: Mail, color: "text-navy" },
            { label: "Donations", value: "--", icon: DollarSign, color: "text-green-600" },
            { label: "Press Inquiries", value: "--", icon: Newspaper, color: "text-navy" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-lg p-5 border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-1">
                <stat.icon size={16} className={stat.color} />
                <span className="text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              <p className="text-2xl font-bold text-charcoal">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-navy text-navy"
                  : "border-transparent text-charcoal/60 hover:text-charcoal hover:border-gray-300"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Table header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-bold text-charcoal font-serif">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-navy border border-navy/30 rounded-lg hover:bg-navy/5 transition-colors">
              <Download size={14} />
              Export CSV
            </button>
          </div>

          {/* Table placeholder */}
          <div className="p-12 text-center">
            <p className="text-charcoal/50 text-sm">
              {activeTab === "volunteers" && (
                <>
                  Volunteer signups will appear here once the Formspree (or
                  ConvertKit) integration is connected and form submissions start
                  coming in.
                </>
              )}
              {activeTab === "signups" && (
                <>
                  Email signups from the Get Involved and Donate pages will
                  appear here. Connect ConvertKit for full list management.
                </>
              )}
              {activeTab === "donations" && (
                <>
                  Donation records will appear here once Anedot or Stripe is
                  connected and FEC registration is complete.
                </>
              )}
              {activeTab === "contacts" && (
                <>
                  Press inquiries and contact form submissions will appear here.
                </>
              )}
            </p>
            <p className="text-charcoal/40 text-xs mt-4">
              To populate this dashboard, connect a backend service (Supabase,
              Airtable, or a custom API) and update this page to fetch data.
              The ACP website codebase has a full Express + PostgreSQL example.
            </p>
          </div>

          {/* Example table structure (hidden until data exists) */}
          <div className="hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                    Zip Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Data rows will go here */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
