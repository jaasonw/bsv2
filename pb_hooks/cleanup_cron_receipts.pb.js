/**
 * PocketBase Cron Hook: Cleanup Old Receipts
 *
 * Automatically deletes receipt records older than 7 days
 * to prevent database bloat and manage storage costs.
 *
 * Schedule: Daily at midnight (0 0 * * *)
 */

cronAdd("cleanupOldReceipts", "0 0 * * *", () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  console.log(
    `[CRON] Starting cleanup of receipts older than ${sevenDaysAgo.toISOString()}`
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
      console.log("[CRON] No old receipts found for cleanup");
      return;
    }

    console.log(`[CRON] Found ${oldReceipts.length} receipts to delete`);

    let deletedCount = 0;
    let errorCount = 0;

    for (const receipt of oldReceipts) {
      try {
        $app.delete(receipt);
        deletedCount++;
        console.log(
          `[CRON] Deleted receipt: ${receipt.id} (${receipt.getString("title")})`
        );
      } catch (err) {
        errorCount++;
        console.error(
          `[CRON] Failed to delete receipt ${receipt.id}:`,
          err.message
        );
      }
    }

    console.log(
      `[CRON] Cleanup complete. Deleted: ${deletedCount}, Errors: ${errorCount}`
    );

    // Optional: Send notification to admin if there were errors
    if (errorCount > 0) {
      console.error(`[CRON] Warning: ${errorCount} receipts failed to delete`);
    }
  } catch (err) {
    console.error("[CRON] Fatal error during cleanup:", err.message);
  }
});

console.log("[CRON] Cleanup cron job registered - runs daily at midnight");
