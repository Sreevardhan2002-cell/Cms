import React, { useState, useEffect } from 'react';
import api from '../api';
import { Users, Activity, Pill, Package, AlertTriangle, ClipboardList, CheckCircle2, Layers3 } from 'lucide-react';

const AdminDashboard = () => {
    const [staffList, setStaffList] = useState([]);
    const [roles, setRoles] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);

    const fetchData = async () => {
        try {
            const [staffRes, rolesRes, medicinesRes, stocksRes, prescriptionsRes] = await Promise.all([
                api.get('staff/'),
                api.get('roles/'),
                api.get('medicines/'),
                api.get('inventory/medicine/'),
                api.get('prescriptions/medicine/')
            ]);
            setStaffList(staffRes.data);
            setRoles(rolesRes.data);
            setMedicines(medicinesRes.data);
            setStocks(stocksRes.data);
            setPrescriptions(prescriptionsRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const stockByMedicineId = stocks.reduce((acc, stock) => {
        acc[stock.medicine] = stock;
        return acc;
    }, {});

    const medicineStats = medicines.map(medicine => {
        const stock = stockByMedicineId[medicine.id];
        const stockInHand = stock?.stock_in_hand || 0;
        const reorderLevel = stock?.re_order_level || 5;

        return {
            ...medicine,
            stockInHand,
            reorderLevel,
            isLowStock: stockInHand <= reorderLevel,
            isOutOfStock: stockInHand <= 0
        };
    });

    const totalMedicines = medicines.length;
    const totalStockUnits = stocks.reduce((sum, stock) => sum + (stock.stock_in_hand || 0), 0);
    const lowStockMedicines = medicineStats.filter(item => item.isLowStock).length;
    const outOfStockMedicines = medicineStats.filter(item => item.isOutOfStock).length;
    const pendingPrescriptions = prescriptions.filter(item => !item.is_dispensed).length;
    const dispensedPrescriptions = prescriptions.filter(item => item.is_dispensed).length;
    const activeCategories = new Set(medicines.map(item => item.category)).size;
    const mostRequestedMedicine = prescriptions.reduce((acc, item) => {
        const medicineId = item.medicine;
        acc[medicineId] = (acc[medicineId] || 0) + 1;
        return acc;
    }, {});
    const topMedicineId = Object.entries(mostRequestedMedicine).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topMedicineName = medicines.find(item => String(item.id) === String(topMedicineId))?.medicine_name || 'No prescriptions yet';

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Dashboard Overview</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Monitor pharmacy inventory, prescriptions, and staff members.</p>
                </div>
            </div>

            <div className="grid-cards" style={{ marginBottom: '2.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div className="glass-panel stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Total Medicines</div>
                            <div className="stat-value">{totalMedicines}</div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                            <Pill size={24} />
                        </div>
                    </div>
                </div>

                <div className="glass-panel stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Stock Units</div>
                            <div className="stat-value">{totalStockUnits}</div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
                            <Package size={24} />
                        </div>
                    </div>
                </div>

                <div className="glass-panel stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Pending Prescriptions</div>
                            <div className="stat-value">{pendingPrescriptions}</div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: 'var(--warning)' }}>
                            <ClipboardList size={24} />
                        </div>
                    </div>
                </div>
                
                <div className="glass-panel stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Low Stock Items</div>
                            <div className="stat-value">{lowStockMedicines}</div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: 'var(--danger)' }}>
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid-cards" style={{ marginBottom: '2.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div className="glass-panel stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Dispensed Prescriptions</div>
                            <div className="stat-value">{dispensedPrescriptions}</div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                </div>

                <div className="glass-panel stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Out of Stock</div>
                            <div className="stat-value">{outOfStockMedicines}</div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: 'var(--danger)' }}>
                            <Layers3 size={24} />
                        </div>
                    </div>
                </div>

                <div className="glass-panel stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Medicine Categories</div>
                            <div className="stat-value">{activeCategories}</div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: 'var(--warning)' }}>
                            <Activity size={24} />
                        </div>
                    </div>
                </div>

                <div className="glass-panel stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-label">Top Requested</div>
                            <div className="stat-value" style={{ fontSize: '1.2rem' }}>{topMedicineName}</div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                            <Users size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel">
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Recent Staff Members</h2>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Joining Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map(staff => {
                                const roleName = roles.find(r => r.id === staff.role)?.role_name || 'Unknown';
                                return (
                                    <tr key={staff.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                                                    {staff.full_name.charAt(0)}
                                                </div>
                                                <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{staff.full_name}</span>
                                            </div>
                                        </td>
                                        <td>{roleName}</td>
                                        <td>{staff.joining_date}</td>
                                        <td>
                                            <span className={`badge ${staff.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                {staff.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
