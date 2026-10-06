
"use client";

import { useState } from "react";

type EventItem = {
  id: number;
  title: string;
  category: string;
  date: string;
  venue: string;
  attendees: number;
  color: string;
};

const initialEvents: EventItem[] = [
  {
    id: 1,
    title: "Annual Tech Fest",
    category: "Technology",
    date: "Oct 15, 2026",
    venue: "Main Auditorium",
    attendees: 120,
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: 2,
    title: "Cultural Night",
    category: "Cultural",
    date: "Oct 19, 2026",
    venue: "College Ground",
    attendees: 86,
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: 3,
    title: "Coding Competition",
    category: "Technology",
    date: "Oct 23, 2026",
    venue: "Computer Lab 1",
    attendees: 54,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: 4,
    title: "Sports Day",
    category: "Sports",
    date: "Oct 28, 2026",
    venue: "Sports Ground",
    attendees: 95,
    color: "bg-orange-100 text-orange-700",
  },
];

const navigation = [
  { name: "Dashboard", icon: "▦" },
  { name: "Events", icon: "▣" },
  { name: "Students", icon: "♙" },
  { name: "Reports", icon: "▥" },
];

export default function Home() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState(initialEvents);
  const [notice, setNotice] = useState("");

  const filteredEvents = events.filter((event) =>
    `${event.title} ${event.category} ${event.venue}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function registerStudent(event: EventItem) {
    setEvents((current) =>
      current.map((item) =>
        item.id === event.id
          ? { ...item, attendees: item.attendees + 1 }
          : item
      )
    );
    setNotice(`Demo registration recorded for ${event.title}.`);
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
                onClick={() => {
                  setActivePage("Events");
                  setNotice("Event creation will be added with the database.");
                }}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                + Create Event
              </button>
            </div>

            {notice && (
              <div
                role="status"
                className="mb-5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800"
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
                },
                {
                  label: "Student Registrations",
                  value: events.reduce(
                    (total, event) => total + event.attendees,
                    0
                  ),
                  icon: "♙",
                  color: "bg-violet-50 text-violet-700",
                },
                {
                  label: "Upcoming Events",
                  value: events.length,
                  icon: "◷",
                  color: "bg-emerald-50 text-emerald-700",
                },
                {
                  label: "Event Categories",
                  value: new Set(events.map((event) => event.category)).size,
                  icon: "▤",
                  color: "bg-orange-50 text-orange-700",
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
                  <p className="mt-1 text-xs text-slate-400">
                    Current sample data
                  </p>
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

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search events..."
                aria-label="Search events"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-64"
              />
            </div>

            {activePage === "Dashboard" || activePage === "Events" ? (
              <div className="grid gap-5 lg:grid-cols-2">
                {filteredEvents.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${event.color}`}
                      >
                        {event.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        Event #{event.id}
                      </span>
                    </div>

                    <h4 className="mt-5 text-lg font-bold">{event.title}</h4>

                    <div className="mt-3 space-y-2 text-sm text-slate-500">
                      <p>▦ &nbsp; {event.date}</p>
                      <p>⌖ &nbsp; {event.venue}</p>
                      <p>♙ &nbsp; {event.attendees} registrations</p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-xs font-medium text-emerald-700">
                        ● Upcoming
                      </span>
                      <button
                        onClick={() => registerStudent(event)}
                        className="rounded-lg border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                      >
                        Demo Register
                      </button>
                    </div>
                  </article>
                ))}

                {filteredEvents.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center lg:col-span-2">
                    <p className="font-semibold">No events found</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try another event name or category.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-8">
                <h3 className="text-lg font-bold">{activePage}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This section is part of our project plan. Its features will
                  be added in the next development milestones.
                </p>
                {activePage === "Students" && (
                  <button
                    onClick={() =>
                      setNotice(
                        "The student registration form will be added next."
                      )
                    }
                    className="mt-5 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Plan student registration
                  </button>
                )}
              </div>
            )}

            <footer className="mt-10 border-t border-slate-200 py-5 text-center text-xs text-slate-400">
              CampusHub · College Event Management System · DevOps Project
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
