import { buildServer } from "../server";
import request from "supertest";
import { StreamMode, StreamStatus } from "@prisma/client";

type KidRow = {
  parent_id: string;
  parental_consent: boolean;
  allowed_modes: StreamMode[];
  content_filter_level: number;
};

const mockStore = {
  users: new Map<string, { suspended: boolean }>(),
  kids: new Map<string, KidRow>(),
  streams: [] as Array<{ user_id: string | null; status: StreamStatus }>(),
};

jest.mock("@omni-life/db", () => ({
  prisma: {
    user: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        const u = mockStore.users.get(where.id);
        return u ? { suspended: u.suspended } : null;
      },
    },
    kidProfile: {
      findFirst: async ({ where }: { where: { id: string; parent_id: string } }) => {
        const k = mockStore.kids.get(where.id);
        if (!k || k.parent_id !== where.parent_id) return null;
        return {
          id: where.id,
          parental_consent: k.parental_consent,
          allowed_modes: k.allowed_modes,
          content_filter_level: k.content_filter_level,
        };
      },
    },
    stream: {
      count: async ({ where }: { where: { user_id: string; status: StreamStatus } }) => {
        return mockStore.streams.filter((s) => s.user_id === where.user_id && s.status === where.status).length;
      },
      create: async ({ data }: { data: { user_id: string | null; status: StreamStatus; [key: string]: unknown } }) => {
        mockStore.streams.push({ user_id: data.user_id, status: data.status });
        return { id: "s1", ...data };
      },
    },
  },
}));

describe("POST /v1/streams/start FAMILY_STUDIO gate", () => {
  beforeEach(() => {
    mockStore.users.clear();
    mockStore.kids.clear();
    mockStore.streams = [];
  });

  it("returns 403 PARENTAL_CONSENT_REQUIRED when is_kid is false", async () => {
    mockStore.users.set("u1", { suspended: false });
    const app = await buildServer();

    const res = await request(app.server)
      .post("/v1/streams/start")
      .set("x-test-user-id", "u1")
      .send({
        title: "Family stream",
        mode: "FAMILY_STUDIO",
        is_kid: false,
        kid_profile_id: "k1",
        parental_consent: true,
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("PARENTAL_CONSENT_REQUIRED");
    await app.close();
  });

  it("returns 403 when parental_consent body is not true", async () => {
    mockStore.users.set("u1", { suspended: false });
    const app = await buildServer();

    const res = await request(app.server)
      .post("/v1/streams/start")
      .set("x-test-user-id", "u1")
      .send({
        title: "Family stream",
        mode: "FAMILY_STUDIO",
        is_kid: true,
        kid_profile_id: "k1",
        parental_consent: false,
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("PARENTAL_CONSENT_REQUIRED");
    await app.close();
  });

  it("returns 403 when kid profile missing", async () => {
    mockStore.users.set("u1", { suspended: false });
    const app = await buildServer();

    const res = await request(app.server)
      .post("/v1/streams/start")
      .set("x-test-user-id", "u1")
      .send({
        title: "Family stream",
        mode: "FAMILY_STUDIO",
        is_kid: true,
        kid_profile_id: "missing",
        parental_consent: true,
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("PARENTAL_CONSENT_REQUIRED");
    await app.close();
  });

  it("returns 403 when DB parental_consent is false", async () => {
    mockStore.users.set("u1", { suspended: false });
    mockStore.kids.set("k1", {
      parent_id: "u1",
      parental_consent: false,
      allowed_modes: [StreamMode.FAMILY_STUDIO],
      content_filter_level: 3,
    });
    const app = await buildServer();

    const res = await request(app.server)
      .post("/v1/streams/start")
      .set("x-test-user-id", "u1")
      .send({
        title: "Family stream",
        mode: "FAMILY_STUDIO",
        is_kid: true,
        kid_profile_id: "k1",
        parental_consent: true,
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("PARENTAL_CONSENT_REQUIRED");
    await app.close();
  });

  it("returns 403 when FAMILY_STUDIO not in allowed_modes", async () => {
    mockStore.users.set("u1", { suspended: false });
    mockStore.kids.set("k1", {
      parent_id: "u1",
      parental_consent: true,
      allowed_modes: [StreamMode.GO_OUT, StreamMode.STAY_IN],
      content_filter_level: 3,
    });
    const app = await buildServer();

    const res = await request(app.server)
      .post("/v1/streams/start")
      .set("x-test-user-id", "u1")
      .send({
        title: "Family stream",
        mode: "FAMILY_STUDIO",
        is_kid: true,
        kid_profile_id: "k1",
        parental_consent: true,
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("PARENTAL_CONSENT_REQUIRED");
    await app.close();
  });

  it("returns 200 with stream and livekit_token when all gates pass", async () => {
    mockStore.users.set("u1", { suspended: false });
    mockStore.kids.set("k1", {
      parent_id: "u1",
      parental_consent: true,
      allowed_modes: [StreamMode.FAMILY_STUDIO],
      content_filter_level: 3,
    });
    const app = await buildServer();

    const res = await request(app.server)
      .post("/v1/streams/start")
      .set("x-test-user-id", "u1")
      .send({
        title: "Safe family title",
        mode: "FAMILY_STUDIO",
        is_kid: true,
        kid_profile_id: "k1",
        parental_consent: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.stream).toBeDefined();
    expect(res.body.livekit_token).toMatch(/^placeholder-livekit-token-/);
    await app.close();
  });
});
