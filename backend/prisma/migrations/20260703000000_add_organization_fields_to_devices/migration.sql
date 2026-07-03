-- Migration: Add UUID & Organization Fields to Devices
-- Created: 2026-07-03

-- Add organization fields to devices table
ALTER TABLE "devices" ADD COLUMN "uuid" UUID;
ALTER TABLE "devices" ADD COLUMN "organization_name" VARCHAR(255);
ALTER TABLE "devices" ADD COLUMN "organization_uuid" UUID;
ALTER TABLE "devices" ADD COLUMN "organization_sname" VARCHAR(50);
