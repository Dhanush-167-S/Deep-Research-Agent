"use client";

import React, { useState, useEffect } from "react";
import { Settings, User, Mail, Lock, Camera, CheckCircle2, Save, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function SettingsTab() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=TopResearch"
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      if (user.avatar_url) setAvatarUrl(user.avatar_url);
    }
  }, [user]);

  const avatarSeeds = ["TopResearch", "Eleanor", "Alex", "Felix", "Sophia", "Marcus"];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password && password !== confirmPassword) {
      setErrorMsg("New password and confirm password do not match.");
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };


  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--rule-line)]">
        <div>
          <h2 className="font-fraunces text-2xl font-medium text-[var(--ink-900)] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--verified)]" />
            Account & Profile Settings
          </h2>
          <p className="text-xs text-[var(--ink-600)] font-sans">
            Manage your personal profile details, account email, security password, and avatar.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-1.5 rounded-full bg-[var(--verified-tint)] border border-[var(--verified)]/30 text-[var(--verified)] text-xs font-mono-data font-semibold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[var(--verified)]" />
            <span>Profile Updated Successfully</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-mono-data">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Prominent Large Profile Avatar Header */}
        <div className="editorial-card p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center gap-6 shadow-xs">
          <div className="relative group shrink-0">
            <img
              src={avatarUrl}
              alt="Profile Avatar"
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[var(--paper-1)] ring-2 ring-[var(--verified)] shadow-md bg-[var(--paper-0)] object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute bottom-1 right-1 p-2 rounded-full bg-[var(--verified)] text-[var(--paper-1)] shadow-md border-2 border-[var(--paper-1)]">
              <Camera className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-3 text-center sm:text-left flex-1">
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono-data uppercase bg-[var(--verified-tint)] text-[var(--verified)] border border-[var(--verified)]/20 font-semibold mb-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Account</span>
              </div>
              <h3 className="font-fraunces text-2xl font-medium text-[var(--ink-900)]">
                {name || "User Profile"}
              </h3>
              <p className="text-xs text-[var(--ink-600)] font-mono-data">{email}</p>
            </div>

            {/* Avatar Selector Presets */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-mono-data uppercase text-[var(--ink-600)] font-semibold">Choose Avatar Style:</p>
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                {avatarSeeds.map((seed) => {
                  const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                  const isSelected = avatarUrl === url;
                  return (
                    <button
                      key={seed}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`w-9 h-9 rounded-full border-2 overflow-hidden transition-all ${
                        isSelected ? "border-[var(--verified)] scale-110 shadow-xs" : "border-[var(--rule-line)] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt={seed} className="w-full h-full object-cover bg-[var(--paper-0)]" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Account Details & Password Fields */}
        <div className="editorial-card p-6 sm:p-8 rounded-2xl space-y-6 shadow-xs">
          <h3 className="font-fraunces text-lg text-[var(--ink-900)] flex items-center gap-2 border-b border-[var(--rule-line)] pb-3">
            <User className="w-4 h-4 text-[var(--verified)]" />
            Personal Details & Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono-data uppercase tracking-wider text-[var(--ink-600)] font-semibold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[var(--ink-300)]" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name..."
                className="w-full bg-[var(--paper-0)] border border-[var(--rule-line)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--ink-900)] focus:outline-none focus:border-[var(--verified)] font-sans"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono-data uppercase tracking-wider text-[var(--ink-600)] font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[var(--ink-300)]" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full bg-[var(--paper-0)] border border-[var(--rule-line)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--ink-900)] focus:outline-none focus:border-[var(--verified)] font-sans"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono-data uppercase tracking-wider text-[var(--ink-600)] font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[var(--ink-300)]" />
                <span>New Password</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full bg-[var(--paper-0)] border border-[var(--rule-line)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--ink-900)] placeholder-[var(--ink-300)] focus:outline-none focus:border-[var(--verified)] font-mono-data"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono-data uppercase tracking-wider text-[var(--ink-600)] font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[var(--ink-300)]" />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="w-full bg-[var(--paper-0)] border border-[var(--rule-line)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--ink-900)] placeholder-[var(--ink-300)] focus:outline-none focus:border-[var(--verified)] font-mono-data"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button type="submit" className="btn-verified px-6 py-3 text-xs flex items-center gap-2 shadow-2xs">
            <Save className="w-4 h-4" />
            <span>Update Profile & Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
