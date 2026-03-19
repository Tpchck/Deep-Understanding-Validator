'use client';

import { updateNickname, updateEmail, updatePassword } from "@/actions/settings";
import { useState } from "react";
import Link from "next/link";

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}

function StatusMessage({ error, success }: { error: string; success: string }) {
  if (!error && !success) return null;
  return (
    <p className={`text-sm mt-3 ${error ? "text-red-400" : "text-green-400"}`}>
      {error || success}
    </p>
  );
}

export default function SettingsPage() {
  // Nickname
  const [nickError, setNickError] = useState("");
  const [nickSuccess, setNickSuccess] = useState("");
  const [nickLoading, setNickLoading] = useState(false);

  // Email
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Password
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handleNickname = async (formData: FormData) => {
    setNickError(""); setNickSuccess(""); setNickLoading(true);
    const result = await updateNickname(formData);
    if (result?.error) setNickError(result.error);
    else setNickSuccess("Nickname updated!");
    setNickLoading(false);
  };

  const handleEmail = async (formData: FormData) => {
    setEmailError(""); setEmailSuccess(""); setEmailLoading(true);
    const result = await updateEmail(formData);
    if (result?.error) setEmailError(result.error);
    else setEmailSuccess(result?.message ?? "Email updated!");
    setEmailLoading(false);
  };

  const handlePassword = async (formData: FormData) => {
    setPwError(""); setPwSuccess(""); setPwLoading(true);
    const result = await updatePassword(formData);
    if (result?.error) setPwError(result.error);
    else setPwSuccess("Password updated successfully!");
    setPwLoading(false);
  };

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <Link
          href="/dashboard"
          className="text-sm text-neutral-400 hover:text-purple-400 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Nickname */}
      <SettingsCard title="Profile">
        <form action={handleNickname} className="space-y-3">
          <div>
            <label htmlFor="settings-nickname" className="block text-xs text-neutral-500 mb-1">
              Nickname
            </label>
            <input
              id="settings-nickname"
              name="nickname"
              type="text"
              placeholder="Enter a display name"
              maxLength={30}
              disabled={nickLoading}
              className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={nickLoading}
            className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {nickLoading ? "Saving..." : "Save Nickname"}
          </button>
          <StatusMessage error={nickError} success={nickSuccess} />
        </form>
      </SettingsCard>

      {/* Email */}
      <SettingsCard title="Email">
        <form action={handleEmail} className="space-y-3">
          <div>
            <label htmlFor="settings-email" className="block text-xs text-neutral-500 mb-1">
              New Email Address
            </label>
            <input
              id="settings-email"
              name="email"
              type="email"
              placeholder="new-email@example.com"
              required
              disabled={emailLoading}
              className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
            />
          </div>
          <p className="text-xs text-neutral-600">A confirmation link will be sent to your new email address.</p>
          <button
            type="submit"
            disabled={emailLoading}
            className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {emailLoading ? "Sending..." : "Update Email"}
          </button>
          <StatusMessage error={emailError} success={emailSuccess} />
        </form>
      </SettingsCard>

      {/* Password */}
      <SettingsCard title="Password">
        <form action={handlePassword} className="space-y-3">
          <div>
            <label htmlFor="settings-password" className="block text-xs text-neutral-500 mb-1">
              New Password
            </label>
            <input
              id="settings-password"
              name="password"
              type="password"
              placeholder="Min 6 characters"
              minLength={6}
              required
              disabled={pwLoading}
              className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label htmlFor="settings-confirm-password" className="block text-xs text-neutral-500 mb-1">
              Confirm New Password
            </label>
            <input
              id="settings-confirm-password"
              name="confirmPassword"
              type="password"
              placeholder="Repeat password"
              minLength={6}
              required
              disabled={pwLoading}
              className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={pwLoading}
            className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pwLoading ? "Updating..." : "Update Password"}
          </button>
          <StatusMessage error={pwError} success={pwSuccess} />
        </form>
      </SettingsCard>
    </main>
  );
}
