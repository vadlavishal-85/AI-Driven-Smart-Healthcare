import drRahulImg from '../assets/images/doctor-rahul.jpg';
import drPriyaImg from '../assets/images/doctor-priya.jpg';
import drArjunImg from '../assets/images/doctor-arjun.jpg';
import drSnehaImg from '../assets/images/doctor-sneha.jpg';
import drVikramImg from '../assets/images/doctor-vikram.jpg';
import defaultDoctorImg from '../assets/images/portal-doctor.jpg';

/**
 * Returns a high quality healthcare doctor portrait matching the doctor's name or specialization.
 */
export const getDoctorImage = (doctor) => {
  if (!doctor) return defaultDoctorImg;

  const name = (doctor.full_name || '').toLowerCase();
  const spec = (doctor.specialization || '').toLowerCase();

  if (name.includes('rahul') || spec.includes('cardio')) {
    return drRahulImg;
  }
  if (name.includes('priya') || spec.includes('derma')) {
    return drPriyaImg;
  }
  if (name.includes('arjun') || spec.includes('neuro')) {
    return drArjunImg;
  }
  if (name.includes('sneha') || spec.includes('pediat')) {
    return drSnehaImg;
  }
  if (name.includes('vikram') || spec.includes('ortho')) {
    return drVikramImg;
  }

  return defaultDoctorImg;
};

/**
 * Returns department name from doctor's specialization.
 */
export const getDoctorDepartment = (doctor) => {
  if (!doctor) return 'General Medicine';
  const spec = (doctor.specialization || '').toLowerCase();

  if (spec.includes('cardio')) return 'Cardiology';
  if (spec.includes('derma')) return 'Dermatology';
  if (spec.includes('neuro')) return 'Neurology';
  if (spec.includes('pediat')) return 'Pediatrics';
  if (spec.includes('ortho')) return 'Orthopedics';

  return doctor.specialization || 'General Healthcare';
};
