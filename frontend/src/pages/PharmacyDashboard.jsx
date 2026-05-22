import React, { useState, useEffect } from 'react';
import api from '../api';
import { Pill, AlertTriangle, Archive, Clock, AlertCircle, PackageCheck, ShieldCheck } from 'lucide-react';

const PharmacyDashboard = () => {
    const [medicines, setMedicines] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [medRes, stockRes] = await Promise.all([
                    api.get('medicines/'),
                    api.get('inventory/medicine/')
                ]);
                setMedicines(medRes.data);
                setStocks(stockRes.data);

                try {
                    const presRes = await api.get('prescriptions/medicine/');
                    setPrescriptions(presRes.data);
                } catch (presErr) {
                    console.error('Failed to fetch prescriptions', presErr);
                    setPrescriptions([]);
                }

                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const lowStockItems = stocks.filter(s => s.stock_in_hand <= (s.re_order_level || 5));
    const pendingPrescriptions = prescriptions
        .filter(p => !p.is_dispensed)
        .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
    
    // Near Expiry: within 5 days
    const today = new Date();
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(today.getDate() + 5);
    
    const nearExpiryItems = medicines.filter(m => {
        if (!m.expiry_date) return false;
        const expDate = new Date(m.expiry_date);
        return expDate >= today && expDate <= fiveDaysFromNow;
    });

    const expiredItems = medicines.filter(m => {
        if (!m.expiry_date) return false;
        const expDate = new Date(m.expiry_date);
        return expDate < today;
    });

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', fontWeight: '800' }}>
                    <Archive color="var(--primary)" size={32} /> Pharmacy Dashboard
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Overview of medicine inventory, low stock alerts, and expiry notifications.</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading dashboard data...</div>
            ) : (
                <>
                    <div className="grid-cards" style={{ marginBottom: '2.5rem' }}>
                        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--primary)', transition: 'transform 0.3s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div className="stat-label">Total Medicines</div>
                                    <div className="stat-value" style={{ color: 'var(--primary)', fontSize: '2.5rem' }}>{medicines.length}</div>
                                </div>
                                <div style={{ padding: '0.75rem', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                                    <Pill size={28} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--warning)', transition: 'transform 0.3s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div className="stat-label">Low Stock Alerts</div>
                                    <div className="stat-value" style={{ color: 'var(--warning)', fontSize: '2.5rem' }}>{lowStockItems.length}</div>
                                </div>
                                <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: 'var(--warning)' }}>
                                    <AlertTriangle size={28} />
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--danger)', transition: 'transform 0.3s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div className="stat-label">Near Expiry (5 Days)</div>
                                    <div className="stat-value" style={{ color: 'var(--danger)', fontSize: '2.5rem' }}>{nearExpiryItems.length + expiredItems.length}</div>
                                </div>
                                <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: 'var(--danger)' }}>
                                    <Clock size={28} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem', border: '1px solid rgba(5,150,105,0.18)' }}>
                        <div style={{ padding: '1.5rem', background: 'linear-gradient(90deg, rgba(5,150,105,0.08) 0%, transparent 100%)', borderBottom: '1px solid var(--border)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', margin: 0, fontSize: '1.25rem' }}>
                                <Pill size={20} /> Pending Doctor Prescriptions
                            </h3>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            {pendingPrescriptions.length === 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem', textAlign: 'center' }}>
                                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                                        <PackageCheck size={32} color="var(--success)" />
                                    </div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>No pending prescriptions</h4>
                                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>New prescriptions from doctors will appear here for dispensing.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {pendingPrescriptions.slice(0, 5).map(pres => (
                                        <div key={pres.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid var(--primary)' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1.02rem', marginBottom: '0.25rem' }}>
                                                    {pres.medicine_details?.medicine_name || 'Medicine'}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    Appt #{pres.appointment} • {pres.dosage} • {pres.duration}
                                                </div>
                                            </div>
                                            <span className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Pending</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                        {/* Low Stock Widget */}
                        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                            <div style={{ padding: '1.5rem', background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.05) 0%, transparent 100%)', borderBottom: '1px solid var(--border)' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', margin: 0, fontSize: '1.25rem' }}>
                                    <AlertTriangle size={20} /> Items Running Low
                                </h3>
                            </div>
                            
                            <div style={{ padding: '1.5rem' }}>
                                {lowStockItems.length === 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', textAlign: 'center' }}>
                                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                                            <PackageCheck size={32} color="var(--success)" />
                                        </div>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>Stock Levels Healthy</h4>
                                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>All medicines are currently above their re-order levels.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {lowStockItems.map(stock => (
                                            <div key={stock.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid var(--warning)' }}>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '0.25rem' }}>{stock.medicine_details?.medicine_name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Re-order level: {stock.re_order_level}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--warning)', lineHeight: '1' }}>{stock.stock_in_hand}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>Remaining</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Expiry Alerts Widget */}
                        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                            <div style={{ padding: '1.5rem', background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.05) 0%, transparent 100%)', borderBottom: '1px solid var(--border)' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', margin: 0, fontSize: '1.25rem' }}>
                                    <AlertCircle size={20} /> Expiry Alerts
                                </h3>
                            </div>
                            
                            <div style={{ padding: '1.5rem' }}>
                                {nearExpiryItems.length === 0 && expiredItems.length === 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', textAlign: 'center' }}>
                                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                                            <ShieldCheck size={32} color="var(--success)" />
                                        </div>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>No Expiry Alerts</h4>
                                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>No medicines are expiring within the next 5 days.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {expiredItems.map(med => (
                                            <div key={`exp-${med.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', borderLeft: '4px solid var(--danger)' }}>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '0.25rem' }}>{med.medicine_name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14}/> Expired: {med.expiry_date}</div>
                                                </div>
                                                <span className="badge badge-danger" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Expired</span>
                                            </div>
                                        ))}
                                        {nearExpiryItems.map(med => (
                                            <div key={`near-${med.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid var(--warning)' }}>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '0.25rem' }}>{med.medicine_name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14}/> Expires: {med.expiry_date}</div>
                                                </div>
                                                <span className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Expiring Soon</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PharmacyDashboard;
