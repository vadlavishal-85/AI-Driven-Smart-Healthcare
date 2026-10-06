// MongoDB Index Definitions for SmartHealthcare
// Database: smarthealthcare

const db = db.getSiblingDB('smarthealthcare');

// 1. medical_records Indexes
db.medical_records.createIndex({ patient_id: 1 }, { name: "idx_medrec_patient" });
db.medical_records.createIndex({ doctor_id: 1 }, { name: "idx_medrec_doctor" });
db.medical_records.createIndex({ created_at: -1 }, { name: "idx_medrec_created" });

// 2. clinical_notes Indexes
db.clinical_notes.createIndex({ patient_id: 1 }, { name: "idx_notes_patient" });
db.clinical_notes.createIndex({ doctor_id: 1 }, { name: "idx_notes_doctor" });
db.clinical_notes.createIndex({ appointment_id: 1 }, { name: "idx_notes_appointment" });

// 3. prescriptions Indexes
db.prescriptions.createIndex({ patient_id: 1 }, { name: "idx_rx_patient" });
db.prescriptions.createIndex({ doctor_id: 1 }, { name: "idx_rx_doctor" });

// 4. data_exchange Indexes
db.data_exchange.createIndex({ status: 1 }, { name: "idx_exchange_status" });
db.data_exchange.createIndex({ created_at: -1 }, { name: "idx_exchange_created" });

// 5. healthcare_events Indexes
db.healthcare_events.createIndex({ patient_id: 1 }, { name: "idx_events_patient" });
db.healthcare_events.createIndex({ event_type: 1 }, { name: "idx_events_type" });
db.healthcare_events.createIndex({ timestamp: -1 }, { name: "idx_events_timestamp" });
