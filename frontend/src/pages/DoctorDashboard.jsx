import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import {
    Calendar,
    Clock,
    FileText,
    Pill,
    Microscope,
    History,
    Plus,
    Save,
    X,
    ChevronRight,
    ClipboardList
} from 'lucide-react';

const formatDateTime12Hour = value =>
    value
        ? new Intl.DateTimeFormat('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
              hour12: true
          }).format(new Date(value))
        : '-';

const DoctorDashboard = () => {
    const { user } = useAuth();

    const [appointments, setAppointments] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [labTests, setLabTests] = useState([]);

    const [activeTab, setActiveTab] = useState('Today');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [consultationTab, setConsultationTab] = useState('Notes');

    const [consultation, setConsultation] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [labTestPrescriptions, setLabTestPrescriptions] = useState([]);
    const [prescriptionError, setPrescriptionError] = useState('');
    const [prescriptionSuccess, setPrescriptionSuccess] = useState('');

    const [patientHistory, setPatientHistory] = useState({
        appointments: [],
        consultations: [],
        prescriptions: [],
        labTests: []
    });

    const [consultationForm, setConsultationForm] = useState({
        symptoms: '',
        diagnosis: '',
        notes: ''
    });

    const [prescriptionForm, setPrescriptionForm] = useState({
        medicine: '',
        dosage: '',
        frequency: '',
        duration: ''
    });

    const [labForm, setLabForm] = useState({
        lab_test: '',
        remarks: ''
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const docsRes = await api.get('doctors/');
                const currentDoc = docsRes.data.find(
                    d =>
                        String(d.staff) === String(user.id) ||
                        String(d.staff_details?.id) === String(user.id)
                );

                if (currentDoc) {
                    const [apptsRes, medsRes] = await Promise.all([
                        api.get(`appointments/doctor/${currentDoc.id}/`),
                        api.get('medicines/')
                    ]);

                    const labTestsRes = await api.get('labtests/');

                    const sortedAppts = apptsRes.data.sort(
                        (a, b) =>
                            (a.token_number || 0) - (b.token_number || 0) ||
                            new Date(a.appointment_date) -
                            new Date(b.appointment_date)
                    );

                    setAppointments(sortedAppts);
                    setMedicines(medsRes.data.filter(m => m.is_active));
                    setLabTests(labTestsRes.data.filter(t => t.is_active));
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchInitialData();
    }, [user]);

    const openConsultation = async appt => {
        setSelectedAppointment(appt);
        setConsultationTab('Notes');

        try {
            try {
                const consRes = await api.get(
                    `consultations/appointment/${appt.id}/`
                );

                if (consRes.data && !consRes.data.error) {
                    setConsultation(consRes.data);

                    setConsultationForm({
                        symptoms: consRes.data.symptoms,
                        diagnosis: consRes.data.diagnosis,
                        notes: consRes.data.notes
                    });
                }
            } catch {
                setConsultation(null);
            }

            const [presRes, labRes] = await Promise.all([
                api.get(`prescriptions/medicine/appointment/${appt.id}/`),
                api.get(`prescriptions/labtest/appointment/${appt.id}/`)
            ]);

            setPrescriptions(presRes.data);
            setLabTestPrescriptions(labRes.data);

            const [histAppts, histCons, histPres, histLab] = await Promise.all([
                api.get(`appointments/patient/${appt.patient}/`),
                api.get(`consultations/patient/${appt.patient}/`),
                api.get(`prescriptions/medicine/patient/${appt.patient}/`),
                api.get(`prescriptions/labtest/patient/${appt.patient}/`)
            ]);

            setPatientHistory({
                appointments: histAppts.data
                    .filter(
                    previousAppt => previousAppt.id !== appt.id
                    )
                    .sort(
                        (a, b) =>
                            new Date(b.appointment_date) -
                            new Date(a.appointment_date)
                    ),
                consultations: histCons.data
                    .filter(
                    c => c.appointment !== appt.id
                    )
                    .sort(
                        (a, b) =>
                            new Date(b.created_date) -
                            new Date(a.created_date)
                    ),
                prescriptions: histPres.data
                    .filter(
                    p => p.appointment !== appt.id
                    )
                    .sort(
                        (a, b) =>
                            new Date(b.created_date) -
                            new Date(a.created_date)
                    ),
                labTests: histLab.data
                    .filter(
                    l => l.appointment !== appt.id
                    )
                    .sort(
                        (a, b) =>
                            new Date(b.created_date) -
                            new Date(a.created_date)
                    )
            });
        } catch (err) {
            console.error(err);
        }
    };

    const saveConsultation = async e => {
        e.preventDefault();

        try {
            if (consultation) {
                const res = await api.patch(
                    `consultations/${consultation.id}/`,
                    consultationForm
                );

                setConsultation(res.data);
            } else {
                const payload = {
                    ...consultationForm,
                    appointment: selectedAppointment.id
                };

                const res = await api.post('consultations/', payload);

                setConsultation(res.data);

                await api.patch(
                    `appointments/${selectedAppointment.id}/`,
                    { consultation_status: 'Completed' }
                );
            }

            alert('Consultation saved successfully!');
        } catch (err) {
            console.error(err);
        }
    };

    const addPrescription = async e => {
        e.preventDefault();
        setPrescriptionError('');
        setPrescriptionSuccess('');

        try {
            const payload = {
                ...prescriptionForm,
                appointment: selectedAppointment.id
            };

            const res = await api.post(
                'prescriptions/medicine/',
                payload
            );

            setPrescriptions([...prescriptions, res.data]);

            setPrescriptionForm({
                medicine: '',
                dosage: '',
                frequency: '',
                duration: ''
            });

            setPrescriptionSuccess('Prescription added successfully.');
        } catch (err) {
            console.error(err);
            setPrescriptionError(
                err.response?.data?.error ||
                    'Failed to add prescription. Please complete all fields.'
            );
        }
    };

    const addLabTest = async e => {
        e.preventDefault();

        try {
            const payload = {
                ...labForm,
                appointment: selectedAppointment.id
            };

            const res = await api.post('prescriptions/labtest/', payload);

            setLabTestPrescriptions([...labTestPrescriptions, res.data]);
            setLabForm({ lab_test: '', remarks: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const todayAppointments = appointments.filter(a => {
        const apptDate = new Date(a.appointment_date);
        const today = new Date();

        return (
            apptDate.getDate() === today.getDate() &&
            apptDate.getMonth() === today.getMonth() &&
            apptDate.getFullYear() === today.getFullYear()
        );
    });

    const displayedAppointments =
        activeTab === 'Today'
            ? todayAppointments
            : appointments;

    const cardStyle = {
        background: 'var(--surface)',
        borderRadius: '24px',
        padding: '24px',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
    };

    const inputStyle = {
        width: '100%',
        padding: '14px',
        borderRadius: '14px',
        border: '1px solid var(--border)',
        outline: 'none',
        fontSize: '15px',
        marginTop: '8px',
        background: 'var(--background)',
        color: 'var(--text-main)'
    };

    const buttonPrimary = {
        background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
        color: 'white',
        border: 'none',
        padding: '14px 20px',
        borderRadius: '14px',
        cursor: 'pointer',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };

    return (
        <div
            style={{
                background: 'var(--background)',
                minHeight: '100vh',
                padding: '30px'
            }}
        >
            {!selectedAppointment ? (
                <>
                    {/* HEADER */}

                    <div
                        style={{
                            background:
                                'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                            borderRadius: '30px',
                            padding: '40px',
                            color: 'white',
                            marginBottom: '30px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        }}
                    >
                        <div>
                            <h1
                                style={{
                                    fontSize: '42px',
                                    marginBottom: '10px',
                                    fontWeight: '800'
                                }}
                            >
                                Dashboard
                            </h1>

                            <p
                                style={{
                                    opacity: 0.9,
                                    fontSize: '17px'
                                }}
                            >
                                Welcome back Dr. {user.username}
                            </p>
                        </div>

                        <div
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                padding: '24px',
                                borderRadius: '24px',
                                textAlign: 'center',
                                backdropFilter: 'blur(8px)'
                            }}
                        >
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: '50px'
                                }}
                            >
                                {todayAppointments.length}
                            </h2>

                            <p style={{ marginTop: '10px' }}>
                                Today's Appointments
                            </p>
                        </div>
                    </div>

                    {/* TOP BUTTONS */}

                    <div
                        style={{
                            display: 'flex',
                            gap: '16px',
                            marginBottom: '30px'
                        }}
                    >
                        <button
                            onClick={() =>
                                setActiveTab('Today')
                            }
                            style={{
                                ...buttonPrimary,
                                background:
                                    activeTab === 'Today'
                                        ? 'linear-gradient(135deg, var(--primary), var(--primary-hover))'
                                        : 'var(--surface)',
                                color:
                                    activeTab === 'Today'
                                        ? '#fff'
                                        : 'var(--text-main)',
                                border:
                                    activeTab !== 'Today'
                                        ? '1px solid var(--border)'
                                        : 'none'
                            }}
                        >
                            <Calendar size={18} />
                            Today
                        </button>

                        <button
                            onClick={() =>
                                setActiveTab('History')
                            }
                            style={{
                                ...buttonPrimary,
                                background:
                                    activeTab === 'History'
                                        ? 'linear-gradient(135deg, var(--primary), var(--primary-hover))'
                                        : 'var(--surface)',
                                color:
                                    activeTab === 'History'
                                        ? '#fff'
                                        : 'var(--text-main)',
                                border:
                                    activeTab !== 'History'
                                        ? '1px solid var(--border)'
                                        : 'none'
                            }}
                        >
                            <History size={18} />
                            History
                        </button>
                    </div>

                    {/* APPOINTMENT CARDS */}

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit,minmax(340px,1fr))',
                            gap: '24px'
                        }}
                    >
                        {displayedAppointments.map(appt => (
                            <div
                                key={appt.id}
                                onClick={() =>
                                    openConsultation(appt)
                                }
                                style={{
                                    ...cardStyle,
                                    cursor: 'pointer',
                                    transition: '0.3s'
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent:
                                            'space-between',
                                        marginBottom: '20px'
                                    }}
                                >
                                    <div
                                        style={{
                                            background:
                                                'rgba(5,150,105,0.12)',
                                            padding:
                                                '8px 14px',
                                            borderRadius:
                                                '12px',
                                            color: 'var(--primary)',
                                            fontWeight:
                                                '600',
                                            display:
                                                'flex',
                                            alignItems:
                                                'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <Clock size={16} />

                                        {formatDateTime12Hour(
                                            appt.appointment_date
                                        )}
                                    </div>

                                    <div
                                        style={{
                                            background: 'rgba(5,150,105,0.16)',
                                            color: 'var(--primary)',
                                            padding:
                                                '8px 14px',
                                            borderRadius:
                                                '12px',
                                            fontWeight:
                                                '600'
                                        }}
                                    >
                                        #{appt.token_number}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '18px',
                                        alignItems:
                                            'center'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius:
                                                '20px',
                                            background:
                                                'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                                            color: 'white',
                                            display:
                                                'flex',
                                            alignItems:
                                                'center',
                                            justifyContent:
                                                'center',
                                            fontSize:
                                                '22px',
                                            fontWeight:
                                                '700'
                                        }}
                                    >
                                        {appt.patient_details?.patient_name.charAt(
                                            0
                                        )}
                                    </div>

                                    <div>
                                        <h3
                                            style={{
                                                margin: 0,
                                                color:
                                                    'var(--text-main)'
                                            }}
                                        >
                                            {
                                                appt
                                                    .patient_details
                                                    ?.patient_name
                                            }
                                        </h3>

                                        <p
                                            style={{
                                                marginTop:
                                                    '8px',
                                                color:
                                                    'var(--text-muted)'
                                            }}
                                        >
                                            {
                                                appt.consultation_status
                                            }
                                        </p>
                                    </div>
                                </div>

                                <button
                                    style={{
                                        ...buttonPrimary,
                                        width: '100%',
                                        marginTop:
                                            '24px',
                                        justifyContent:
                                            'center'
                                    }}
                                >
                                    Open Consultation
                                    <ChevronRight
                                        size={18}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div
                    style={{
                        display: 'flex',
                        gap: '24px'
                    }}
                >
                    {/* SIDEBAR */}

                    <div
                        style={{
                            width: '280px',
                            ...cardStyle,
                            height: 'fit-content'
                        }}
                    >
                        <div
                            style={{
                                textAlign: 'center',
                                marginBottom: '30px'
                            }}
                        >
                            <div
                                style={{
                                    width: '90px',
                                    height: '90px',
                                    borderRadius:
                                        '30px',
                                    background:
                                        'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                                    margin: '0 auto',
                                    display: 'flex',
                                    alignItems:
                                        'center',
                                    justifyContent:
                                        'center',
                                    color: 'white',
                                    fontSize: '30px',
                                    fontWeight:
                                        'bold'
                                }}
                            >
                                {selectedAppointment.patient_details?.patient_name.charAt(
                                    0
                                )}
                            </div>

                            <h2
                                style={{
                                    marginTop: '20px'
                                }}
                            >
                                {
                                    selectedAppointment
                                        .patient_details
                                        ?.patient_name
                                }
                            </h2>

                            <p
                                style={{
                                    color: 'var(--text-muted)'
                                }}
                            >
                                Token #
                                {
                                    selectedAppointment.token_number
                                }
                            </p>
                        </div>

                        {[
                            {
                                id: 'Notes',
                                icon: FileText,
                                label: 'Notes'
                            },
                            {
                                id: 'Prescriptions',
                                icon: Pill,
                                label: 'Prescription'
                            },
                            {
                                id: 'LabTests',
                                icon: Microscope,
                                label: 'Lab Tests'
                            },
                            {
                                id: 'History',
                                icon: History,
                                label: 'History'
                            }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() =>
                                    setConsultationTab(tab.id)
                                }
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '16px 18px',
                                    border: 'none',
                                    borderRadius: '14px',
                                    marginBottom: '12px',
                                    cursor: 'pointer',
                                    background:
                                        consultationTab === tab.id
                                            ? 'rgba(5,150,105,0.12)'
                                            : 'transparent',
                                    color:
                                        consultationTab === tab.id
                                            ? 'var(--primary)'
                                            : 'var(--text-main)',
                                    fontWeight: '600'
                                }}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}

                        <button
                            onClick={() => setSelectedAppointment(null)}
                            style={{
                                ...buttonPrimary,
                                background: '#ef4444',
                                width: '100%',
                                justifyContent: 'center',
                                marginTop: '20px'
                            }}
                        >
                            <X size={18} />
                            Close
                        </button>
                    </div>

                    {/* CONTENT */}

                    <div
                        style={{
                            flex: 1,
                            ...cardStyle
                        }}
                    >
                        {/* NOTES */}

                        {consultationTab ===
                            'Notes' && (
                            <>
                                <h2
                                    style={{
                                        marginBottom:
                                            '30px',
                                        display:
                                            'flex',
                                        alignItems:
                                            'center',
                                        gap: '12px'
                                    }}
                                >
                                    <ClipboardList />
                                    Clinical Notes
                                </h2>

                                <form
                                    onSubmit={
                                        saveConsultation
                                    }
                                >
                                    <div
                                        style={{
                                            marginBottom:
                                                '24px'
                                        }}
                                    >
                                        <label>
                                            Symptoms
                                        </label>

                                        <textarea
                                            rows="4"
                                            style={
                                                inputStyle
                                            }
                                            value={
                                                consultationForm.symptoms
                                            }
                                            onChange={e =>
                                                setConsultationForm(
                                                    {
                                                        ...consultationForm,
                                                        symptoms:
                                                            e
                                                                .target
                                                                .value
                                                    }
                                                )
                                            }
                                        />
                                    </div>

                                    <div
                                        style={{
                                            marginBottom:
                                                '24px'
                                        }}
                                    >
                                        <label>
                                            Diagnosis
                                        </label>

                                        <textarea
                                            rows="4"
                                            style={
                                                inputStyle
                                            }
                                            value={
                                                consultationForm.diagnosis
                                            }
                                            onChange={e =>
                                                setConsultationForm(
                                                    {
                                                        ...consultationForm,
                                                        diagnosis:
                                                            e
                                                                .target
                                                                .value
                                                    }
                                                )
                                            }
                                        />
                                    </div>

                                    <div
                                        style={{
                                            marginBottom:
                                                '24px'
                                        }}
                                    >
                                        <label>
                                            Notes
                                        </label>

                                        <textarea
                                            rows="4"
                                            style={
                                                inputStyle
                                            }
                                            value={
                                                consultationForm.notes
                                            }
                                            onChange={e =>
                                                setConsultationForm(
                                                    {
                                                        ...consultationForm,
                                                        notes:
                                                            e
                                                                .target
                                                                .value
                                                    }
                                                )
                                            }
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        style={
                                            buttonPrimary
                                        }
                                    >
                                        <Save
                                            size={18}
                                        />
                                        Save Consultation
                                    </button>
                                </form>
                            </>
                        )}

                        {/* PRESCRIPTION */}

                        {consultationTab ===
                            'Prescriptions' && (
                            <>
                                <h2
                                    style={{
                                        marginBottom:
                                            '30px'
                                    }}
                                >
                                    Prescriptions
                                </h2>

                                <form
                                    onSubmit={
                                        addPrescription
                                    }
                                    style={{
                                        display:
                                            'grid',
                                        gridTemplateColumns:
                                            'repeat(auto-fit,minmax(200px,1fr))',
                                        gap: '18px',
                                        marginBottom:
                                            '30px'
                                    }}
                                >
                                    <select
                                        style={
                                            inputStyle
                                        }
                                        value={
                                            prescriptionForm.medicine
                                        }
                                        required
                                        onChange={e =>
                                            setPrescriptionForm(
                                                {
                                                    ...prescriptionForm,
                                                    medicine:
                                                        e
                                                            .target
                                                            .value
                                                }
                                            )
                                        }
                                    >
                                        <option value="">
                                            Select
                                            Medicine
                                        </option>

                                        {medicines.map(
                                            m => (
                                                <option
                                                    key={
                                                        m.id
                                                    }
                                                    value={
                                                        m.id
                                                    }
                                                >
                                                    {
                                                        m.medicine_name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>

                                    <input
                                        placeholder="Dosage"
                                        style={
                                            inputStyle
                                        }
                                        value={
                                            prescriptionForm.dosage
                                        }
                                        required
                                        onChange={e =>
                                            setPrescriptionForm(
                                                {
                                                    ...prescriptionForm,
                                                    dosage:
                                                        e
                                                            .target
                                                            .value
                                                }
                                            )
                                        }
                                    />

                                    <input
                                        placeholder="Frequency"
                                        style={
                                            inputStyle
                                        }
                                        value={
                                            prescriptionForm.frequency
                                        }
                                        required
                                        onChange={e =>
                                            setPrescriptionForm(
                                                {
                                                    ...prescriptionForm,
                                                    frequency:
                                                        e
                                                            .target
                                                            .value
                                                }
                                            )
                                        }
                                    />

                                    <input
                                        placeholder="Duration"
                                        style={
                                            inputStyle
                                        }
                                        value={
                                            prescriptionForm.duration
                                        }
                                        required
                                        onChange={e =>
                                            setPrescriptionForm(
                                                {
                                                    ...prescriptionForm,
                                                    duration:
                                                        e
                                                            .target
                                                            .value
                                                }
                                            )
                                        }
                                    />

                                    <button
                                        type="submit"
                                        style={
                                            buttonPrimary
                                        }
                                    >
                                        <Plus
                                            size={18}
                                        />
                                        Add
                                    </button>
                                </form>

                                {prescriptionError && (
                                    <div style={{ marginBottom: '18px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.18)' }}>
                                        {prescriptionError}
                                    </div>
                                )}

                                {prescriptionSuccess && (
                                    <div style={{ marginBottom: '18px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(16,185,129,0.08)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.18)' }}>
                                        {prescriptionSuccess}
                                    </div>
                                )}

                                {prescriptions.map(
                                    p => (
                                        <div
                                            key={
                                                p.id
                                            }
                                            style={{
                                                padding:
                                                    '18px',
                                                border:
                                                    '1px solid var(--border)',
                                                borderRadius:
                                                    '16px',
                                                marginBottom:
                                                    '14px'
                                            }}
                                        >
                                            <h4>
                                                {
                                                    p
                                                        .medicine_details
                                                        ?.medicine_name
                                                }
                                            </h4>

                                            <p>
                                                {
                                                    p.dosage
                                                }{' '}
                                                •{' '}
                                                {
                                                    p.frequency
                                                }{' '}
                                                •{' '}
                                                {
                                                    p.duration
                                                }
                                            </p>
                                        </div>
                                    )
                                )}
                            </>
                        )}

                        {/* LAB TEST */}

                        {consultationTab ===
                            'LabTests' && (
                            <>
                                <h2
                                    style={{
                                        marginBottom:
                                            '30px'
                                    }}
                                >
                                    Lab Tests
                                </h2>

                                <form
                                    onSubmit={addLabTest}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns:
                                            'repeat(auto-fit,minmax(220px,1fr))',
                                        gap: '18px',
                                        marginBottom: '30px'
                                    }}
                                >
                                    <select
                                        style={inputStyle}
                                        value={labForm.lab_test}
                                        onChange={e =>
                                            setLabForm({
                                                ...labForm,
                                                lab_test: e.target.value
                                            })
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select Lab Test
                                        </option>

                                        {labTests.map(t => (
                                            <option key={t.id} value={t.id}>
                                                {t.test_name}
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        placeholder="Remarks"
                                        style={inputStyle}
                                        value={labForm.remarks}
                                        onChange={e =>
                                            setLabForm({
                                                ...labForm,
                                                remarks: e.target.value
                                            })
                                        }
                                    />

                                    <button
                                        type="submit"
                                        style={buttonPrimary}
                                    >
                                        <Plus size={18} />
                                        Send to Lab Technician
                                    </button>
                                </form>

                                {labTestPrescriptions.map(
                                    l => (
                                        <div
                                            key={
                                                l.id
                                            }
                                            style={{
                                                padding:
                                                    '18px',
                                                border:
                                                    '1px solid var(--border)',
                                                borderRadius:
                                                    '16px',
                                                marginBottom:
                                                    '14px'
                                            }}
                                        >
                                            <h4>
                                                {
                                                    l
                                                        .lab_test_details
                                                        ?.test_name
                                                }
                                            </h4>

                                            <p>
                                                {l.lab_test_value
                                                    ? `Result: ${l.lab_test_value}`
                                                    : 'Pending evaluation'}
                                            </p>

                                            <p>
                                                {l.remarks ||
                                                    'No remarks'}
                                            </p>
                                        </div>
                                    )
                                )}
                            </>
                        )}

                        {/* HISTORY */}

                        {consultationTab ===
                            'History' && (
                            <>
                                <h2
                                    style={{
                                        marginBottom:
                                            '30px'
                                    }}
                                >
                                    Patient History
                                </h2>

                                <div style={{ display: 'grid', gap: '24px' }}>
                                    <div>
                                        <h3 style={{ marginBottom: '14px', color: 'var(--primary)' }}>
                                            Previous Appointments
                                        </h3>

                                        {patientHistory.appointments.length === 0 ? (
                                            <div style={{ padding: '18px', border: '1px dashed var(--border)', borderRadius: '16px', color: 'var(--text-muted)' }}>
                                                No previous appointments found.
                                            </div>
                                        ) : patientHistory.appointments.map(a => (
                                            <div
                                                key={a.id}
                                                style={{
                                                    padding: '20px',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '16px',
                                                    marginBottom: '18px'
                                                }}
                                            >
                                                <h4 style={{ marginBottom: '8px' }}>
                                                    {formatDateTime12Hour(a.appointment_date)}
                                                </h4>
                                                <p style={{ margin: 0 }}>
                                                    <strong>Token:</strong> #{a.token_number}
                                                </p>
                                                <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)' }}>
                                                    <strong>Status:</strong> {a.consultation_status}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <h3 style={{ marginBottom: '14px', color: 'var(--primary)' }}>
                                            Consultations
                                        </h3>

                                        {patientHistory.consultations.length === 0 ? (
                                            <div style={{ padding: '18px', border: '1px dashed var(--border)', borderRadius: '16px', color: 'var(--text-muted)' }}>
                                                No past consultations found.
                                            </div>
                                        ) : patientHistory.consultations.map(c => (
                                            <div
                                                key={c.id}
                                                style={{
                                                    padding: '24px',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '18px',
                                                    marginBottom: '18px'
                                                }}
                                            >
                                                <h4>
                                                    {new Date(c.created_date).toLocaleDateString()}
                                                </h4>

                                                <p>
                                                    <strong>Symptoms:</strong>{' '}
                                                    {c.symptoms}
                                                </p>

                                                <p>
                                                    <strong>Diagnosis:</strong>{' '}
                                                    {c.diagnosis}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <h3 style={{ marginBottom: '14px', color: 'var(--primary)' }}>
                                            Prescriptions
                                        </h3>

                                        {patientHistory.prescriptions.length === 0 ? (
                                            <div style={{ padding: '18px', border: '1px dashed var(--border)', borderRadius: '16px', color: 'var(--text-muted)' }}>
                                                No medicine prescriptions found.
                                            </div>
                                        ) : patientHistory.prescriptions.map(p => (
                                            <div
                                                key={p.id}
                                                style={{
                                                    padding: '20px',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '16px',
                                                    marginBottom: '18px'
                                                }}
                                            >
                                                <h4>
                                                    {p.medicine_details?.medicine_name}
                                                </h4>
                                                <p style={{ margin: 0 }}>
                                                    {p.dosage} • {p.frequency} • {p.duration}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <h3 style={{ marginBottom: '14px', color: 'var(--primary)' }}>
                                            Lab Tests
                                        </h3>

                                        {patientHistory.labTests.length === 0 ? (
                                            <div style={{ padding: '18px', border: '1px dashed var(--border)', borderRadius: '16px', color: 'var(--text-muted)' }}>
                                                No lab test history found.
                                            </div>
                                        ) : patientHistory.labTests.map(l => (
                                            <div
                                                key={l.id}
                                                style={{
                                                    padding: '20px',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '16px',
                                                    marginBottom: '18px'
                                                }}
                                            >
                                                <h4>
                                                    {l.lab_test_details?.test_name}
                                                </h4>
                                                <p style={{ margin: '0 0 8px 0' }}>
                                                    {l.lab_test_value ? `Result: ${l.lab_test_value}` : 'Awaiting evaluation'}
                                                </p>
                                                <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                                                    {l.remarks || 'No remarks'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;