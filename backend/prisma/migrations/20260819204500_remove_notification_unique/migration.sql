-- Drop unique constraint on Notification.applicationId
-- and add a regular index to support many notifications per application
DROP INDEX IF EXISTS "Notification_applicationId_key";
CREATE INDEX "Notification_applicationId_idx" ON "Notification"("applicationId");
