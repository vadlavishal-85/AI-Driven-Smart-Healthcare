import requests

BASE_URL = "http://127.0.0.1:8000"

def test_patient_identities():
    print("=== 1. TESTING 5 DEMO PATIENT LOGINS & AUTH/ME ===")
    demo_accounts = [
        {"name": "Vishal", "email": "vishal@healthcare.com", "blood": "O+"},
        {"name": "Ejaswini", "email": "ejaswini@healthcare.com", "blood": "A+"},
        {"name": "Sirisha", "email": "sirisha@healthcare.com", "blood": "B+"},
        {"name": "Krishna", "email": "krishna@healthcare.com", "blood": "AB+"},
        {"name": "Vamshi", "email": "vamshi@healthcare.com", "blood": "O-"},
    ]

    for acc in demo_accounts:
        resp = requests.post(f"{BASE_URL}/auth/login", json={
            "email": acc["email"],
            "password": "TestPassword123"
        })
        assert resp.status_code == 200, f"Login failed for {acc['email']}: {resp.text}"
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Check /auth/me
        me_resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        assert me_resp.status_code == 200, f"/auth/me failed for {acc['email']}: {me_resp.text}"
        user_data = me_resp.json()
        assert user_data["full_name"] == acc["name"], f"Expected {acc['name']}, got {user_data['full_name']}"
        assert user_data["role"] == "PATIENT", f"Expected PATIENT role, got {user_data['role']}"

        # Check /patients/me
        pat_resp = requests.get(f"{BASE_URL}/patients/me", headers=headers)
        assert pat_resp.status_code == 200, f"/patients/me failed for {acc['email']}: {pat_resp.text}"
        pat_data = pat_resp.json()
        assert pat_data["full_name"] == acc["name"], f"Expected {acc['name']}, got {pat_data['full_name']}"
        assert pat_data["blood_group"] == acc["blood"], f"Expected blood {acc['blood']}, got {pat_data['blood_group']}"
        print(f"  [PASS] {acc['name']} ({acc['email']}) -> Auth & Profile Name: '{pat_data['full_name']}', Blood: '{pat_data['blood_group']}', PatientID: {pat_data['id']}")

    print("\n=== 2. TESTING LEGACY EMAIL ALIAS FALLBACK ===")
    legacy_resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "patient.rbac.test@healthcare.com",
        "password": "TestPassword123"
    })
    assert legacy_resp.status_code == 200, f"Legacy email login failed: {legacy_resp.text}"
    legacy_token = legacy_resp.json()["access_token"]
    legacy_headers = {"Authorization": f"Bearer {legacy_token}"}
    legacy_me = requests.get(f"{BASE_URL}/auth/me", headers=legacy_headers).json()
    assert legacy_me["full_name"] == "Vishal", f"Expected Vishal, got {legacy_me['full_name']}"
    print(f"  [PASS] Legacy patient.rbac.test@healthcare.com -> Name: '{legacy_me['full_name']}', Email: '{legacy_me['email']}'")

    print("\n=== 3. TESTING DOCTOR PATIENT VIEW (/patients/for-doctor) ===")
    doc_resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "doctor.rbac.test@healthcare.com",
        "password": "TestPassword123"
    })
    assert doc_resp.status_code == 200, f"Doctor login failed: {doc_resp.text}"
    doc_token = doc_resp.json()["access_token"]
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    doc_pats = requests.get(f"{BASE_URL}/patients/for-doctor", headers=doc_headers)
    assert doc_pats.status_code == 200, f"Failed getting doctor patients: {doc_pats.text}"
    doc_pats_list = doc_pats.json()
    names = [p["full_name"] for p in doc_pats_list]
    print(f"  Doctor sees {len(doc_pats_list)} patients: {names}")
    for exp in ["Vishal", "Ejaswini", "Sirisha", "Krishna", "Vamshi"]:
        assert exp in names, f"Expected {exp} in doctor patient list, got {names}"
    print("  [PASS] All 5 demo patients present in Doctor Patient Search/View")

    print("\n=== 4. TESTING EXISTING RELATIONSHIP PRESERVATION ===")
    # Login as Vishal and check appointments
    vishal_resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "vishal@healthcare.com",
        "password": "TestPassword123"
    })
    v_token = vishal_resp.json()["access_token"]
    v_headers = {"Authorization": f"Bearer {v_token}"}
    v_appts = requests.get(f"{BASE_URL}/appointments/my", headers=v_headers).json()
    print(f"  [PASS] Vishal has {len(v_appts)} preserved appointments")
    assert len(v_appts) > 0, "Preserved appointments should not be 0"

    print("\nALL VERIFICATIONS PASSED!")

if __name__ == "__main__":
    test_patient_identities()
