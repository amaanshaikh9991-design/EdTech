DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Task' AND column_name = 'score'
  ) THEN
    INSERT INTO "Mark" ("studentId", "subject", "title", "score", "maxScore", "markedAt", "createdAt")
    SELECT task."studentId", task."subject", task."title", task."score", task."maxScore",
      COALESCE(task."completedAt", task."createdAt"), task."createdAt"
    FROM "Task" AS task
    WHERE task."isComplete" = TRUE
      AND NOT EXISTS (
        SELECT 1 FROM "Mark" AS mark
        WHERE mark."studentId" = task."studentId"
          AND mark."subject" = task."subject"
          AND mark."title" = task."title"
          AND mark."score" = task."score"
          AND mark."maxScore" = task."maxScore"
          AND mark."markedAt" = COALESCE(task."completedAt", task."createdAt")
      );
  END IF;
END
$migration$;

ALTER TABLE "Task"
  DROP COLUMN IF EXISTS "score",
  DROP COLUMN IF EXISTS "maxScore",
  DROP COLUMN IF EXISTS "resultFormat";
