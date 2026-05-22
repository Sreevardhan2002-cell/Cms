from rest_framework import serializers
from .models import (
    Role, Staff, Specialization, Doctor, Membership, Patient,
    Appointment, Consultation, MedicineCategory, Medicine,
    MedicinePrescription, LabTestCategory, LabTest,
    LabTestPrescription, MedicineStock
)

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = '__all__'
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return Staff.objects.create(**validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.password = password

        instance.save()
        return instance

class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = '__all__'

class DoctorSerializer(serializers.ModelSerializer):
    staff_details = StaffSerializer(source='staff', read_only=True)
    specialization_details = SpecializationSerializer(source='specialization', read_only=True)

    class Meta:
        model = Doctor
        fields = '__all__'

class MembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = '__all__'

class PatientSerializer(serializers.ModelSerializer):
    membership_details = MembershipSerializer(source='membership', read_only=True)

    class Meta:
        model = Patient
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    doctor_details = DoctorSerializer(source='doctor', read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'

class ConsultationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        fields = '__all__'

class MedicineCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineCategory
        fields = '__all__'

class MedicineSerializer(serializers.ModelSerializer):
    category_details = MedicineCategorySerializer(source='category', read_only=True)

    class Meta:
        model = Medicine
        fields = '__all__'

class MedicinePrescriptionSerializer(serializers.ModelSerializer):
    medicine_details = MedicineSerializer(source='medicine', read_only=True)

    class Meta:
        model = MedicinePrescription
        fields = '__all__'

class LabTestCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTestCategory
        fields = '__all__'

class LabTestSerializer(serializers.ModelSerializer):
    category_details = LabTestCategorySerializer(source='category', read_only=True)

    class Meta:
        model = LabTest
        fields = '__all__'

class LabTestPrescriptionSerializer(serializers.ModelSerializer):
    lab_test_details = LabTestSerializer(source='lab_test', read_only=True)

    class Meta:
        model = LabTestPrescription
        fields = '__all__'

class MedicineStockSerializer(serializers.ModelSerializer):
    medicine_details = MedicineSerializer(source='medicine', read_only=True)

    class Meta:
        model = MedicineStock
        fields = '__all__'
