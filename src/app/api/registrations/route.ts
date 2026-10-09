
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const registrations = await prisma.registration.findMany({
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Failed to fetch registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let body: {
      name?: unknown;
      email?: unknown;
      eventId?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const eventId = body.eventId;

    if (
      !name ||
      name.length > 120 ||
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof eventId !== "number" ||
      !Number.isInteger(eventId) ||
      eventId < 1
    ) {
      return NextResponse.json(
        { error: "Enter a valid name, email, and event" },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.create({
      data: { name, email, eventId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This email is already registered for this event" },
        { status: 409 }
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        { error: "Selected event does not exist" },
        { status: 400 }
      );
    }

    console.error("Failed to create registration:", error);
    return NextResponse.json(
      { error: "Failed to create registration" },
      { status: 500 }
    );
  }
}
