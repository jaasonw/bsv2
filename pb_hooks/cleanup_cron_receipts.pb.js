/**
 * PocketBase Cron Hook: Cleanup Old Receipts
 *
 * Automatically deletes receipt records older than 7 days
 * to prevent database bloat and manage storage costs.
 *
 * Schedule: Daily at midnight (0 0 * * *)
 */

// Create a logger with common attributes for this cron job
const jobLogger = $app
  .logger()
  .with("job", "cleanupOldReceipts", "type", "cron");

cronAdd("cleanupOldReceipts", "0 0 * * *", () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  jobLogger.info(
    "Starting cleanup of old receipts",
    "cutoff_date",
    sevenDaysAgo.toISOString()
  );

  try {
    // Find all receipts older than 7 days
    const oldReceipts = $app.findRecordsByFilter(
      "receipts",
      `created < "${sevenDaysAgo.toISOString()}"`,
      "-created", // sort by created desc (newest first among old ones)
      1000, // batch size
      0 // offset
    );

    if (oldReceipts.length === 0) {
      jobLogger.info("No old receipts found for cleanup");
      return;
    }

    jobLogger.info("Found receipts to delete", "count", oldReceipts.length);

    let deletedCount = 0;
    let errorCount = 0;

    for (const receipt of oldReceipts) {
      const receiptId = receipt.id;
      const receiptTitle = receipt.getString("title");

      try {
        $app.delete(receipt);
        deletedCount++;
        jobLogger.info(
          "Deleted receipt",
          "receipt_id",
          receiptId,
          "title",
          receiptTitle
        );
      } catch (err) {
        errorCount++;
        jobLogger.error(
          "Failed to delete receipt",
          "receipt_id",
          receiptId,
          "error",
          err.message
        );
      }
    }

    jobLogger.info(
      "Cleanup complete",
      "deleted_count",
      deletedCount,
      "error_count",
      errorCount
    );

    // Warn if there were errors
    if (errorCount > 0) {
      jobLogger.warn(
        "Some receipts failed to delete",
        "error_count",
        errorCount
      );
    }
  } catch (err) {
    jobLogger.error("Fatal error during cleanup", "error", err.message);
  }
});

$app.logger().info("Cleanup cron job registered", "schedule", "0 0 * * *");
