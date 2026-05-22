from django.contrib import admin
from .models import (
    Role, Staff, Specialization, Doctor, Membership, Patient,
    Appointment, Consultation, MedicineCategory, Medicine,
    MedicinePrescription, LabTestCategory, LabTest,
    LabTestPrescription, MedicineStock
)

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['id', 'role_name', 'is_active']
    list_filter = ['is_active']
    search_fields = ['role_name']
    list_editable = ['is_active']
    list_per_page = 20

@admin.register(Specialization)
class SpecializationAdmin(admin.ModelAdmin):
    list_display = ['id', 'specialization_name']
    search_fields = ['specialization_name']
    list_per_page = 20

@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ['id', 'full_name', 'username', 'mobile_number', 'role', 'is_active', 'joining_date']
    list_filter = ['role', 'is_active', 'gender', 'joining_date']
    search_fields = ['full_name', 'username', 'mobile_number']
    list_editable = ['is_active']
    list_per_page = 20
    fieldsets = (
        ('Personal Information', {
            'fields': ('full_name', 'gender', 'mobile_number', 'joining_date')
        }),
        ('Account Information', {
            'fields': ('username', 'password', 'role')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing existing object
            return ['password']
        return []

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ['id', 'get_doctor_name', 'specialization', 'consultation_fee', 'is_active']
    list_filter = ['specialization', 'is_active']
    search_fields = ['staff__full_name', 'specialization__specialization_name']
    list_editable = ['consultation_fee', 'is_active']
    raw_id_fields = ['staff', 'specialization']
    list_per_page = 20
    
    def get_doctor_name(self, obj):
        return f"Dr. {obj.staff.full_name}"
    get_doctor_name.short_description = 'Doctor Name'
    get_doctor_name.admin_order_field = 'staff__full_name'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('staff', 'specialization')

@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ['id', 'membership_type', 'is_active']
    list_filter = ['is_active']
    search_fields = ['membership_type']
    list_editable = ['is_active']
    list_per_page = 20

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient_name', 'mobile_number', 'gender', 'membership', 'is_active', 'date_of_birth']
    list_filter = ['gender', 'membership', 'is_active']
    search_fields = ['patient_name', 'mobile_number', 'address']
    list_editable = ['is_active']
    date_hierarchy = 'date_of_birth'
    list_per_page = 20
    fieldsets = (
        ('Personal Information', {
            'fields': ('patient_name', 'date_of_birth', 'gender', 'mobile_number', 'address')
        }),
        ('Membership', {
            'fields': ('membership',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'doctor', 'appointment_date', 'token_number', 'consultation_status', 'is_active']
    list_filter = ['consultation_status', 'is_active', 'appointment_date']
    search_fields = ['patient__patient_name', 'doctor__staff__full_name']
    list_editable = ['consultation_status']
    date_hierarchy = 'appointment_date'
    raw_id_fields = ['patient', 'doctor']
    list_per_page = 20
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('patient', 'doctor__staff')

@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ['id', 'appointment', 'created_date', 'is_active']
    list_filter = ['is_active', 'created_date']
    search_fields = ['appointment__patient__patient_name', 'symptoms', 'diagnosis']
    readonly_fields = ['created_date']
    date_hierarchy = 'created_date'
    raw_id_fields = ['appointment']
    list_per_page = 20
    fieldsets = (
        ('Appointment', {
            'fields': ('appointment',)
        }),
        ('Medical Information', {
            'fields': ('symptoms', 'diagnosis', 'notes')
        }),
        ('Status', {
            'fields': ('is_active', 'created_date')
        }),
    )

@admin.register(MedicineCategory)
class MedicineCategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'category_name']
    search_fields = ['category_name']
    list_per_page = 20

@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ['id', 'medicine_name', 'category', 'unit', 'expiry_date', 'is_active']
    list_filter = ['category', 'is_active', 'expiry_date']
    search_fields = ['medicine_name']
    list_editable = ['is_active']
    date_hierarchy = 'expiry_date'
    list_per_page = 20
    fieldsets = (
        ('Medicine Information', {
            'fields': ('medicine_name', 'category', 'unit')
        }),
        ('Date Information', {
            'fields': ('manufacturing_date', 'expiry_date')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )

@admin.register(MedicinePrescription)
class MedicinePrescriptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'appointment', 'medicine', 'dosage', 'frequency', 'duration', 'is_active']
    list_filter = ['is_active']
    search_fields = ['appointment__patient__patient_name', 'medicine__medicine_name']
    raw_id_fields = ['medicine', 'appointment']
    list_per_page = 20

@admin.register(LabTestCategory)
class LabTestCategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'category_name']
    search_fields = ['category_name']
    list_per_page = 20

@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):
    list_display = ['id', 'test_name', 'category', 'amount', 'sample_required', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['test_name']
    list_editable = ['amount', 'is_active']
    list_per_page = 20
    fieldsets = (
        ('Test Information', {
            'fields': ('test_name', 'category', 'amount', 'sample_required')
        }),
        ('Reference Range', {
            'fields': ('reference_min_range', 'reference_max_range')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )

@admin.register(LabTestPrescription)
class LabTestPrescriptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'appointment', 'lab_test', 'lab_test_value', 'created_date', 'is_active']
    list_filter = ['is_active', 'created_date']
    search_fields = ['appointment__patient__patient_name', 'lab_test__test_name']
    readonly_fields = ['created_date']
    raw_id_fields = ['lab_test', 'appointment']
    list_per_page = 20

@admin.register(MedicineStock)
class MedicineStockAdmin(admin.ModelAdmin):
    list_display = ['id', 'medicine', 'stock_in_hand', 're_order_level', 'purchase', 'issuance', 'created_date']
    list_filter = ['re_order_level', 'is_active']
    search_fields = ['medicine__medicine_name']
    readonly_fields = ['created_date']
    raw_id_fields = ['medicine']
    list_per_page = 20
    fieldsets = (
        ('Medicine', {
            'fields': ('medicine',)
        }),
        ('Stock Information', {
            'fields': ('stock_in_hand', 're_order_level', 'purchase', 'issuance')
        }),
        ('Status', {
            'fields': ('is_active', 'created_date')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('medicine')