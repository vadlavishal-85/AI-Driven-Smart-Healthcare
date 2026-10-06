"""
SmartHealthcare Models Package
"""
from app.models.auth import Role, User
from app.models.appointments import Appointment, AppointmentStatus, DoctorProfile

__all__ = ["Role", "User", "Appointment", "AppointmentStatus", "DoctorProfile"]
