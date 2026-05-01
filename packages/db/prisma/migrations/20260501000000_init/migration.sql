-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CREATOR', 'VIEWER', 'PARENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "StreamMode" AS ENUM ('GO_OUT', 'STAY_IN', 'FAMILY_STUDIO');

-- CreateEnum
CREATE TYPE "StreamStatus" AS ENUM ('PENDING', 'LIVE', 'ENDED', 'FLAGGED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SafetyEventType" AS ENUM ('CONTENT_FLAG', 'PARENTAL_OVERRIDE', 'AGE_GATE_BLOCK', 'MIMI_CAUTION', 'EMERGENCY_STOP', 'CONSENT_MISSING');

-- CreateEnum
CREATE TYPE "SafetySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MimiMood" AS ENUM ('HAPPY', 'CALM', 'ENCOURAGING', 'CURIOUS', 'CAUTIOUS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "livekit_identity" TEXT,
    "mimi_logs_enabled" BOOLEAN NOT NULL DEFAULT true,
    "mimi_voice_enabled" BOOLEAN NOT NULL DEFAULT true,
    "password_hash" TEXT NOT NULL,
    "refresh_tokens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KidProfile" (
    "id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "parent_id" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "parental_consent" BOOLEAN NOT NULL DEFAULT false,
    "consent_timestamp" TIMESTAMP(3),
    "consent_ip" TEXT,
    "max_stream_duration" INTEGER NOT NULL DEFAULT 60,
    "allowed_modes" "StreamMode"[] DEFAULT ARRAY['GO_OUT', 'STAY_IN', 'FAMILY_STUDIO']::"StreamMode"[],
    "content_filter_level" INTEGER NOT NULL DEFAULT 3,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KidProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stream" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail_url" TEXT,
    "mode" "StreamMode" NOT NULL,
    "status" "StreamStatus" NOT NULL DEFAULT 'PENDING',
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "livekit_room_id" TEXT,
    "livekit_token" TEXT,
    "user_id" TEXT,
    "kid_profile_id" TEXT,
    "viewer_count" INTEGER NOT NULL DEFAULT 0,
    "peak_viewers" INTEGER NOT NULL DEFAULT 0,
    "duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "geo_lat" DOUBLE PRECISION,
    "geo_lng" DOUBLE PRECISION,
    "geo_label" TEXT,
    "is_family_safe" BOOLEAN NOT NULL DEFAULT true,
    "safety_score" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyEvent" (
    "id" TEXT NOT NULL,
    "event_type" "SafetyEventType" NOT NULL,
    "severity" "SafetySeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "resolved_by_id" TEXT,
    "stream_id" TEXT,
    "user_id" TEXT,
    "kid_profile_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafetyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MimiLog" (
    "id" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "prompt" TEXT,
    "response_text" TEXT NOT NULL,
    "mood" "MimiMood" NOT NULL,
    "should_speak" BOOLEAN NOT NULL DEFAULT false,
    "safety_status" TEXT NOT NULL DEFAULT 'SAFE',
    "latency_ms" INTEGER,
    "user_id" TEXT,
    "kid_profile_id" TEXT,
    "stream_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MimiLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_livekit_identity_key" ON "User"("livekit_identity");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "KidProfile_parent_id_idx" ON "KidProfile"("parent_id");

-- CreateIndex
CREATE INDEX "KidProfile_parental_consent_idx" ON "KidProfile"("parental_consent");

-- CreateIndex
CREATE UNIQUE INDEX "Stream_livekit_room_id_key" ON "Stream"("livekit_room_id");

-- CreateIndex
CREATE INDEX "Stream_user_id_idx" ON "Stream"("user_id");

-- CreateIndex
CREATE INDEX "Stream_kid_profile_id_idx" ON "Stream"("kid_profile_id");

-- CreateIndex
CREATE INDEX "Stream_status_idx" ON "Stream"("status");

-- CreateIndex
CREATE INDEX "Stream_mode_idx" ON "Stream"("mode");

-- CreateIndex
CREATE INDEX "Stream_livekit_room_id_idx" ON "Stream"("livekit_room_id");

-- CreateIndex
CREATE INDEX "Stream_created_at_idx" ON "Stream"("created_at");

-- CreateIndex
CREATE INDEX "SafetyEvent_stream_id_idx" ON "SafetyEvent"("stream_id");

-- CreateIndex
CREATE INDEX "SafetyEvent_user_id_idx" ON "SafetyEvent"("user_id");

-- CreateIndex
CREATE INDEX "SafetyEvent_kid_profile_id_idx" ON "SafetyEvent"("kid_profile_id");

-- CreateIndex
CREATE INDEX "SafetyEvent_event_type_idx" ON "SafetyEvent"("event_type");

-- CreateIndex
CREATE INDEX "SafetyEvent_created_at_idx" ON "SafetyEvent"("created_at");

-- CreateIndex
CREATE INDEX "SafetyEvent_resolved_idx" ON "SafetyEvent"("resolved");

-- CreateIndex
CREATE INDEX "MimiLog_user_id_idx" ON "MimiLog"("user_id");

-- CreateIndex
CREATE INDEX "MimiLog_kid_profile_id_idx" ON "MimiLog"("kid_profile_id");

-- CreateIndex
CREATE INDEX "MimiLog_stream_id_idx" ON "MimiLog"("stream_id");

-- CreateIndex
CREATE INDEX "MimiLog_created_at_idx" ON "MimiLog"("created_at");

-- AddForeignKey
ALTER TABLE "KidProfile" ADD CONSTRAINT "KidProfile_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_kid_profile_id_fkey" FOREIGN KEY ("kid_profile_id") REFERENCES "KidProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyEvent" ADD CONSTRAINT "SafetyEvent_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyEvent" ADD CONSTRAINT "SafetyEvent_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "Stream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyEvent" ADD CONSTRAINT "SafetyEvent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyEvent" ADD CONSTRAINT "SafetyEvent_kid_profile_id_fkey" FOREIGN KEY ("kid_profile_id") REFERENCES "KidProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MimiLog" ADD CONSTRAINT "MimiLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MimiLog" ADD CONSTRAINT "MimiLog_kid_profile_id_fkey" FOREIGN KEY ("kid_profile_id") REFERENCES "KidProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MimiLog" ADD CONSTRAINT "MimiLog_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "Stream"("id") ON DELETE SET NULL ON UPDATE CASCADE;
