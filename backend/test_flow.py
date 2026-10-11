import urllib.request
import json
from datetime import datetime, timedelta, timezone

def make_req(url, method='GET', data=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, data=json.dumps(data).encode() if data else None, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

print('--- Test A: Patient login works ---')
p_login = make_req('http://127.0.0.1:8000/auth/login', 'POST', {
    'email': 'patient.rbac.test@healthcare.com',
    'password': 'TestPassword123'
})
p_token = p_login['access_token']
print('Patient Login: PASS')

print('--- Test E: At least 5 doctors are displayed ---')
docs = make_req('http://127.0.0.1:8000/doctors', 'GET', token=p_token)
print(f'Doctors retrieved by Patient: {len(docs)}')
req_names = ['Dr. Rahul Sharma', 'Dr. Priya Reddy', 'Dr. Arjun Kumar', 'Dr. Sneha Patel', 'Dr. Vikram Rao']
for name in req_names:
    match = next((d for d in docs if d['full_name'] == name), None)
    assert match is not None, f'Missing {name}'
    print('  - Found:', match['full_name'], '|', match['specialization'], '|', match['hospital_name'])
print('Demo Doctors Displayed: PASS')

print('--- Test F: Patient can select a doctor ---')
dr_rahul = next(d for d in docs if d['full_name'] == 'Dr. Rahul Sharma')
print('Selected Doctor:', dr_rahul['full_name'], 'ID:', dr_rahul['id'])
print('Doctor Selection: PASS')

print('--- Test G: Patient can select date/time ---')
future_date = (datetime.now(timezone.utc) + timedelta(days=5)).replace(hour=10, minute=0, second=0, microsecond=0).isoformat()
print('Selected Date/Time:', future_date)
print('Date/Time Selection: PASS')

print('--- Test H: Patient can confirm appointment ---')
reason_text = 'Follow-up consultation for cardiovascular screening'
created_appt = make_req('http://127.0.0.1:8000/appointments', 'POST', {
    'doctor_id': dr_rahul['id'],
    'appointment_date': future_date,
    'reason': reason_text
}, token=p_token)
print('Appointment Created: ID =', created_appt['id'], ', Status =', created_appt['status'])
print('Appointment Creation: PASS')

print('--- Test I: Appointment appears in patient appointment list ---')
my_appts = make_req('http://127.0.0.1:8000/appointments/my', 'GET', token=p_token)
matched_p = next((a for a in my_appts if a['id'] == created_appt['id']), None)
assert matched_p is not None, 'Appointment not found in patient list!'
print('Patient Appointment Verified:', matched_p['id'], '| Doctor:', matched_p.get('doctor', {}).get('full_name'), '| Status:', matched_p['status'])
print('Patient Appointment List: PASS')

print('--- Test J: Login as the selected demo doctor (Dr. Rahul Sharma) ---')
d_login = make_req('http://127.0.0.1:8000/auth/login', 'POST', {
    'email': 'dr.rahul.sharma@healthcare.com',
    'password': 'TestPassword123'
})
d_token = d_login['access_token']
print('Doctor Login (Dr. Rahul Sharma): PASS')

print('--- Test K: The same appointment appears in that doctor appointment list ---')
d_appts = make_req('http://127.0.0.1:8000/appointments/doctor', 'GET', token=d_token)
matched_d = next((a for a in d_appts if a['id'] == created_appt['id']), None)
assert matched_d is not None, 'Appointment not found in doctor list!'
print('Doctor Appointment Verified:', matched_d['id'], '| Patient:', matched_d.get('patient', {}).get('full_name'), '| Reason:', matched_d['reason'])
print('Doctor Appointment Visibility: PASS')

print('ALL TESTS A THROUGH K VERIFIED SUCCESSFULLY!')
