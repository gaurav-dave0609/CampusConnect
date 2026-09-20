"use client";

import { useState } from "react";
import {
  GraduationCap,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Layers,
  Award,
  Lock,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Loader2,
  ShieldCheck,
  User,
} from "lucide-react";
import { UnifiedProfile } from "@/services/profile.service";

export function StudentProfileView({
  initialProfile,
}: {
  initialProfile: UnifiedProfile;
}) {
  const [profile, setProfile] = useState<UnifiedProfile>(initialProfile);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Edit form states
  const [editPhone, setEditPhone] = useState(profile.phone || "");
  const [editBio, setEditBio] = useState(profile.student?.bio || "");
  const [editAvatarUrl, setEditAvatarUrl] = useState(profile.avatarUrl || "");
  const [skills, setSkills] = useState<string[]>(profile.student?.skills || []);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      if (skills.length >= 25) {
        setFormError("Maximum of 25 skills allowed.");
        return;
      }
      setSkills([...skills, trimmed]);
      setNewSkillInput("");
      setFormError(null);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: editPhone,
          bio: editBio,
          skills: skills,
          avatarUrl: editAvatarUrl || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.message || "Failed to update profile.");
        showToast("error", data.message || "Failed to update profile.");
        setIsSaving(false);
        return;
      }

      setProfile(data.profile);
      setIsEditOpen(false);
      showToast("success", "Student profile updated successfully!");
    } catch {
      setFormError("Network error while connecting to profile server.");
      showToast("error", "Network connection failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const student = profile.student;
  const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === "success"
              ? "bg-emerald-950/90 text-emerald-100 border-emerald-800"
              : "bg-rose-950/90 text-rose-100 border-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-400" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="rounded-3xl border border-emerald-100/80 bg-white shadow-[0_4px_20px_-2px_rgba(16,185,129,0.06)] overflow-hidden">
        {/* Decorative Cover Gradient */}
        <div className="h-36 bg-gradient-to-r from-[#10B981] via-[#0D9488] to-[#059669] relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute right-6 bottom-4 text-xs font-semibold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/30 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Verified Student Account</span>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 gap-4">
            <div className="flex items-end gap-5">
              {/* Avatar */}
              <div className="h-28 w-28 rounded-2xl border-4 border-white bg-gradient-to-tr from-[#10B981] to-[#059669] text-white flex items-center justify-center font-extrabold text-3xl shadow-lg shadow-emerald-600/20 overflow-hidden flex-shrink-0">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              {/* Names & Subtitles */}
              <div className="mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {profile.fullName}
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  {student?.department} &bull; {student?.division}
                </p>
              </div>
            </div>

            {/* Edit Action Button */}
            <button
              type="button"
              onClick={() => {
                setEditPhone(profile.phone || "");
                setEditBio(student?.bio || "");
                setEditAvatarUrl(profile.avatarUrl || "");
                setSkills(student?.skills || []);
                setIsEditOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10B981] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#059669] transition-all cursor-pointer"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Permitted Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Academic Information (Locked) vs Personal (Editable) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Official Academic Registry (IMMUTABLE) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-emerald-100/80 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)]">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-100/60">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Official Academic Credentials
                  </h2>
                  <p className="text-xs text-slate-500">Certified institutional registry record</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                <Lock className="h-3 w-3 text-slate-500" />
                Immutable by Student
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <div className="p-3.5 rounded-xl border border-emerald-100/60 bg-[#F9FDFB]">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Roll Number
                </div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {student?.rollNumber}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Assigned by Exam Cell</div>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-100/60 bg-[#F9FDFB]">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Permanent Registration Number (PRN)
                </div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {student?.prnNumber}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">University Unique Identifier</div>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-100/60 bg-[#F9FDFB]">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="h-3 w-3 text-emerald-600" />
                  Department
                </div>
                <div className="text-sm font-semibold text-slate-900 mt-1">
                  {student?.department}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-100/60 bg-[#F9FDFB]">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="h-3 w-3 text-emerald-600" />
                  Class &amp; Semester
                </div>
                <div className="text-sm font-semibold text-slate-900 mt-1">
                  Semester {student?.semester} &bull; {student?.division}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-100/60 bg-[#F9FDFB]">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-emerald-600" />
                  Batch Academic Year
                </div>
                <div className="text-sm font-semibold text-slate-900 mt-1">
                  {student?.batchYear}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-100/60 bg-[#F9FDFB]">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="h-3 w-3 text-amber-500" />
                  Cumulative GPA
                </div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {student?.cgpa.toFixed(2)} / 10.0
                </div>
              </div>
            </div>
          </div>

          {/* Student Bio */}
          <div className="rounded-2xl border border-emerald-100/80 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)]">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Personal Statement &amp; Bio
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {student?.bio || "No student biography provided yet. Click 'Edit Permitted Info' to share your academic interests."}
            </p>
          </div>
        </div>

        {/* Column 3: Contact & Skills (Editable) */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="rounded-2xl border border-emerald-100/80 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)]">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Contact Channels
            </h3>
            <div className="space-y-3.5">
              <div className="flex items-start gap-3 text-xs">
                <div className="p-2 rounded-lg bg-[#ECFDF5] text-emerald-700 mt-0.5">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-400 uppercase text-[10px]">
                    Institutional Email (Immutable)
                  </div>
                  <div className="text-slate-900 font-medium break-all">
                    {profile.email}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="p-2 rounded-lg bg-[#ECFDF5] text-emerald-700 mt-0.5">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-400 uppercase text-[10px]">
                    Mobile Phone (Editable)
                  </div>
                  <div className="text-slate-900 font-medium">
                    {profile.phone || "Not provided"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical & Soft Skills */}
          <div className="rounded-2xl border border-emerald-100/80 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)]">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Skills &amp; Competencies
            </h3>
            {student?.skills && student.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {student.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#ECFDF5] text-emerald-800 border border-emerald-200/80"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No skills added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-emerald-100 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-[#10B981]" />
                <h3 className="text-base font-bold text-slate-900">
                  Edit Permitted Student Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 mt-5 text-xs">
              {/* Phone Field */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-200 bg-[#F9FDFB] px-3.5 py-2.5 text-slate-900 focus:border-[#10B981] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                />
              </div>

              {/* Bio Field */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Bio / Academic Focus
                </label>
                <textarea
                  rows={4}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Share a short statement about your academic goals..."
                  className="w-full rounded-xl border border-slate-200 bg-[#F9FDFB] px-3.5 py-2.5 text-slate-900 focus:border-[#10B981] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                />
              </div>

              {/* Avatar URL Field */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Profile Photo URL
                </label>
                <input
                  type="url"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full rounded-xl border border-slate-200 bg-[#F9FDFB] px-3.5 py-2.5 text-slate-900 focus:border-[#10B981] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                />
              </div>

              {/* Skills Tag Input */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Skills &amp; Technologies
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Add a skill (e.g. Next.js, Python)..."
                    className="flex-1 rounded-xl border border-slate-200 bg-[#F9FDFB] px-3.5 py-2 text-slate-900 focus:border-[#10B981] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3.5 py-2 rounded-xl bg-[#10B981] text-white font-semibold hover:bg-[#059669] cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#ECFDF5] text-emerald-800 border border-emerald-200"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-emerald-500 hover:text-emerald-800 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-emerald-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#10B981] text-white font-semibold shadow hover:bg-[#059669] disabled:opacity-50 cursor-pointer"
                >
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
