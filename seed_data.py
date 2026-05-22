import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from clinic.models import Role, Staff

def seed():
    roles = [
        "Administrator",
        "Receptionist",
        "Doctor",
        "Pharmacist",
        "Lab Technician"
    ]

    print("Seeding roles...")
    for role_name in roles:
        Role.objects.get_or_create(role_name=role_name)

    print("Seeding default administrator...")
    admin_role = Role.objects.get(role_name="Administrator")
    Staff.objects.get_or_create(username="admin", defaults={"full_name": "System Administrator", "gender": "Other", "joining_date": "2023-01-01", "mobile_number": "1234567890", "password": "admin", "role": admin_role})

    print("Seeding default receptionist...")
    rec_role = Role.objects.get(role_name="Receptionist")
    Staff.objects.get_or_create(username="receptionist", defaults={"full_name": "Jane Reception", "gender": "Female", "joining_date": "2023-01-01", "mobile_number": "1234567891", "password": "password", "role": rec_role})

    print("Seeding default doctor...")
    doc_role = Role.objects.get(role_name="Doctor")
    doc_staff, _ = Staff.objects.get_or_create(username="doctor", defaults={"full_name": "Dr. John Smith", "gender": "Male", "joining_date": "2023-01-01", "mobile_number": "1234567892", "password": "password", "role": doc_role})
    
    # We must also create a Doctor model record since it's required for Appointments
    from clinic.models import Doctor, Specialization
    spec, _ = Specialization.objects.get_or_create(specialization_name="General Medicine")
    Doctor.objects.get_or_create(staff=doc_staff, defaults={"consultation_fee": 100.00, "specialization": spec})

    print("Seeding default pharmacist...")
    pharm_role = Role.objects.get(role_name="Pharmacist")
    Staff.objects.get_or_create(username="pharmacist", defaults={"full_name": "Paul Pharmacy", "gender": "Male", "joining_date": "2023-01-01", "mobile_number": "1234567893", "password": "password", "role": pharm_role})

    print("Seeding medicine categories...")
    from clinic.models import MedicineCategory
    med_cats = ["Painkillers", "Antibiotics", "Vitamins", "Syrups"]
    for cat in med_cats:
        MedicineCategory.objects.get_or_create(category_name=cat)

    print("Seeding complete! You can login with usernames 'admin' (password: 'admin'), 'receptionist', 'doctor', or 'pharmacist' (password: 'password').")

if __name__ == '__main__':
    seed()
