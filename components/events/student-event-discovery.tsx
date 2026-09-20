"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Tag,
  Flame,
  BookmarkCheck,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { EventCategory, EventStatus, RegistrationStatus } from "@prisma/client";

interface EventItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: EventCategory;
  status: EventStatus;
  organizerName: string;
  venue: string;
  startDateTime: string;
  endDateTime: string;
  registrationDeadline: string;
  capacity: number;
  seatsRemaining: number;
  posterUrl: string;
  isUserRegistered: boolean;
}

interface StudentEventDiscoveryProps {
  initialEvents: EventItem[];
  currentUserId: string;
}

const CATEGORY_LABELS: Record<EventCategory, string> = {
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
  HACKATHON: "Hackathon",
  CULTURAL: "Cultural Fest",
  SPORTS: "Sports League",
  CLUB: "Club Activity",
  PLACEMENT: "Placement Drive",
  TECHNICAL: "Technical Lab",
  COMPETITION: "Coding Contest",
  WEBINAR: "Live Webinar",
  OTHER: "Campus Outreach",
};

const CATEGORY_COLORS: Record<EventCategory, string> = {
  HACKATHON: "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  WORKSHOP: "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  PLACEMENT: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  CULTURAL: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  SPORTS: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  SEMINAR: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  COMPETITION: "bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  TECHNICAL: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  WEBINAR: "bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200 dark:border-teal-800",
  CLUB: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/80 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800",
  OTHER: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
};

export function StudentEventDiscovery({ initialEvents, currentUserId }: StudentEventDiscoveryProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "registered" | "completed">("all");
  const [sortBy, setSortBy] = useState<"upcoming" | "latest" | "most_registered">("upcoming");

  const now = new Date();

  // Highlight featured / hero event: prioritize Hackathon or highest capacity upcoming event
  const featuredEvent = useMemo(() => {
    return (
      initialEvents.find(
        (e) =>
          e.category === EventCategory.HACKATHON &&
          e.status === EventStatus.REGISTRATION_OPEN &&
          new Date(e.endDateTime) > now
      ) ||
      initialEvents.find(
        (e) => e.status === EventStatus.REGISTRATION_OPEN && new Date(e.endDateTime) > now
      ) ||
      initialEvents[0]
    );
  }, [initialEvents, now]);

  // Filtered list
  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          event.title.toLowerCase().includes(q) ||
          event.summary.toLowerCase().includes(q) ||
          event.venue.toLowerCase().includes(q) ||
          event.organizerName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Category
      if (selectedCategory !== "ALL" && event.category !== selectedCategory) {
        return false;
      }

      // Tabs
      const isPast = new Date(event.endDateTime) < now || event.status === EventStatus.COMPLETED;
      if (activeTab === "upcoming" && isPast) {
        return false;
      }
      if (activeTab === "registered" && !event.isUserRegistered) {
        return false;
      }
      if (activeTab === "completed" && !isPast) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "upcoming") {
        return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
      }
      if (sortBy === "latest") {
        return new Date(b.id).getTime() - new Date(a.id).getTime();
      }
      if (sortBy === "most_registered") {
        return a.seatsRemaining - b.seatsRemaining;
      }
      return 0;
    });
  }, [initialEvents, search, selectedCategory, activeTab, sortBy, now]);

  const registeredCount = useMemo(() => {
    return initialEvents.filter((e) => e.isUserRegistered).length;
  }, [initialEvents]);

  const getCapacityBadge = (capacity: number, seatsRemaining: number, status: EventStatus) => {
    if (status === EventStatus.COMPLETED) {
      return { text: "Completed", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" };
    }
    if (status === EventStatus.REGISTRATION_CLOSED) {
      return { text: "Registration Closed", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" };
    }
    if (seatsRemaining === 0) {
      return { text: "Event Full (0 seats)", className: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold" };
    }
    const percentRemaining = (seatsRemaining / capacity) * 100;
    if (percentRemaining <= 10) {
      return { text: `Almost Full (${seatsRemaining} left)`, className: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200" };
    }
    if (percentRemaining <= 30) {
      return { text: `Filling Fast (${seatsRemaining} left)`, className: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200" };
    }
    return { text: `${seatsRemaining} Seats Left`, className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200" };
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-50 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-emerald-800 border border-emerald-200 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-[#10B981]" />
            <span>Campus Extracurricular &amp; Technical Discovery</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Campus Events
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Discover workshops, competitions, clubs, and placement bootcamps happening around campus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/student/events/registered"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-[#10B981] hover:text-white border border-emerald-200 transition shadow-xs"
          >
            <BookmarkCheck className="h-4 w-4" />
            <span>My Registered Events</span>
            {registeredCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-[#10B981] text-white">
                {registeredCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Featured / Hero Banner Card */}
      {featuredEvent && (
        <div className="relative rounded-3xl overflow-hidden border border-emerald-100/80 bg-white text-slate-900 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[320px]">
            {/* Left Info Column */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative z-10">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ECFDF5] text-emerald-700 border border-emerald-200">
                    Featured Flagship Event
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                    Registration Active
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                  {featuredEvent.title}
                </h2>
                <p className="mt-2.5 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {featuredEvent.summary}
                </p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>
                      {new Date(featuredEvent.startDateTime).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>
                      {new Date(featuredEvent.startDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                      {new Date(featuredEvent.endDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <MapPin className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span className="truncate">{featuredEvent.venue}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#10B981]" />
                  <span className="text-xs font-medium text-slate-600">
                    <strong className="text-slate-900 font-bold">{featuredEvent.seatsRemaining}</strong> of{" "}
                    {featuredEvent.capacity} seats remaining
                  </span>
                </div>

                <Link
                  href={`/dashboard/student/events/${featuredEvent.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#10B981] text-white hover:bg-emerald-600 transition shadow-sm active:scale-95 cursor-pointer"
                >
                  <span>{featuredEvent.isUserRegistered ? "View My Pass" : "View Event & Register"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Poster / Image Column */}
            <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full">
              <img
                src={featuredEvent.posterUrl}
                alt={featuredEvent.title}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-white via-white/20 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* Discovery Filters & Controls */}
      <div className="space-y-4">
        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, topic, venue or speaker..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-emerald-100/80 bg-[#F9FDFB] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#10B981]"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F0FDF4] border border-emerald-100 self-start sm:self-auto overflow-x-auto">
            {(["all", "upcoming", "registered", "completed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? "bg-white text-emerald-900 shadow-xs"
                    : "text-slate-600 hover:text-emerald-900"
                }`}
              >
                {tab === "all" ? "All Events" : tab === "registered" ? `My RSVP (${registeredCount})` : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Chips & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition cursor-pointer ${
                selectedCategory === "ALL"
                  ? "bg-[#10B981] text-white border-emerald-500 shadow-xs"
                  : "bg-white text-slate-600 border-emerald-100 hover:bg-[#ECFDF5] hover:text-emerald-800"
              }`}
            >
              All Categories
            </button>
            {Object.keys(CATEGORY_LABELS).map((catKey) => {
              const cat = catKey as EventCategory;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#10B981] text-white border-emerald-500 shadow-xs"
                      : "bg-white text-slate-600 border-emerald-100 hover:bg-[#ECFDF5] hover:text-emerald-800"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              );
            })}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold bg-white border border-emerald-100/80 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#10B981]"
            >
              <option value="upcoming">Sort: Date Upcoming</option>
              <option value="latest">Sort: Latest Added</option>
              <option value="most_registered">Sort: Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const badge = getCapacityBadge(evt.capacity, evt.seatsRemaining, evt.status);
            const categoryClass = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.OTHER;
            const isFull = evt.seatsRemaining === 0 && evt.status === EventStatus.REGISTRATION_OPEN;

            return (
              <div
                key={evt.id}
                className="group rounded-2xl border border-emerald-100/70 bg-white hover:border-emerald-300 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.05)] hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Image & Badges */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img
                    src={evt.posterUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Category Chip */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border backdrop-blur-md ${categoryClass}`}>
                      {CATEGORY_LABELS[evt.category] || evt.category}
                    </span>
                  </div>

                  {/* Registered Marker */}
                  {evt.isUserRegistered && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-md">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Registered</span>
                    </div>
                  )}

                  {/* Date & Time pill on bottom of image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-indigo-300" />
                      <span>
                        {new Date(evt.startDateTime).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono">
                      <Clock className="h-3 w-3 text-indigo-300" />
                      <span>
                        {new Date(evt.startDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {evt.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {evt.summary}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-border/60">
                    {/* Location & Organizer */}
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">By {evt.organizerName.split("(")[0]}</span>
                      </div>
                    </div>

                    {/* Capacity & Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.className}`}>
                          {badge.text}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {evt.capacity - evt.seatsRemaining}/{evt.capacity} filled
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isFull
                              ? "bg-rose-500"
                              : evt.seatsRemaining <= evt.capacity * 0.2
                              ? "bg-amber-500"
                              : "bg-[#10B981]"
                          }`}
                          style={{
                            width: `${Math.min(100, ((evt.capacity - evt.seatsRemaining) / evt.capacity) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/dashboard/student/events/${evt.id}`}
                      className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                        evt.isUserRegistered
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-[#10B981] hover:text-white"
                          : isFull
                          ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          : "bg-[#10B981] text-white hover:bg-emerald-600"
                      }`}
                    >
                      <span>
                        {evt.isUserRegistered
                          ? "View Registration Pass"
                          : isFull
                          ? "Event Full — View Details"
                          : evt.status === EventStatus.REGISTRATION_CLOSED
                          ? "Closed — View Details"
                          : "Reserve Seat Now"}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-emerald-200 p-12 text-center space-y-3 bg-[#F9FDFB]">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-[#10B981]">
            <Filter className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No events match your filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or select another category from the filter chips above.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("ALL");
              setActiveTab("all");
            }}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#10B981] text-white hover:bg-emerald-600 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
