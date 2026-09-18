import { reconcileEntityCollection, runMigrationCLI } from "./safe-migrate.mjs";

const testResults = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTestCase(testName, testFn) {
  console.log(`\n--------------------------------------------------`);
  console.log(`🧪 TESTING: ${testName}`);
  console.log(`--------------------------------------------------`);
  try {
    await testFn();
    testResults.push({ name: testName, passed: true });
    console.log(`✅ PASS: ${testName}`);
  } catch (err) {
    testResults.push({ name: testName, passed: false, error: err.message });
    console.error(`❌ FAIL: ${testName} - ${err.message}`);
  }
}

async function runAllMigrationGuardTests() {
  console.log("==================================================");
  console.log("🛡️  MIGRATION GUARD VERIFICATION TEST SUITE (Section 44.17)");
  console.log("==================================================");

  // Case A — MongoDB has newer data
  await runTestCase("Case A — MongoDB has newer data (MongoDB preserved)", async () => {
    const mongoData = [
      {
        _id: "66554433221100aabbccddee",
        title: "Premium HD Bridal Makeup",
        price: "₹25,000",
        description: "Updated in MongoDB by Admin",
        updatedAt: "2026-09-18T10:00:00Z",
      },
    ];
    const localData = [
      {
        _id: "66554433221100aabbccddee",
        title: "Premium HD Bridal Makeup",
        price: "₹20,000",
        description: "Older local store value",
        updatedAt: "2026-09-17T10:00:00Z",
      },
    ];

    const report = reconcileEntityCollection(localData, mongoData, { dryRun: true });
    assert(report.duplicatesAvoided === 1, "Duplicate avoided via matching stable ID");
    assert(report.conflicts === 1, "Conflict reported for differing price/desc");
    assert(report.toInsert.length === 0, "No records to insert");
    assert(report.conflictDetails[0].reason.includes("MongoDB preserved"), "MongoDB explicitly preserved");
  });

  // Case B — local-store has a unique record
  await runTestCase("Case B — Local-store has unique record (Candidate detected, no deletion)", async () => {
    const mongoData = [
      { _id: "66554433221100aabbccddee", title: "Existing Service", price: "₹10,000" },
    ];
    const localData = [
      { _id: "66554433221100aabbccddee", title: "Existing Service", price: "₹10,000" },
      { _id: "new_unique_local_12345", title: "Brand New Unique Service", price: "₹15,000" },
    ];

    const report = reconcileEntityCollection(localData, mongoData, { dryRun: true });
    assert(report.candidates === 1, "Expected exactly 1 new candidate");
    assert(report.toInsert.length === 1, "Expected 1 item in toInsert queue");
    assert(report.toInsert[0].title === "Brand New Unique Service", "Correct candidate identified");
  });

  // Case C — Conflicting record (same entity, different values)
  await runTestCase("Case C — Conflicting record (Conflict detected, MongoDB not overwritten)", async () => {
    const mongoData = [
      { _id: "srv_001", title: "Airbrush Makeup", price: "₹22,000", description: "MongoDB version" },
    ];
    const localData = [
      { _id: "srv_001", title: "Airbrush Makeup", price: "₹18,000", description: "Local version" },
    ];

    const report = reconcileEntityCollection(localData, mongoData, { dryRun: true });
    assert(report.conflicts === 1, "Expected conflict count to be 1");
    assert(report.toInsert.length === 0, "Conflicting record must not be queued as new insertion");
  });

  // Case D — Duplicate detection (same stable ID)
  await runTestCase("Case D — Duplicate (Same stable ID detected, no duplicate inserted)", async () => {
    const mongoData = [
      { _id: "srv_exact_match_1", title: "HD Saree Draping", price: "₹1,500", description: "Match" },
    ];
    const localData = [
      { _id: "srv_exact_match_1", title: "HD Saree Draping", price: "₹1,500", description: "Match" },
    ];

    const report = reconcileEntityCollection(localData, mongoData, { dryRun: true });
    assert(report.duplicatesAvoided === 1, "Duplicate detected and avoided");
    assert(report.candidates === 0, "Zero candidates");
    assert(report.conflicts === 0, "Zero conflicts because values match");
  });

  // Case E — Migration repeated (Idempotency)
  await runTestCase("Case E — Migration repeated (Idempotent, no duplicate records generated on 2nd run)", async () => {
    let mongoData = [
      { _id: "srv_001", title: "Initial Service", price: "₹10,000" },
    ];
    const localData = [
      { _id: "srv_001", title: "Initial Service", price: "₹10,000" },
      { _id: "srv_002", title: "Second Service", price: "₹15,000" },
    ];

    // Run 1: Detect candidate and simulate insertion into mongoData
    const run1 = reconcileEntityCollection(localData, mongoData, { dryRun: false });
    assert(run1.candidates === 1, "Run 1 finds 1 candidate");
    mongoData = [...mongoData, ...run1.toInsert];

    // Run 2: Re-run with updated mongoData
    const run2 = reconcileEntityCollection(localData, mongoData, { dryRun: false });
    assert(run2.candidates === 0, "Run 2 finds 0 candidates");
    assert(run2.toInsert.length === 0, "Run 2 generates 0 new insertions");
    assert(run2.duplicatesAvoided === 2, "Run 2 avoids all existing duplicates");
  });

  // Case F — Incomplete / simulated failure does not mark completed
  await runTestCase("Case F — Interrupted / Incomplete migration does not mark completed", async () => {
    const res = await runMigrationCLI({
      NODE_ENV: "development",
      ENABLE_DATA_MIGRATION: "true",
      MIGRATION_DRY_RUN: "true",
    });
    // In dry run or connection abort, status is never SUCCESS
    assert(res.status !== "SUCCESS", "Incomplete run must never be marked SUCCESS");
  });

  // Case G — Production without confirmation aborts safely
  await runTestCase("Case G — Production without confirmation aborts safely", async () => {
    const res = await runMigrationCLI({
      NODE_ENV: "production",
      ENABLE_DATA_MIGRATION: "true",
      ALLOW_PRODUCTION_MIGRATION: "false",
      MIGRATION_DRY_RUN: "false",
    });
    assert(res.status === "ABORTED", "Expected status to be ABORTED");
    assert(res.reason === "ALLOW_PRODUCTION_MIGRATION_MISSING", "Expected ALLOW_PRODUCTION_MIGRATION_MISSING");
  });

  // Case G2 — Production without backup confirmation aborts safely
  await runTestCase("Case G2 — Production without backup confirmation aborts safely", async () => {
    const res = await runMigrationCLI({
      NODE_ENV: "production",
      ENABLE_DATA_MIGRATION: "true",
      ALLOW_PRODUCTION_MIGRATION: "true",
      MIGRATION_DRY_RUN: "false",
      MIGRATION_BACKUP_CONFIRMED: "false",
    });
    assert(res.status === "ABORTED", "Expected status to be ABORTED");
    assert(res.reason === "MIGRATION_BACKUP_CONFIRMED_MISSING", "Expected MIGRATION_BACKUP_CONFIRMED_MISSING");
  });

  console.log("\n==================================================");
  console.log("📊 MIGRATION GUARD TEST SUMMARY");
  console.log("==================================================");
  const total = testResults.length;
  const passed = testResults.filter((r) => r.passed).length;
  const failed = testResults.filter((r) => !r.passed).length;
  console.log(`Total Migration Tests : ${total}`);
  console.log(`Passed                : ${passed}`);
  console.log(`Failed                : ${failed}`);
  console.log(`Success Rate          : ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL SAFE MIGRATION GUARD TESTS PASSED (100%)!\n");
    process.exit(0);
  }
}

runAllMigrationGuardTests();
