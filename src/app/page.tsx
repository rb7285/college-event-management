"use client";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
type EventItem = {
  id: number;
  title: string;
  category: string;
  date: string;
  venue: string;
  attendees: number;
};
type RegistrationItem = {
  id: number;
  name: string;
  email: string;
  eventId: number;
  event: {
    id: number;
    title: string;
  };
  createdAt: string;
};

type RegistrationForm = {
  name: string;
  email: string;
  eventId: string;
};

type EventForm = {
  title: string;
  category: string;
  date: string;
  venue: string;
};
type FormErrors = Partial<Record<keyof EventForm, string>>;
type NoticeTone = "info" | "success" | "error";
const navigation = [
  { name: "Dashboard", icon: "▦" },
  { name: "Events", icon: "▣" },
  { name: "Students", icon: "♙" },
  { name: "Reports", icon: "▥" },
];
const categoryColors = [
  "bg-blue-50 text-blue-700",
  "bg-violet-50 text-violet-700",
  "bg-emerald-50 text-emerald-700",
  "bg-orange-50 text-orange-700",
  "bg-indigo-50 text-indigo-700",
  "bg-rose-50 text-rose-700",
];
const emptyForm: EventForm = {
  title: "",
  category: "",
  date: "",
  venue: "",
};
const noticeStyles: Record<NoticeTone, string> = {
  info: "border-indigo-200 bg-indigo-50 text-indigo-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
};
function colorForCategory(category: string) {
  let hash = 0;
  for (let index = 0; index < category.length; index += 1) {
    hash = category.charCodeAt(index) + ((hash << 5) - hash);
  }
  return categoryColors[Math.abs(hash) % categoryColors.length];
}
function isUpcoming(dateValue: string) {
  const eventDate = new Date(dateValue);
  if (Number.isNaN(eventDate.getTime())) {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today;
}
export default function Home() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState<NoticeTone>("info");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
const [registrationForm, setRegistrationForm] =
  useState<RegistrationForm>({
    name: "",
    email: "",
    eventId: "",
  });
const [registrationLoading, setRegistrationLoading] = useState(false);
const [registrationError, setRegistrationError] = useState("");
const [registrationSuccess, setRegistrationSuccess] = useState("");
  const categories = Array.from(
    new Set(events.map((event) => event.category).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const filteredEvents = events.filter((event) => {
    const matchesSearch = `${event.title} ${event.category} ${event.venue}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || event.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });
  const upcomingCount = useMemo(
    () => events.filter((event) => isUpcoming(event.date)).length,
    [events]
  );
  const showNotice = useCallback((message: string, tone: NoticeTone = "info") => {
    setNotice(message);
    setNoticeTone(tone);
  }, []);
  const fetchEvents = useCallback(async () => {
    const response = await fetch("/api/events");
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        payload && typeof payload.error === "string"
          ? payload.error
          : "Failed to load events"
      );
    }
    if (!Array.isArray(payload)) {
      throw new Error("Failed to load events");
    }
    return payload as EventItem[];
  }, []);
  const loadEvents = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
      }
      setLoadError("");
      try {
        const payload = await fetchEvents();
        setEvents(payload);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not load events. Please refresh the page.";
        setLoadError(message);
        setEvents([]);
        showNotice(message, "error");
      } finally {
        setLoading(false);
      }
    },
    [fetchEvents, showNotice]
  );
  
const fetchRegistrations = useCallback(async () => {
  const response = await fetch("/api/registrations");
  const payload = await response.json().catch(() => null);

  if (!response.ok || !Array.isArray(payload)) {
    throw new Error(
      payload && typeof payload.error === "string"
        ? payload.error
        : "Failed to load registrations"
    );
  }

  setRegistrations(payload as RegistrationItem[]);
}, []);

  useEffect(() => {
    let cancelled = false;
    fetchEvents()
      .then((payload) => {
        if (!cancelled) {
          setEvents(payload);
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : "Could not load events. Please refresh the page.";
        setLoadError(message);
        setEvents([]);
        showNotice(message, "error");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fetchEvents, showNotice]);
  function openCreateForm() {
    setActivePage("Events");
    setForm(emptyForm);
    setFormErrors({});
    setIsFormOpen(true);
  }
  function closeCreateForm() {
    if (saving) {
      return;
    }
    setIsFormOpen(false);
    setForm(emptyForm);
    setFormErrors({});
  }
  function validateForm() {
    const errors: FormErrors = {};
    if (!form.title.trim()) {
      errors.title = "Event title is required.";
    }
    if (!form.category.trim()) {
      errors.category = "Category is required.";
    }
    if (!form.date) {
      errors.date = "Event date is required.";
    } else if (Number.isNaN(new Date(form.date).getTime())) {
      errors.date = "Please enter a valid event date.";
    }
    if (!form.venue.trim()) {
      errors.venue = "Venue is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }
  async function handleCreateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !validateForm()) {
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          category: form.category.trim(),
          date: form.date,
          venue: form.venue.trim(),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          payload && typeof payload.error === "string"
            ? payload.error
            : "Could not create the event."
        );
      }
      setIsFormOpen(false);
      setForm(emptyForm);
      setFormErrors({});
      showNotice("Event created and saved to the database.", "success");
      await loadEvents({ silent: true });
    } catch (error) {
      showNotice(
        error instanceof Error
          ? error.message
          : "Could not create the event.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }
  
async function handleRegisterStudent(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();
  setRegistrationLoading(true);
  setRegistrationError("");
  setRegistrationSuccess("");

  try {
    const response = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: registrationForm.name.trim(),
        email: registrationForm.email.trim(),
        eventId: Number(registrationForm.eventId),
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        payload && typeof payload.error === "string"
          ? payload.error
          : "Registration failed"
      );
    }

    setRegistrationForm({ name: "", email: "", eventId: "" });

    // Refresh both the student list and event analytics.
    await Promise.all([
      fetchRegistrations(),
      loadEvents({ silent: true }),
    ]);

    setRegistrationSuccess("Student registered successfully.");
  } catch (error) {
    setRegistrationError(
      error instanceof Error ? error.message : "Registration failed"
    );
  } finally {
    setRegistrationLoading(false);
  }
}

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col bg-slate-950 p-6 text-white md:flex">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500 text-xl font-bold">
              C
            </div>
            <div>
              <h1 className="text-lg font-bold">CampusHub</h1>
              <p className="text-xs text-slate-400">Event management</p>
            </div>
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>
          <nav className="space-y-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActivePage(item.name);
                  setNotice("");
                
                  if (item.name === "Students") {
                    void fetchRegistrations().catch((error: unknown) => {
                      setRegistrationError(
                        error instanceof Error
                          ? error.message
                          : "Failed to load registrations"
                      );
                    });
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                  activePage === item.name
                    ? "bg-indigo-600 font-semibold text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="font-semibold">College Event Team</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Organize campus activities in one place.
            </p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-700">
              <div className="h-full w-3/4 rounded-full bg-indigo-500" />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Semester activities
            </p>
          </div>
        </aside>
        <section className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
            <div>
              <p className="text-sm text-slate-500">College / Workspace</p>
              <h2 className="mt-1 text-xl font-bold sm:text-2xl">
                {activePage}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">Admin Panel</p>
                <p className="text-xs text-slate-500">Project workspace</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                A
              </div>
            </div>
          </header>
          <div className="mx-auto max-w-7xl p-5 sm:p-8">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-indigo-600">
                  Thursday, October 6, 2026
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome to CampusHub 👋
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Manage your college events and student registrations.
                </p>
              </div>
              <button
                onClick={openCreateForm}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                + Create Event
              </button>
            </div>
            {notice && (
              <div
                role="status"
                className={`mb-5 rounded-xl border px-4 py-3 text-sm ${noticeStyles[noticeTone]}`}
              >
                {notice}
              </div>
            )}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Total Events",
                  value: events.length,
                  icon: "▣",
                  color: "bg-blue-50 text-blue-700",
                  hint: "From SQLite database",
                },
                {
                  label: "Student Registrations",
                  value: events.reduce(
                    (total, event) => total + event.attendees,
                    0
                  ),
                  icon: "♙",
                  color: "bg-violet-50 text-violet-700",
                  hint: "Saved registrations only",
                },
                {
                  label: "Upcoming Events",
                  value: upcomingCount,
                  icon: "◷",
                  color: "bg-emerald-50 text-emerald-700",
                  hint: "Events from today onward",
                },
                {
                  label: "Event Categories",
                  value: new Set(events.map((event) => event.category)).size,
                  icon: "▤",
                  color: "bg-orange-50 text-orange-700",
                  hint: "Distinct saved categories",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${stat.color}`}
                    >
                      {stat.icon}
                    </span>
                  </div>
                  <p className="mt-4 text-3xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{stat.hint}</p>
                </div>
              ))}
            </div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Upcoming Events</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Explore activities happening on campus.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search events..."
                  aria-label="Search events"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-64"
                />
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  aria-label="Filter events by category"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-48"
                >
                  <option value="All">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {activePage === "Dashboard" || activePage === "Events" ? (
              <div className="grid gap-5 lg:grid-cols-2">
                {loading && (
                  <p className="text-sm text-slate-500 lg:col-span-2">
                    Loading events from database...
                  </p>
                )}
                {!loading && loadError && (
                  <div className="rounded-2xl border border-dashed border-rose-200 bg-white p-10 text-center lg:col-span-2">
                    <p className="font-semibold">Could not load events</p>
                    <p className="mt-1 text-sm text-slate-500">{loadError}</p>
                    <button
                      onClick={() => void loadEvents()}
                      className="mt-5 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      Try again
                    </button>
                  </div>
                )}
                {!loading &&
                  !loadError &&
                  filteredEvents.map((event) => (
                    <article
                      key={event.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${colorForCategory(event.category)}`}
                        >
                          {event.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          Event #{event.id}
                        </span>
                      </div>
                      <h4 className="mt-5 text-lg font-bold">{event.title}</h4>
                      <div className="mt-3 space-y-2 text-sm text-slate-500">
                        <p>
                          ▦ &nbsp;
                          {new Date(event.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p>⌖ &nbsp; {event.venue}</p>
                        <p>♙ &nbsp; {event.attendees} registrations</p>
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-xs font-medium text-emerald-700">
                          {isUpcoming(event.date) ? "● Upcoming" : "● Scheduled"}
                        </span>
                        <button
                          type="button"
                          disabled
                          title="Student registration is not saved in this version"
                          className="cursor-not-allowed rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-400"
                        >
                          Demo Register
                        </button>
                      </div>
                    </article>
                  ))}
                {!loading &&
                  !loadError &&
                  filteredEvents.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center lg:col-span-2">
                      <p className="font-semibold">No events found</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {events.length === 0
                          ? "Create an event to save it in the database."
                          : "Try another event name or category."}
                      </p>
                    </div>
                  )}
              </div>
            
) : activePage === "Students" ? (
  <div className="space-y-6">
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-bold">Register a Student</h3>
      <p className="mt-1 text-sm text-slate-500">
        Register a student for an existing college event.
      </p>

      <form
        className="mt-5 grid gap-4 md:grid-cols-3"
        onSubmit={handleRegisterStudent}
      >
        <input
          required
          maxLength={120}
          placeholder="Student name"
          aria-label="Student name"
          value={registrationForm.name}
          onChange={(event) =>
            setRegistrationForm((current) => ({
              ...current,
              name: event.target.value,
            }))
          }
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
        />

        <input
          required
          type="email"
          maxLength={254}
          placeholder="Student email"
          aria-label="Student email"
          value={registrationForm.email}
          onChange={(event) =>
            setRegistrationForm((current) => ({
              ...current,
              email: event.target.value,
            }))
          }
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
        />

        <select
          required
          aria-label="Select event"
          value={registrationForm.eventId}
          onChange={(event) =>
            setRegistrationForm((current) => ({
              ...current,
              eventId: event.target.value,
            }))
          }
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
        >
          <option value="">Select an event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={registrationLoading || events.length === 0}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 md:col-span-3"
        >
          {registrationLoading ? "Registering..." : "Register Student"}
        </button>
      </form>

      {registrationError && (
        <p role="alert" className="mt-4 text-sm text-rose-600">
          {registrationError}
        </p>
      )}

      {registrationSuccess && (
        <p role="status" className="mt-4 text-sm text-emerald-700">
          {registrationSuccess}
        </p>
      )}
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-bold">Registered Students</h3>

      {registrations.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          No student registrations yet. Register a student above to get started.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-slate-500">
              <tr>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Event</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((registration) => (
                <tr
                  key={registration.id}
                  className="border-b last:border-0"
                >
                  <td className="px-3 py-3 font-medium">
                    {registration.name}
                  </td>
                  <td className="px-3 py-3">{registration.email}</td>
                  <td className="px-3 py-3">
                    {registration.event.title}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
) : (
  <div className="rounded-2xl border border-slate-200 bg-white p-8">
    <h3 className="text-lg font-bold">{activePage}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-500">
      This section is part of our project plan. Its features will
      be added in the next development milestones.
    </p>
  </div>
)}

            <footer className="mt-10 border-t border-slate-200 py-5 text-center text-xs text-slate-400">
              CampusHub · College Event Management System · DevOps Project
            </footer>
          </div>
        </section>
      </div>
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onClick={closeCreateForm}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-event-title"
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 id="create-event-title" className="text-lg font-bold">
                  Create Event
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Save a campus event to the SQLite database.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreateForm}
                disabled={saving}
                className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                aria-label="Close create event form"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleCreateEvent} noValidate>
              <div>
                <label htmlFor="event-title" className="mb-1 block text-sm font-medium">
                  Event title
                </label>
                <input
                  id="event-title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  maxLength={120}
                  aria-invalid={Boolean(formErrors.title)}
                  aria-describedby={formErrors.title ? "event-title-error" : undefined}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Tech Fest 2026"
                />
                {formErrors.title && (
                  <p
                    id="event-title-error"
                    className="mt-1 text-xs text-rose-600"
                  >
                    {formErrors.title}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="event-category" className="mb-1 block text-sm font-medium">
                  Category
                </label>
                <input
                  id="event-category"
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  maxLength={120}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Technical, Cultural, Sports"
                />
                {formErrors.category && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.category}</p>
                )}
              </div>
              <div>
                <label htmlFor="event-date" className="mb-1 block text-sm font-medium">
                  Date
                </label>
                <input
                  id="event-date"
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, date: event.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                {formErrors.date && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.date}</p>
                )}
              </div>
              <div>
                <label htmlFor="event-venue" className="mb-1 block text-sm font-medium">
                  Venue
                </label>
                <input
                  id="event-venue"
                  value={form.venue}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, venue: event.target.value }))
                  }
                  maxLength={120}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Main Auditorium"
                />
                {formErrors.venue && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.venue}</p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
