-- Drop adventure and dungeon related tables
DROP TABLE IF EXISTS dungeon_runs CASCADE;
DROP TABLE IF EXISTS adventure_progress CASCADE;
DROP TABLE IF EXISTS adventure_nodes CASCADE;

-- Also clean up the roguelike tables that were previously removed from code
DROP TABLE IF EXISTS roguelike_completed_nodes CASCADE;
DROP TABLE IF EXISTS roguelike_progress CASCADE;
DROP TABLE IF EXISTS roguelike_questions CASCADE;
DROP TABLE IF EXISTS roguelike_nodes CASCADE;
DROP TABLE IF EXISTS roguelike_lessons CASCADE;
DROP TABLE IF EXISTS roguelike_maps CASCADE;
DROP TABLE IF EXISTS roguelike_music CASCADE;