
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    event: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { POST } from "./route";

describe("POST /api/events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an event with valid input", async () => {
    vi.mocked(prisma.event.create).mockResolvedValue({
      id: 1,
      title: "Tech Fest",
      category: "Technology",
      date: new Date("2027-01-15T00:00:00.000Z"),
      venue: "College Hall",
      createdAt: new Date(),
      _count: { registrations: 0 },
    } as never);

    const request = new Request("http://localhost/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Tech Fest",
        category: "Technology",
        date: "2027-01-15",
        venue: "College Hall",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.title).toBe("Tech Fest");
    expect(data.attendees).toBe(0);
  });

  it("rejects an event with missing required fields", async () => {
    const request = new Request("http://localhost/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Tech Fest" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("required");
    expect(prisma.event.create).not.toHaveBeenCalled();
  });
});
