import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_TEXT_LENGTH = 120;

type EventPayload = {
  title?: unknown;
  category?: unknown;
  date?: unknown;
  venue?: unknown;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseEventDate(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

function mapEvent(event: {
  id: number;
  title: string;
  category: string;
  date: Date;
  venue: string;
  _count: { registrations: number };
}) {
  return {
    id: event.id,
    title: event.title,
    category: event.category,
    date: event.date.toISOString(),
    venue: event.venue,
    attendees: event._count.registrations,
  };
}

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(events.map(mapEvent));
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let body: EventPayload;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    const title = cleanText(body.title);
    const category = cleanText(body.category);
    const venue = cleanText(body.venue);
    const date = parseEventDate(body.date);

    if (!title || !category || !venue || !date) {
      return NextResponse.json(
        { error: "Valid title, category, date and venue are required" },
        { status: 400 }
      );
    }

    if (
      title.length > MAX_TEXT_LENGTH ||
      category.length > MAX_TEXT_LENGTH ||
      venue.length > MAX_TEXT_LENGTH
    ) {
      return NextResponse.json(
        { error: "Title, category and venue must be 120 characters or fewer" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: { title, category, date, venue },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    return NextResponse.json(mapEvent(event), { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
