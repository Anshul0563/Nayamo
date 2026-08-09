/**
 * Safe backfill script for `jewelleryType` field.
 *
 * Problem:
 *   Products that were created before the `jewelleryType` field was properly
 *   collected (e.g. via the admin AddProduct form) ended up with the Mongoose
 *   schema default `"earrings"` even when they were actually necklaces, rings,
 *   etc. This made the shop mega-menu filters incorrect.
 *
 * What this does:
 *   - Only products with a MISSING or INVALID `jewelleryType` are touched.
 *   - Products that already have a valid `jewelleryType`
 *     (earrings/necklaces/rings/bracelets/bangles/anklets/sets/other) are left
 *     completely untouched.
 *   - Missing/invalid values are set to `"other"` (NOT "earrings") so they
 *     don't clutter any specific jewellery-type filter.
 *
 * Idempotent:
 *   Running this more than once is safe. Already-correct products are not
 *   modified, and the affected count on the second run will be 0.
 *
 * Usage:
 *   node scripts/backfillJewelleryType.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const mongoose = require("mongoose");

const VALID_JEWELLERY_TYPES = [
  "earrings",
  "necklaces",
  "rings",
  "bracelets",
  "bangles",
  "anklets",
  "sets",
  "other",
];

const run = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI not set. Aborting.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("🔗 MongoDB connected");

  const Product = mongoose.model(
    "Product",
    new mongoose.Schema({}, { strict: false }),
  );

  // 1) Report phase: find products with missing/invalid jewelleryType.
  const all = await Product.find({}, { title: 1, jewelleryType: 1 }).lean();
  const affected = all.filter(
    (p) =>
      !p.jewelleryType ||
      !VALID_JEWELLERY_TYPES.includes(String(p.jewelleryType).toLowerCase()),
  );

  console.log(`\n📦 Total products: ${all.length}`);
  console.log(
    `⚠️  Products with missing/invalid jewelleryType (will be set to "other"): ${affected.length}`,
  );

  if (affected.length > 0) {
    console.log("\nAffected products (title -> current jewelleryType):");
    affected.forEach((p) =>
      console.log(`   - ${p.title} -> "${p.jewelleryType || "(missing)"}"`),
    );
  }

  // 2) Update phase (only runs if there is data to fix).
  if (affected.length > 0) {
    const ids = affected.map((p) => p._id);
    const result = await Product.updateMany(
      { _id: { $in: ids } },
      { $set: { jewelleryType: "other" } },
    );
    console.log(`\n✅ Updated ${result.modifiedCount} product(s) to "other".`);
  } else {
    console.log("\n✅ Nothing to update. All products have a valid jewelleryType.");
  }

  await mongoose.connection.close();
  console.log("\n✅ Done!");
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
