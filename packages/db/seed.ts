import { PrismaClient, UserRole, StreamMode, StreamStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password_hash = await bcrypt.hash("OmniLifeDemo!1", 10);

  await prisma.safetyEvent.deleteMany();
  await prisma.mimiLog.deleteMany();
  await prisma.stream.deleteMany();
  await prisma.kidProfile.deleteMany();
  await prisma.user.deleteMany();

  const parentA = await prisma.user.create({
    data: {
      email: "parent-a@omnilife.app",
      username: "parent_a",
      display_name: "Parent A",
      role: UserRole.PARENT,
      password_hash,
      is_verified: true,
      livekit_identity: "lk_parent_a",
    },
  });

  const parentB = await prisma.user.create({
    data: {
      email: "parent-b@omnilife.app",
      username: "parent_b",
      display_name: "Parent B",
      role: UserRole.PARENT,
      password_hash,
      is_verified: true,
      livekit_identity: "lk_parent_b",
    },
  });

  const kid1 = await prisma.kidProfile.create({
    data: {
      display_name: "River",
      parent_id: parentA.id,
      date_of_birth: new Date("2016-04-12"),
      parental_consent: true,
      consent_timestamp: new Date(),
      consent_ip: "127.0.0.1",
      allowed_modes: [StreamMode.GO_OUT, StreamMode.STAY_IN, StreamMode.FAMILY_STUDIO],
      content_filter_level: 4,
    },
  });

  const kid2 = await prisma.kidProfile.create({
    data: {
      display_name: "Sky",
      parent_id: parentB.id,
      date_of_birth: new Date("2017-11-02"),
      parental_consent: true,
      consent_timestamp: new Date(),
      consent_ip: "127.0.0.1",
      allowed_modes: [StreamMode.GO_OUT, StreamMode.STAY_IN],
      content_filter_level: 3,
    },
  });

  const creator = await prisma.user.create({
    data: {
      email: "creator@omnilife.app",
      username: "omni_creator",
      display_name: "Omni Creator",
      role: UserRole.CREATOR,
      password_hash,
      is_verified: true,
      livekit_identity: "lk_creator_1",
    },
  });

  const streams = [
    {
      title: "Morning cartoon commute",
      mode: StreamMode.GO_OUT,
      status: StreamStatus.ENDED,
      user_id: creator.id,
      tags: ["go-out", "city"],
      geo_lat: 37.77,
      geo_lng: -122.42,
      geo_label: "San Francisco",
      duration_seconds: 3600,
      peak_viewers: 120,
    },
    {
      title: "Living room studio night",
      mode: StreamMode.STAY_IN,
      status: StreamStatus.LIVE,
      user_id: creator.id,
      tags: ["stay-in", "cozy"],
      viewer_count: 42,
      peak_viewers: 80,
    },
    {
      title: "Family Studio — story time",
      mode: StreamMode.FAMILY_STUDIO,
      status: StreamStatus.PENDING,
      user_id: parentA.id,
      kid_profile_id: kid1.id,
      is_private: true,
      is_family_safe: true,
      tags: ["family", "story"],
    },
    {
      title: "Sketch walk (ended)",
      mode: StreamMode.GO_OUT,
      status: StreamStatus.ARCHIVED,
      user_id: creator.id,
      tags: ["sketch"],
      duration_seconds: 900,
    },
    {
      title: "Weekend play space",
      mode: StreamMode.STAY_IN,
      status: StreamStatus.FLAGGED,
      user_id: creator.id,
      tags: ["weekend"],
      safety_score: 0.4,
    },
  ];

  for (const s of streams) {
    await prisma.stream.create({ data: s });
  }

  // eslint-disable-next-line no-console -- seed script
  console.log("Seed complete:", { parentA: parentA.id, parentB: parentB.id, kid1: kid1.id, kid2: kid2.id });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
