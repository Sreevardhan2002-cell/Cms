import { useState, useEffect } from 'react';
import api from '../api';
import { Users, Calendar } from 'lucide-react';

const ReceptionDashboard = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        appointmentsToday: 0
    });
    const [recentPatients, setRecentPatients] = useState([]);

    useEffect(() => {
        void (async () => {
            try {
                const todayStr = new Date().toISOString().split('T')[0];
                const [patientsRes, appointmentsRes] = await Promise.all([
                    api.get('patients/'),
                    api.get(`appointments/?date=${todayStr}`)
                ]);

                const patients = patientsRes.data || [];

                setStats({
                    totalPatients: patients.length,
                    appointmentsToday: appointmentsRes.data.length
                });

                setRecentPatients(
                    patients
                        .slice(-5)
                        .reverse()
                        .map(p => ({
                            id: p.id,
                            patient_name: p.patient_name,
                            gender: p.gender,
                            mobile_number: p.mobile_number
                        }))
                );
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
        })();
    }, []);
    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1>Reception Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Welcome to the reception desk. Manage patients and appointments here.</p>
            </div>

            <div className="grid-cards" style={{ marginBottom: '2.5rem' }}>
                <div className="glass-panel stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Total Patients</div>
                            <div className="stat-value">{stats.totalPatients}</div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                            <Users size={24} />
                        </div>
                    </div>
                </div>
                
                <div className="glass-panel stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Appointments Today</div>
                            <div className="stat-value">{stats.appointmentsToday}</div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
                            <Calendar size={24} />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Total Patients</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    {stats.totalPatients} registered patients in the system.
                </p>

                {recentPatients.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>No patient records available.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '0.65rem' }}>
                        {recentPatients.map(patient => (
                            <div
                                key={patient.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: '1rem',
                                    padding: '0.85rem 1rem',
                                    border: '1px solid var(--border)',
                                    borderRadius: '10px',
                                    background: 'var(--surface)'
                                }}
                            >
                                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{patient.patient_name}</span>
                                <span style={{ color: 'var(--text-muted)' }}>{patient.gender} • {patient.mobile_number}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReceptionDashboard;
