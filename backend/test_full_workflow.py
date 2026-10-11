from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from app.main import app
from app.database.postgres import SessionLocal
from app.models.user import User
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.appointment import Appointment

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("TEST SUITE: DOCTOR DIRECTORY, APPOINTMENTS, & DEMO CREDENTIALS")
    print("=" * 60)

    # -------------------------------------------------------------
    # TEST D: DEMO CREDENTIALS (All 5 doctors + 5 patients)
    # -------------------------------------------------------------
    print("\n--- TEST D: DEMO CREDENTIALS VERIFICATION ---")
    doctors_info = [
        ("Dr. Rahul Sharma", "dr.rahul.sharma@healthcare.com", "Cardiology"),
        ("Dr. Priya Reddy", "dr.priya.reddy@healthcare.com", "Dermatology"),
        ("Dr. Arjun Kumar", "dr.arjun.kumar@healthcare.com", "Neurology"),
        ("Dr. Sneha Patel", "dr.sneha.patel@healthcare.com", "Pediatrics"),
        ("Dr. Vikram Rao", "dr.vikram.rao@healthcare.com", "Orthopedics"),
    ]
    patients_info = [
        ("Vishal", "vishal@healthcare.com"),
        ("Ejaswini", "ejaswini@healthcare.com"),
        ("Sirisha", "sirisha@healthcare.com"),
        ("Krishna", "krishna@healthcare.com"),
        ("Vamshi", "vamshi@healthcare.com"),
    ]

    doctor_tokens = {}
    for name, email, dept in doctors_info:
        r = client.post("/auth/login", json={"email": email, "password": "Demo@12345"})
        assert r.status_code == 200, f"Doctor login failed for {email}: {r.text}"
        data = r.json()
        token = data["access_token"]
        doctor_tokens[email] = token

        # Verify /auth/me
        me_res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200, f"/auth/me failed for {email}"
        user_info = me_res.json()
        assert user_info["full_name"] == name, f"Expected {name}, got {user_info['full_name']}"
        assert user_info["role"] == "DOCTOR", f"Expected role DOCTOR, got {user_info['role']}"

        # Verify /doctors/me
        doc_res = client.get("/doctors/me", headers={"Authorization": f"Bearer {token}"})
        assert doc_res.status_code == 200, f"/doctors/me failed for {email}"
        doc_prof = doc_res.json()
        assert doc_prof["specialization"] == dept, f"Expected dept {dept}, got {doc_prof['specialization']}"
        print(f" [PASS] Doctor: {name:18} | {email:32} | {dept:12} | Role: DOCTOR | Login Verified")

    patient_tokens = {}
    for name, email in patients_info:
        r = client.post("/auth/login", json={"email": email, "password": "Demo@12345"})
        assert r.status_code == 200, f"Patient login failed for {email}: {r.text}"
        data = r.json()
        token = data["access_token"]
        patient_tokens[email] = token

        # Verify /auth/me
        me_res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200, f"/auth/me failed for {email}"
        user_info = me_res.json()
        assert user_info["full_name"] == name, f"Expected {name}, got {user_info['full_name']}"
        assert user_info["role"] == "PATIENT", f"Expected role PATIENT, got {user_info['role']}"

        # Verify /patients/me
        pat_res = client.get("/patients/me", headers={"Authorization": f"Bearer {token}"})
        assert pat_res.status_code == 200, f"/patients/me failed for {email}"
        pat_prof = pat_res.json()
        assert pat_prof["full_name"] == name
        print(f" [PASS] Patient: {name:17} | {email:32} | Role: PATIENT | Login Verified")

    # -------------------------------------------------------------
    # TEST A: DOCTOR DIRECTORY
    # -------------------------------------------------------------
    print("\n--- TEST A: DOCTOR DIRECTORY VERIFICATION ---")
    admin_login = client.post("/auth/login", json={"email": "admin.rbac.test@healthcare.com", "password": "TestPassword123"})
    assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    docs_resp = client.get("/doctors", headers=admin_headers)
    assert docs_resp.status_code == 200, f"Failed to get doctors: {docs_resp.text}"
    all_docs = docs_resp.json()
    print(f" Total doctors returned by GET /doctors: {len(all_docs)}")
    assert len(all_docs) == 5, f"Expected exactly 5 doctors, found {len(all_docs)}"

    doc_names = [d["full_name"] for d in all_docs]
    doc_specs = {d["full_name"]: d["specialization"] for d in all_docs}
    for name, email, dept in doctors_info:
        assert name in doc_names, f"Missing doctor {name} in directory"
        assert doc_specs[name] == dept, f"Doctor {name} expected spec {dept}, got {doc_specs[name]}"

    # Verify no placeholder names
    for d in all_docs:
        assert d["full_name"] not in ["Dr. Updated Name", "Second Doctor User"], f"Placeholder doctor found: {d['full_name']}"
    print(" [PASS] All 5 doctors present with correct names and specializations.")
    print(" [PASS] No placeholder names ('Dr. Updated Name', 'Second Doctor User') present.")

    # -------------------------------------------------------------
    # TEST B: PATIENT BOOKS CARDIOLOGY (Dr. Rahul Sharma)
    # -------------------------------------------------------------
    print("\n--- TEST B: PATIENT BOOKS CARDIOLOGY (Dr. Rahul Sharma) ---")
    rahul_doc = next(d for d in all_docs if d["full_name"] == "Dr. Rahul Sharma")
    priya_doc = next(d for d in all_docs if d["full_name"] == "Dr. Priya Reddy")
    rahul_doc_id = rahul_doc["id"]
    priya_doc_id = priya_doc["id"]

    vishal_token = patient_tokens["vishal@healthcare.com"]
    vishal_headers = {"Authorization": f"Bearer {vishal_token}"}

    appt_time = (datetime.now(timezone.utc) + timedelta(days=2)).replace(microsecond=0)
    book_resp = client.post(
        "/appointments",
        headers=vishal_headers,
        json={
            "doctor_id": str(rahul_doc_id),
            "appointment_date": appt_time.isoformat(),
            "reason": "Cardiology screening consultation",
        },
    )
    assert book_resp.status_code == 201, f"Failed booking appointment: {book_resp.text}"
    booked_appt = book_resp.json()
    appt_id = booked_appt["id"]
    print(f" [PASS] Appointment created with ID: {appt_id}")
    print(f" [PASS] Stored doctor_id: {booked_appt['doctor_id']} matches Rahul Sharma's doctor ID: {rahul_doc_id}")
    assert booked_appt["doctor_id"] == rahul_doc_id, "Doctor ID mismatch in created appointment"

    # Verify Dr. Rahul Sharma sees the appointment
    rahul_headers = {"Authorization": f"Bearer {doctor_tokens['dr.rahul.sharma@healthcare.com']}"}
    rahul_appts_resp = client.get("/appointments/doctor", headers=rahul_headers)
    assert rahul_appts_resp.status_code == 200
    rahul_appts = rahul_appts_resp.json()
    rahul_appt_ids = [a["id"] for a in rahul_appts]
    assert appt_id in rahul_appt_ids, "Dr. Rahul Sharma does not see his own appointment"
    print(" [PASS] Dr. Rahul Sharma sees the appointment in his appointment list.")

    # Verify Dr. Priya Reddy does NOT see the appointment
    priya_headers = {"Authorization": f"Bearer {doctor_tokens['dr.priya.reddy@healthcare.com']}"}
    priya_appts_resp = client.get("/appointments/doctor", headers=priya_headers)
    assert priya_appts_resp.status_code == 200
    priya_appts = priya_appts_resp.json()
    priya_appt_ids = [a["id"] for a in priya_appts]
    assert appt_id not in priya_appt_ids, "Dr. Priya Reddy should NOT see Dr. Rahul Sharma's appointment"
    print(" [PASS] Dr. Priya Reddy CANNOT see Dr. Rahul Sharma's appointment in her list.")

    # -------------------------------------------------------------
    # TEST C: APPOINTMENT CANCELLATION / UPDATE
    # -------------------------------------------------------------
    print("\n--- TEST C: APPOINTMENT CANCELLATION & AUTHORIZATION ---")
    # 1. Unauthorized doctor attempt (Dr. Priya Reddy tries to update or cancel Dr. Rahul Sharma's appointment)
    unauthorized_cancel = client.put(f"/appointments/{appt_id}/cancel", headers=priya_headers)
    assert unauthorized_cancel.status_code == 403, f"Expected 403 for unauthorized cancel, got {unauthorized_cancel.status_code}"
    print(f" [PASS] Unauthorized doctor update blocked (HTTP 403): {unauthorized_cancel.json()['detail']}")

    unauthorized_update = client.put(f"/appointments/{appt_id}", headers=priya_headers, json={"status": "CANCELLED"})
    assert unauthorized_update.status_code == 403, f"Expected 403 for unauthorized update, got {unauthorized_update.status_code}"
    print(f" [PASS] Unauthorized doctor status change blocked (HTTP 403): {unauthorized_update.json()['detail']}")

    # 2. Authorized doctor cancels the appointment
    cancel_resp = client.put(f"/appointments/{appt_id}", headers=rahul_headers, json={"status": "CANCELLED"})
    assert cancel_resp.status_code == 200, f"Doctor cancellation failed: {cancel_resp.text}"
    cancelled_data = cancel_resp.json()
    assert cancelled_data["status"] == "CANCELLED", f"Expected CANCELLED status, got {cancelled_data['status']}"
    print(" [PASS] Dr. Rahul Sharma successfully updated appointment status to CANCELLED.")

    # 3. Verify in PostgreSQL directly
    db = SessionLocal()
    pg_appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    assert pg_appt.status == "CANCELLED", f"Expected CANCELLED in DB, got {pg_appt.status}"
    print(f" [PASS] PostgreSQL database status verified directly: {pg_appt.status}")
    db.close()

    # 4. Verify patient sees the updated status
    patient_appts = client.get("/appointments/my", headers=vishal_headers).json()
    pat_appt = next((a for a in patient_appts if a["id"] == appt_id), None)
    assert pat_appt is not None, "Patient cannot find their appointment"
    assert pat_appt["status"] == "CANCELLED", f"Patient sees {pat_appt['status']}, expected CANCELLED"
    print(" [PASS] Patient sees updated CANCELLED status in /appointments/my.")

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED SUCCESSFULLY (100% VERIFIED)")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
