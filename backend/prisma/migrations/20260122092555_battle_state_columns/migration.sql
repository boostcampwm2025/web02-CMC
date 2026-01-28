/*
  Warnings:

  - You are about to drop the column `active_state` on the `battles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "battles" DROP COLUMN "active_state",
ADD COLUMN     "attacks_state" JSONB,
ADD COLUMN     "chats_all_state" JSONB,
ADD COLUMN     "chats_team_a_state" JSONB,
ADD COLUMN     "chats_team_b_state" JSONB,
ADD COLUMN     "current_phase" VARCHAR(20),
ADD COLUMN     "current_round" INTEGER,
ADD COLUMN     "defenses_state" JSONB,
ADD COLUMN     "expired_at" TIMESTAMP(3),
ADD COLUMN     "opinion_history_state" JSONB,
ADD COLUMN     "participants_state" JSONB,
ADD COLUMN     "phase_count" INTEGER,
ADD COLUMN     "started_at" TIMESTAMP(3),
ADD COLUMN     "team_votes_state" JSONB,
ADD COLUMN     "user_info_state" JSONB;
