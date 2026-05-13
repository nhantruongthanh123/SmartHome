"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, ShieldAlert, KeyRound, Loader2, Save } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"general" | "security">("general");
  const { data: session } = useSession();

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to update password.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <section className="flex flex-col gap-6 p-4 max-w-4xl mx-auto min-h-screen">
      <Toaster position="top-right" richColors />

      <div>
        <h2 className="text-2xl font-extrabold card-title">Settings</h2>
        <p className="card-muted text-sm mt-1">Manage your account preferences and security.</p>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-border mb-4">
        <button
          onClick={() => setActiveTab("general")}
          className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === "general" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
        >
          General
          {activeTab === "general" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400 rounded-t-lg" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === "security" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
        >
          Security
          {activeTab === "security" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400 rounded-t-lg" />
          )}
        </button>
      </div>

      {/* CONTENT */}
      {activeTab === "general" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">

          {/* Theme selection */}
          <div className="bg-card p-6 rounded-3xl border border-border">
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-1">Appearance</h3>
              <p className="text-sm card-muted">Customize how the SmartHome dashboard looks on your device.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setTheme("light")}
                className={`p-4 rounded-2xl flex flex-col items-center gap-3 transition-all border-2 ${theme === "light" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400" : "border-border hover:border-blue-300 bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
              >
                <Sun size={24} />
                <span className="text-sm font-bold">Light</span>
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={`p-4 rounded-2xl flex flex-col items-center gap-3 transition-all border-2 ${theme === "dark" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400" : "border-border hover:border-blue-300 bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
              >
                <Moon size={24} />
                <span className="text-sm font-bold">Dark</span>
              </button>

              <button
                onClick={() => setTheme("system")}
                className={`p-4 rounded-2xl flex flex-col items-center gap-3 transition-all border-2 ${theme === "system" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400" : "border-border hover:border-blue-300 bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
              >
                <Monitor size={24} />
                <span className="text-sm font-bold">System</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">

          <div className="bg-card p-6 rounded-3xl border border-border">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-2xl">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Change Password</h3>
                <p className="text-sm card-muted">Update the password associated with your email account.</p>
                <p className="text-xs card-muted italic mt-1">(If you registered via Google, this will not work).</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="max-w-md space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider card-muted">Current Password</label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 dark:text-slate-100 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter current password"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider card-muted">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 dark:text-slate-100 border border-border rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter new password (min. 6 chars)"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider card-muted">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 dark:text-slate-100 border border-border rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                  placeholder="Re-enter new password"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full h-12 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingPassword ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Update Security Details
              </button>
            </form>
          </div>

        </div>
      )}

    </section>
  );
}
