import uuid
from app.database.postgres import SessionLocal
from app.models.user import User
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.data_sharing import DataSharing
from app.models.access_log import AccessLog
from app.database.mongodb import medical_records_collection, prescriptions_collection
from app.core.security import hash_password

def fix_and_unify_doctors():
    db = SessionLocal()
    demo_password_hash = hash_password('Demo@12345')

    print("=== STEP 1: RESOLVING DOCTOR DUPLICATES & PRESERVING IDS ===")
    # Preserved Doctor 1 (Dr. Rahul Sharma - Cardiology)
    # Original user: 18a09215-31c2-472e-a384-3e0799d1aa30, doctor: 40b1b782-d545-4575-ad26-d4c04550e27e
    doc1_user = db.query(User).filter(User.id == '18a09215-31c2-472e-a384-3e0799d1aa30').first()
    doc1_rec = db.query(Doctor).filter(Doctor.id == '40b1b782-d545-4575-ad26-d4c04550e27e').first()

    # Preserved Doctor 3 (Dr. Arjun Kumar - Neurology)
    # Original user: 17610c16-d6d6-4100-91a6-cdaf4198b1c5, doctor: a4fb5dd7-47bf-4d24-9d2a-94ebf1e62550
    doc3_user = db.query(User).filter(User.id == '17610c16-d6d6-4100-91a6-cdaf4198b1c5').first()
    doc3_rec = db.query(Doctor).filter(Doctor.id == 'a4fb5dd7-47bf-4d24-9d2a-94ebf1e62550').first()

    # Check for duplicate Rahul Sharma created by seed script
    dup_rahul_user = db.query(User).filter(User.email == 'dr.rahul.sharma@healthcare.com', User.id != doc1_user.id).first() if doc1_user else None
    if dup_rahul_user:
        dup_rahul_doc = db.query(Doctor).filter(Doctor.user_id == dup_rahul_user.id).first()
        if dup_rahul_doc:
            # Re-point appointments to preserved doctor ID
            repointed_appts = db.query(Appointment).filter(Appointment.doctor_id == dup_rahul_doc.id).update({Appointment.doctor_id: doc1_rec.id})
            print(f"  Re-pointed {repointed_appts} appointments from duplicate Rahul to preserved doctor {doc1_rec.id}")
            db.delete(dup_rahul_doc)
            db.flush()
        db.delete(dup_rahul_user)
        db.flush()
        print("  Removed duplicate Rahul Sharma user and doctor record.")

    # Check for duplicate Arjun Kumar created by seed script
    dup_arjun_user = db.query(User).filter(User.email == 'dr.arjun.kumar@healthcare.com', User.id != doc3_user.id).first() if doc3_user else None
    if dup_arjun_user:
        dup_arjun_doc = db.query(Doctor).filter(Doctor.user_id == dup_arjun_user.id).first()
        if dup_arjun_doc:
            # Re-point appointments, data sharing, access logs, mongodb
            repointed_appts = db.query(Appointment).filter(Appointment.doctor_id == dup_arjun_doc.id).update({Appointment.doctor_id: doc3_rec.id})
            repointed_shares = db.query(DataSharing).filter(DataSharing.doctor_id == dup_arjun_doc.id).update({DataSharing.doctor_id: doc3_rec.id})
            repointed_logs = db.query(AccessLog).filter(AccessLog.user_id == dup_arjun_user.id).update({AccessLog.user_id: doc3_user.id})
            medical_records_collection.update_many({'doctor_id': str(dup_arjun_doc.id)}, {'$set': {'doctor_id': str(doc3_rec.id)}})
            prescriptions_collection.update_many({'doctor_id': str(dup_arjun_doc.id)}, {'$set': {'doctor_id': str(doc3_rec.id)}})
            print(f"  Re-pointed {repointed_appts} appts, {repointed_shares} shares, {repointed_logs} logs to preserved doctor {doc3_rec.id}")
            db.delete(dup_arjun_doc)
            db.flush()
        db.delete(dup_arjun_user)
        db.flush()
        print("  Removed duplicate Arjun Kumar user and doctor record.")

    # Update Preserved Doctor 1 -> Dr. Rahul Sharma
    if doc1_user and doc1_rec:
        doc1_user.full_name = 'Dr. Rahul Sharma'
        doc1_user.email = 'dr.rahul.sharma@healthcare.com'
        doc1_user.password_hash = demo_password_hash
        doc1_user.is_active = True
        doc1_rec.specialization = 'Cardiology'
        doc1_rec.hospital_name = 'Metro Heart Hospital'
        doc1_rec.license_number = 'LIC-CARD-SHARMA-01'
        db.flush()
        print(f"  Updated Doctor 1: {doc1_user.full_name} ({doc1_user.email}) -> Spec: {doc1_rec.specialization}, Doc ID: {doc1_rec.id}")

    # Update Preserved Doctor 3 -> Dr. Arjun Kumar
    if doc3_user and doc3_rec:
        doc3_user.full_name = 'Dr. Arjun Kumar'
        doc3_user.email = 'dr.arjun.kumar@healthcare.com'
        doc3_user.password_hash = demo_password_hash
        doc3_user.is_active = True
        doc3_rec.specialization = 'Neurology'
        doc3_rec.hospital_name = 'City Neuro Institute'
        doc3_rec.license_number = 'LIC-NEUR-KUMAR-03'
        db.flush()
        print(f"  Updated Doctor 3: {doc3_user.full_name} ({doc3_user.email}) -> Spec: {doc3_rec.specialization}, Doc ID: {doc3_rec.id}")

    # Doctor 2: Dr. Priya Reddy
    doc2_user = db.query(User).filter(User.email == 'dr.priya.reddy@healthcare.com').first()
    if doc2_user:
        doc2_user.full_name = 'Dr. Priya Reddy'
        doc2_user.password_hash = demo_password_hash
        doc2_user.is_active = True
        doc2_rec = db.query(Doctor).filter(Doctor.user_id == doc2_user.id).first()
        if doc2_rec:
            doc2_rec.specialization = 'Dermatology'
            doc2_rec.hospital_name = 'Apollo Skin & Wellness'
            doc2_rec.license_number = 'LIC-DERM-REDDY-02'
        db.flush()
        print(f"  Updated Doctor 2: {doc2_user.full_name} -> Spec: {doc2_rec.specialization}, Doc ID: {doc2_rec.id}")

    # Doctor 4: Dr. Sneha Patel
    doc4_user = db.query(User).filter(User.email == 'dr.sneha.patel@healthcare.com').first()
    if doc4_user:
        doc4_user.full_name = 'Dr. Sneha Patel'
        doc4_user.password_hash = demo_password_hash
        doc4_user.is_active = True
        doc4_rec = db.query(Doctor).filter(Doctor.user_id == doc4_user.id).first()
        if doc4_rec:
            doc4_rec.specialization = 'Pediatrics'
            doc4_rec.hospital_name = "Children's Health Center"
            doc4_rec.license_number = 'LIC-PEDI-PATEL-04'
        db.flush()
        print(f"  Updated Doctor 4: {doc4_user.full_name} -> Spec: {doc4_rec.specialization}, Doc ID: {doc4_rec.id}")

    # Doctor 5: Dr. Vikram Rao
    doc5_user = db.query(User).filter(User.email == 'dr.vikram.rao@healthcare.com').first()
    if doc5_user:
        doc5_user.full_name = 'Dr. Vikram Rao'
        doc5_user.password_hash = demo_password_hash
        doc5_user.is_active = True
        doc5_rec = db.query(Doctor).filter(Doctor.user_id == doc5_user.id).first()
        if doc5_rec:
            doc5_rec.specialization = 'Orthopedics'
            doc5_rec.hospital_name = 'Apex Orthopedic Hospital'
            doc5_rec.license_number = 'LIC-ORTH-RAO-05'
        db.flush()
        print(f"  Updated Doctor 5: {doc5_user.full_name} -> Spec: {doc5_rec.specialization}, Doc ID: {doc5_rec.id}")

    print("\n=== STEP 2: UPDATING 5 DEMO PATIENTS WITH Demo@12345 PASSWORD ===")
    patient_emails = [
        'vishal@healthcare.com',
        'ejaswini@healthcare.com',
        'sirisha@healthcare.com',
        'krishna@healthcare.com',
        'vamshi@healthcare.com',
    ]
    for p_email in patient_emails:
        p_user = db.query(User).filter(User.email == p_email).first()
        if p_user:
            p_user.password_hash = demo_password_hash
            p_user.is_active = True
            db.flush()
            print(f"  Password updated for patient {p_user.full_name} ({p_email})")

    db.commit()

    print("\n=== SUMMARY OF ALL DOCTORS IN POSTGRESQL ===")
    all_docs = db.query(Doctor).join(User).all()
    print(f"Total doctors count: {len(all_docs)}")
    for d in all_docs:
        appts_count = db.query(Appointment).filter(Appointment.doctor_id == d.id).count()
        print(f" - {d.user.full_name} | {d.user.email} | Spec: {d.specialization} | Doc ID: {d.id} | User ID: {d.user_id} | Appts: {appts_count}")

    db.close()

if __name__ == '__main__':
    fix_and_unify_doctors()
