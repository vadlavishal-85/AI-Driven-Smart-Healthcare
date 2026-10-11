import uuid
from datetime import date
from app.database.postgres import SessionLocal
from app.models.user import User
from app.models.patient import Patient
from app.core.security import hash_password

def seed_demo_patients():
    db = SessionLocal()
    pwd_hash = hash_password('Demo@12345')

    # Desired 5 demo patients
    demo_patients = [
        {
            'name': 'Vishal',
            'email': 'vishal@healthcare.com',
            'blood_group': 'O+',
            'gender': 'Male',
            'dob': date(1992, 5, 14),
            'phone': '+1 (555) 789-0101',
            'emergency_contact': '+1 (555) 789-9901',
            'address': '104 Magnolia Blvd, Cityview',
            'legacy_email': 'patient.rbac.test@healthcare.com',
            'legacy_pat_id': 'aa5e1f8a-4731-42db-956d-4e15b6c3bbf6',
        },
        {
            'name': 'Ejaswini',
            'email': 'ejaswini@healthcare.com',
            'blood_group': 'A+',
            'gender': 'Female',
            'dob': date(1995, 8, 22),
            'phone': '+1 (555) 789-0102',
            'emergency_contact': '+1 (555) 789-9902',
            'address': '208 Orchid Lane, Greenfield',
            'legacy_email': 'patient2.test@healthcare.com',
            'legacy_pat_id': '6d0ed887-4f2a-4d82-aaa9-463f2b9c34c9',
        },
        {
            'name': 'Sirisha',
            'email': 'sirisha@healthcare.com',
            'blood_group': 'B+',
            'gender': 'Female',
            'dob': date(1990, 11, 3),
            'phone': '+1 (555) 789-0103',
            'emergency_contact': '+1 (555) 789-9903',
            'address': '312 Rosewood St, Oakridge',
            'legacy_email': None,
            'legacy_pat_id': None,
        },
        {
            'name': 'Krishna',
            'email': 'krishna@healthcare.com',
            'blood_group': 'AB+',
            'gender': 'Male',
            'dob': date(1988, 3, 19),
            'phone': '+1 (555) 789-0104',
            'emergency_contact': '+1 (555) 789-9904',
            'address': '416 Maple Court, Highland',
            'legacy_email': None,
            'legacy_pat_id': None,
        },
        {
            'name': 'Vamshi',
            'email': 'vamshi@healthcare.com',
            'blood_group': 'O-',
            'gender': 'Male',
            'dob': date(1996, 12, 8),
            'phone': '+1 (555) 789-0105',
            'emergency_contact': '+1 (555) 789-9905',
            'address': '520 Cedar Way, Riverdale',
            'legacy_email': None,
            'legacy_pat_id': None,
        },
    ]

    for p_info in demo_patients:
        # Check if user already exists by target email or legacy email
        user = None
        if p_info['legacy_email']:
            user = db.query(User).filter(User.email == p_info['legacy_email']).first()
        if not user:
            user = db.query(User).filter(User.email == p_info['email']).first()

        if user:
            # Update existing user to preserve all database connections and IDs
            print(f"Updating existing user {user.id} -> name: {p_info['name']}, email: {p_info['email']}")
            user.full_name = p_info['name']
            user.email = p_info['email']
            user.role = 'PATIENT'
            user.password_hash = pwd_hash
            user.is_active = True
            db.commit()
            db.refresh(user)

            # Ensure patient record exists
            patient = db.query(Patient).filter(Patient.user_id == user.id).first()
            if not patient and p_info['legacy_pat_id']:
                patient = db.query(Patient).filter(Patient.id == p_info['legacy_pat_id']).first()
                if patient:
                    patient.user_id = user.id

            if not patient:
                patient = Patient(
                    id=uuid.UUID(p_info['legacy_pat_id']) if p_info['legacy_pat_id'] else uuid.uuid4(),
                    user_id=user.id,
                    blood_group=p_info['blood_group'],
                    gender=p_info['gender'],
                    date_of_birth=p_info['dob'],
                    phone=p_info['phone'],
                    emergency_contact=p_info['emergency_contact'],
                    address=p_info['address'],
                )
                db.add(patient)
            else:
                patient.blood_group = p_info['blood_group']
                patient.gender = p_info['gender']
                patient.date_of_birth = p_info['dob']
                patient.emergency_contact = p_info['emergency_contact']
                patient.address = p_info['address']
            db.commit()
            db.refresh(patient)
            print(f"  Patient ID preserved/updated: {patient.id}")
        else:
            # Create new user and patient
            print(f"Creating new patient: {p_info['name']} ({p_info['email']})")
            new_user = User(
                id=uuid.uuid4(),
                full_name=p_info['name'],
                email=p_info['email'],
                password_hash=pwd_hash,
                role='PATIENT',
                phone=p_info['phone'],
                is_active=True,
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            new_patient = Patient(
                id=uuid.uuid4(),
                user_id=new_user.id,
                blood_group=p_info['blood_group'],
                gender=p_info['gender'],
                date_of_birth=p_info['dob'],
                emergency_contact=p_info['emergency_contact'],
                address=p_info['address'],
            )
            db.add(new_patient)
            db.commit()
            db.refresh(new_patient)
            print(f"  Created Patient ID: {new_patient.id}")

    # Summary check
    all_pats = db.query(Patient).join(User).all()
    print(f"\nTotal Patients in PostgreSQL: {len(all_pats)}")
    for p in all_pats:
        print(f" - ID: {p.id} | User: {p.user.full_name} | Email: {p.user.email} | Blood: {p.blood_group}")

    db.close()

if __name__ == '__main__':
    seed_demo_patients()
