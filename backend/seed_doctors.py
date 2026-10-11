import uuid
from app.database.postgres import SessionLocal
from app.models.user import User
from app.models.doctor import Doctor
from app.core.security import hash_password

def seed_demo_doctors():
    db = SessionLocal()
    demo_doctors = [
        {
            'full_name': 'Dr. Rahul Sharma',
            'email': 'dr.rahul.sharma@healthcare.com',
            'specialization': 'Cardiology',
            'hospital_name': 'Metro Heart Hospital',
            'license_number': 'LIC-CARD-SHARMA-01',
            'phone': '+1 (555) 234-5671'
        },
        {
            'full_name': 'Dr. Priya Reddy',
            'email': 'dr.priya.reddy@healthcare.com',
            'specialization': 'Dermatology',
            'hospital_name': 'Apollo Skin & Wellness',
            'license_number': 'LIC-DERM-REDDY-02',
            'phone': '+1 (555) 234-5672'
        },
        {
            'full_name': 'Dr. Arjun Kumar',
            'email': 'dr.arjun.kumar@healthcare.com',
            'specialization': 'Neurology',
            'hospital_name': 'City Neuro Institute',
            'license_number': 'LIC-NEUR-KUMAR-03',
            'phone': '+1 (555) 234-5673'
        },
        {
            'full_name': 'Dr. Sneha Patel',
            'email': 'dr.sneha.patel@healthcare.com',
            'specialization': 'Pediatrics',
            'hospital_name': "Children's Health Center",
            'license_number': 'LIC-PEDI-PATEL-04',
            'phone': '+1 (555) 234-5674'
        },
        {
            'full_name': 'Dr. Vikram Rao',
            'email': 'dr.vikram.rao@healthcare.com',
            'specialization': 'Orthopedics',
            'hospital_name': 'Apex Orthopedic Hospital',
            'license_number': 'LIC-ORTH-RAO-05',
            'phone': '+1 (555) 234-5675'
        }
    ]

    pwd_hash = hash_password('Demo@12345')

    for d_info in demo_doctors:
        user = db.query(User).filter(User.email == d_info['email']).first()
        if not user:
            user = User(
                id=uuid.uuid4(),
                full_name=d_info['full_name'],
                email=d_info['email'],
                password_hash=pwd_hash,
                role='DOCTOR',
                phone=d_info['phone'],
                is_active=True
            )
            db.add(user)
            db.flush()
        else:
            user.password_hash = pwd_hash
            user.is_active = True
            user.full_name = d_info['full_name']
            db.flush()

        doc = db.query(Doctor).filter(Doctor.user_id == user.id).first()
        if not doc:
            doc = Doctor(
                id=uuid.uuid4(),
                user_id=user.id,
                specialization=d_info['specialization'],
                license_number=d_info['license_number'],
                hospital_name=d_info['hospital_name']
            )
            db.add(doc)
        else:
            doc.specialization = d_info['specialization']
            doc.hospital_name = d_info['hospital_name']
            doc.license_number = d_info['license_number']

    db.commit()
    print('Demo doctors seeded successfully.')
    db.close()

if __name__ == '__main__':
    seed_demo_doctors()
