from rest_framework import viewsets, status
# pyrefly: ignore [missing-import]
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum
from django.db.models import Max
from django.db.models.functions import TruncDate
from decimal import Decimal
from .models import (
    Role, Staff, Specialization, Doctor, Membership, Patient,
    Appointment, Consultation, MedicineCategory, Medicine,
    MedicinePrescription, LabTestCategory, LabTest,
    LabTestPrescription, MedicineStock, Bill
)
from .serializers import (
    RoleSerializer, StaffSerializer, SpecializationSerializer, DoctorSerializer,
    MembershipSerializer, PatientSerializer, AppointmentSerializer,
    ConsultationSerializer, MedicineCategorySerializer, MedicineSerializer,
    MedicinePrescriptionSerializer, LabTestCategorySerializer, LabTestSerializer,
    LabTestPrescriptionSerializer, MedicineStockSerializer
)

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

    @action(detail=True, methods=['patch'])
    def deactivate(self, request, pk=None):
        role = self.get_object()
        role.is_active = False
        role.save()
        return Response({"message": "Role deactivated successfully"})

class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer

    @action(detail=True, methods=['patch'])
    def deactivate(self, request, pk=None):
        staff = self.get_object()
        staff.is_active = False
        staff.save()
        return Response({"message": "Staff deactivated successfully"})

class SpecializationViewSet(viewsets.ModelViewSet):
    queryset = Specialization.objects.all()
    serializer_class = SpecializationSerializer

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

    @action(detail=True, methods=['patch'])
    def deactivate(self, request, pk=None):
        doctor = self.get_object()
        doctor.is_active = False
        doctor.save()
        return Response({"message": "Doctor deactivated successfully"})

class MembershipViewSet(viewsets.ModelViewSet):
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

    @action(detail=True, methods=['patch'])
    def deactivate(self, request, pk=None):
        patient = self.get_object()
        patient.is_active = False
        patient.save()
        return Response({"message": "Patient deactivated successfully"})

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        if not data.get('token_number'):
            next_token = (Appointment.objects.aggregate(max_token=Max('token_number'))['max_token'] or 0) + 1
            data['token_number'] = next_token

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        appointment.consultation_status = 'Cancelled'
        appointment.save()
        return Response({"message": "Appointment cancelled successfully"})

    def get_queryset(self):
        queryset = Appointment.objects.all()
        date = self.request.query_params.get('date', None)
        status_param = self.request.query_params.get('status', None)
        if date is not None:
            queryset = queryset.filter(appointment_date__date=date)
        if status_param is not None:
            queryset = queryset.filter(consultation_status=status_param)
        return queryset

    @action(detail=False, methods=['get'], url_path='patient/(?P<patient_id>[^/.]+)')
    def by_patient(self, request, patient_id=None):
        appointments = self.queryset.filter(patient_id=patient_id)
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='doctor/(?P<doctor_id>[^/.]+)')
    def by_doctor(self, request, doctor_id=None):
        appointments = self.queryset.filter(doctor_id=doctor_id).order_by('token_number', 'appointment_date')
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)


class ConsultationViewSet(viewsets.ModelViewSet):
    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer

    @action(detail=False, methods=['get'], url_path='appointment/(?P<appointment_id>[^/.]+)')
    def by_appointment(self, request, appointment_id=None):
        consultation = self.queryset.filter(appointment_id=appointment_id).first()
        if consultation:
            serializer = self.get_serializer(consultation)
            return Response(serializer.data)
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='doctor/(?P<doctor_id>[^/.]+)')
    def by_doctor(self, request, doctor_id=None):
        consultations = self.queryset.filter(appointment__doctor_id=doctor_id)
        serializer = self.get_serializer(consultations, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'], url_path='patient/(?P<patient_id>[^/.]+)')
    def by_patient(self, request, patient_id=None):
        consultations = self.queryset.filter(appointment__patient_id=patient_id)
        serializer = self.get_serializer(consultations, many=True)
        return Response(serializer.data)


class MedicineCategoryViewSet(viewsets.ModelViewSet):
    queryset = MedicineCategory.objects.all()
    serializer_class = MedicineCategorySerializer

class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer

    @action(detail=True, methods=['patch'])
    def deactivate(self, request, pk=None):
        medicine = self.get_object()
        medicine.is_active = False
        medicine.save()
        return Response({"message": "Medicine deactivated successfully"})


class MedicinePrescriptionViewSet(viewsets.ModelViewSet):
    queryset = MedicinePrescription.objects.all()
    serializer_class = MedicinePrescriptionSerializer

    @action(detail=False, methods=['get'], url_path='appointment/(?P<appointment_id>[^/.]+)')
    def by_appointment(self, request, appointment_id=None):
        prescriptions = self.queryset.filter(appointment_id=appointment_id)
        serializer = self.get_serializer(prescriptions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='patient/(?P<patient_id>[^/.]+)')
    def by_patient(self, request, patient_id=None):
        prescriptions = self.queryset.filter(appointment__patient_id=patient_id)
        serializer = self.get_serializer(prescriptions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def dispense(self, request, pk=None):
        try:
            prescription = self.get_object()
            if prescription.is_dispensed:
                return Response({"error": "Prescription already dispensed"}, status=status.HTTP_400_BAD_REQUEST)

            # Update Stock gracefully
            stock, created = MedicineStock.objects.get_or_create(
                medicine=prescription.medicine,
                defaults={'stock_in_hand': 0, 're_order_level': 5, 'purchase': 0, 'issuance': 0}
            )
            # Calculate quantity based on frequency and duration
            frequency_str = str(prescription.frequency or '').strip()
            duration_str = str(prescription.duration or '').strip()
            
            per_day = 1
            if '-' in frequency_str:
                parts = frequency_str.split('-')
                try:
                    per_day = sum([int(p) for p in parts if p.strip().isdigit()])
                except ValueError:
                    pass
            else:
                try:
                    nums = ''.join(filter(str.isdigit, frequency_str))
                    if nums:
                        per_day = int(nums)
                except ValueError:
                    pass
            if per_day <= 0: per_day = 1

            try:
                nums = ''.join(filter(str.isdigit, duration_str))
                days = int(nums) if nums else 1
            except ValueError:
                days = 1
            if days <= 0: days = 1

            total_quantity = per_day * days

            if stock.stock_in_hand < total_quantity:
                return Response({"error": f"Insufficient stock. Need {total_quantity}, but only {stock.stock_in_hand} available for {prescription.medicine.medicine_name}."}, status=status.HTTP_400_BAD_REQUEST)
                
            stock.stock_in_hand -= total_quantity
            stock.issuance += total_quantity
            stock.save()

            # Update Prescription status
            prescription.is_dispensed = True
            prescription.save()

            # Generate or update Bill
            bill, created = Bill.objects.get_or_create(appointment=prescription.appointment)
            bill.total_amount = Decimal(str(bill.total_amount or 0)) + (
                Decimal(str(prescription.medicine.unit_price or 0)) * Decimal(str(total_quantity))
            )
            bill.save()

            return Response({"message": f"Medicine dispensed successfully ({total_quantity} units)", "bill_id": bill.id, "total_amount": bill.total_amount})
        except Exception as e:
            import traceback
            return Response({"error": f"Server Error: {str(e)} | Trace: {traceback.format_exc()}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LabTestCategoryViewSet(viewsets.ModelViewSet):
    queryset = LabTestCategory.objects.all()
    serializer_class = LabTestCategorySerializer

class LabTestViewSet(viewsets.ModelViewSet):
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer

    @action(detail=True, methods=['patch'])
    def deactivate(self, request, pk=None):
        lab_test = self.get_object()
        lab_test.is_active = False
        lab_test.save()
        return Response({"message": "Lab test deactivated successfully"})

class LabTestPrescriptionViewSet(viewsets.ModelViewSet):
    queryset = LabTestPrescription.objects.all()
    serializer_class = LabTestPrescriptionSerializer

    @action(detail=True, methods=['patch'])
    def deactivate(self, request, pk=None):
        prescription = self.get_object()
        prescription.is_active = False
        prescription.save()
        return Response({"message": "Lab test prescription deactivated successfully"})

    @action(detail=False, methods=['get'], url_path='appointment/(?P<appointment_id>[^/.]+)')
    def by_appointment(self, request, appointment_id=None):
        prescriptions = self.queryset.filter(appointment_id=appointment_id)
        serializer = self.get_serializer(prescriptions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def evaluate(self, request, pk=None):
        prescription = self.get_object()
        lab_test_value = request.data.get('lab_test_value')
        remarks = request.data.get('remarks', '')

        if not lab_test_value:
            return Response({"error": "Lab test value is required"}, status=status.HTTP_400_BAD_REQUEST)

        if prescription.lab_test_value:
            return Response({"error": "Lab test already evaluated"}, status=status.HTTP_400_BAD_REQUEST)

        prescription.lab_test_value = lab_test_value
        prescription.remarks = remarks
        prescription.save()

        # Generate or update Bill
        bill, created = Bill.objects.get_or_create(appointment=prescription.appointment)
        bill.total_amount = Decimal(str(bill.total_amount or 0)) + Decimal(str(prescription.lab_test.amount or 0))
        bill.save()

        return Response({"message": "Lab test evaluated successfully", "bill_id": bill.id, "total_amount": bill.total_amount})

    @action(detail=False, methods=['get'], url_path='patient/(?P<patient_id>[^/.]+)')
    def by_patient(self, request, patient_id=None):
        prescriptions = self.queryset.filter(appointment__patient_id=patient_id)
        serializer = self.get_serializer(prescriptions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='doctor/(?P<doctor_id>[^/.]+)')
    def by_doctor(self, request, doctor_id=None):
        prescriptions = self.queryset.filter(appointment__doctor_id=doctor_id).order_by('-created_date')
        serializer = self.get_serializer(prescriptions, many=True)
        return Response(serializer.data)

class MedicineStockViewSet(viewsets.ModelViewSet):
    queryset = MedicineStock.objects.all()
    serializer_class = MedicineStockSerializer

    @action(detail=True, methods=['patch'], url_path='flag-low')
    def flag_low(self, request, pk=None):
        stock = self.get_object()
        return Response({"message": "Inventory flagged as low stock"})

@api_view(['POST'])
def staff_login(request):
    username = (request.data.get('username') or '').strip()
    password = (request.data.get('password') or '').strip()
    role_name = (request.data.get('role') or '').strip()

    if not username or not password or not role_name:
        return Response({'error': 'Please provide username, password, and role'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Note: In a real app password should be hashed. Using plain text for simple demo setup.
        staff = Staff.objects.get(username=username, password=password, role__role_name=role_name)
        if not staff.is_active:
            return Response({'error': 'Account is inactive'}, status=status.HTTP_401_UNAUTHORIZED)
            
        return Response({
            'id': staff.id,
            'name': staff.full_name,
            'username': staff.username,
            'role': staff.role.role_name
        })
    except Staff.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def dashboard_stats(request):
    try:
        all_appointments = Appointment.objects.all()
        all_bills = Bill.objects.all()

        data_map = {}

        for appt in all_appointments:
            # appointment_date might be string if not parsed properly, handle it
            if isinstance(appt.appointment_date, str):
                date_str = appt.appointment_date[:10]
            elif appt.appointment_date:
                date_str = appt.appointment_date.strftime('%Y-%m-%d')
            else:
                date_str = 'Unknown'

            if date_str not in data_map:
                data_map[date_str] = {'date': date_str, 'patients': 0, 'revenue': 0}
            data_map[date_str]['patients'] += 1

        for bill in all_bills:
            if isinstance(bill.created_date, str):
                date_str = bill.created_date[:10]
            elif bill.created_date:
                date_str = bill.created_date.strftime('%Y-%m-%d')
            else:
                date_str = 'Unknown'

            if date_str not in data_map:
                data_map[date_str] = {'date': date_str, 'patients': 0, 'revenue': 0}
            data_map[date_str]['revenue'] += float(bill.total_amount)

        chart_data = sorted(data_map.values(), key=lambda x: x['date'])
        return Response(chart_data)
    except Exception as e:
        import traceback
        return Response({"error": str(e), "trace": traceback.format_exc()}, status=500)
