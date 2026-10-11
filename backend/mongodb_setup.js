// =============================================================================
// AI-Driven Smart Healthcare Data Exchange and Analytics Ecosystem
// MongoDB Atlas Setup Script
// Target Database: ai_smart_healthcare
// Safe for GitHub: Contains NO credentials or passwords.
// =============================================================================

const dbName = "ai_smart_healthcare";
const targetDb = db.getSiblingDB(dbName);

print(`Connecting to database: ${dbName}`);

// Define required collections
const collections = [
  "medical_records",
  "prescriptions",
  "doctor_notes",
  "lab_reports"
];

// 1. Create collections if they do not already exist
const existingCollections = targetDb.getCollectionNames();

collections.forEach((colName) => {
  if (!existingCollections.includes(colName)) {
    targetDb.createCollection(colName);
    print(`Created collection: ${colName}`);
  } else {
    print(`Collection already exists: ${colName}`);
  }
});

// 2. Create indexes for medical_records
print("Creating indexes for medical_records...");
targetDb.medical_records.createIndex({ patient_id: 1 });
targetDb.medical_records.createIndex({ doctor_id: 1 });
targetDb.medical_records.createIndex({ created_at: -1 });

// 3. Create indexes for prescriptions
print("Creating indexes for prescriptions...");
targetDb.prescriptions.createIndex({ patient_id: 1 });
targetDb.prescriptions.createIndex({ doctor_id: 1 });
targetDb.prescriptions.createIndex({ medical_record_id: 1 });
targetDb.prescriptions.createIndex({ created_at: -1 });

// 4. Create indexes for doctor_notes
print("Creating indexes for doctor_notes...");
targetDb.doctor_notes.createIndex({ patient_id: 1 });
targetDb.doctor_notes.createIndex({ doctor_id: 1 });
targetDb.doctor_notes.createIndex({ medical_record_id: 1 });
targetDb.doctor_notes.createIndex({ created_at: -1 });

// 5. Create indexes for lab_reports
print("Creating indexes for lab_reports...");
targetDb.lab_reports.createIndex({ patient_id: 1 });
targetDb.lab_reports.createIndex({ doctor_id: 1 });
targetDb.lab_reports.createIndex({ test_date: -1 });

// 6. Verification summary
print("\n--- Verification Summary ---");
print("Collections in " + dbName + ":");
targetDb.getCollectionNames().forEach((name) => {
  print(` - ${name}`);
});

print("\nIndexes created successfully for all collections.");
