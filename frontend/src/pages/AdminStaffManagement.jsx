import React, { useState, useEffect } from 'react';
import api from '../api';
import { Users, UserPlus, X, Edit2 } from 'lucide-react';

const AdminStaffManagement = () => {
    const [staffList, setStaffList] = useState([]);
    const [roles, setRoles] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        full_name: '',
        gender: 'Male',
        joining_date: new Date().toISOString().split('T')[0],
        mobile_number: '',
        username: '',
        password: '',
        role: '',
        specialization: ''
    });

    const fetchData = async () => {
        try {
            const [staffRes, rolesRes, specRes, docsRes] = await Promise.all([
                api.get('staff/'),
                api.get('roles/'),
                api.get('specializations/'),
                api.get('doctors/')
            ]);
            setStaffList(staffRes.data);
            setRoles(rolesRes.data);
            setSpecializations(specRes.data);
            setDoctors(docsRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openAddModal = () => {
        setEditingStaff(null);
        setFormData({
            full_name: '',
            gender: 'Male',
            joining_date: new Date().toISOString().split('T')[0],
            mobile_number: '',
            username: '',
            password: '',
            role: roles.length > 0 ? roles[0].id : '',
            specialization: ''
        });
        setShowModal(true);
    };

    const openEditModal = (staff) => {
        setEditingStaff(staff);
        const doc = doctors.find(d => d.staff === staff.id);
        setFormData({
            full_name: staff.full_name,
            gender: staff.gender,
            joining_date: staff.joining_date,
            mobile_number: staff.mobile_number,
            username: staff.username,
            password: '', // Better to leave blank and only update if typed, or just set it
            role: staff.role,
            specialization: doc ? (doc.specialization || '') : ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const normalizedUsername = formData.username.trim();
            const normalizedPassword = formData.password.trim();
            const isDoctor = roles.find(r => r.id === parseInt(formData.role))?.role_name === 'Doctor';
            const updateData = { ...formData, username: normalizedUsername };
            delete updateData.specialization; // Specialization is not part of Staff model

            let staffId;

            if (editingStaff) {
                if (!normalizedPassword) {
                    delete updateData.password;
                } else {
                    updateData.password = normalizedPassword;
                }
                await api.patch(`staff/${editingStaff.id}/`, updateData);
                staffId = editingStaff.id;
            } else {
                updateData.password = normalizedPassword;
                const res = await api.post('staff/', updateData);
                staffId = res.data.id;
            }

            if (isDoctor && formData.specialization) {
                // Fetch doctors to find the newly created or existing one
                const docsRes = await api.get('doctors/');
                const doc = docsRes.data.find(d => d.staff === staffId);
                if (doc) {
                    await api.patch(`doctors/${doc.id}/`, { specialization: formData.specialization });
                }
            }

            setShowModal(false);
            fetchData();
        } catch (err) {
            console.error("Failed to save staff", err);
            alert("Error saving staff details");
        }
    };

    const toggleStatus = async (staff) => {
        try {
            if (staff.is_active) {
                await api.patch(`staff/${staff.id}/deactivate/`);
            } else {
                await api.patch(`staff/${staff.id}/`, { is_active: true });
            }
            fetchData();
        } catch (err) {
            console.error("Failed to toggle status", err);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Staff Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage clinic employees, roles, and permissions.</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <UserPlus size={18} /> Add New Staff
                </button>
            </div>

            <div className="glass-panel">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Username</th>
                                <th>Mobile</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map(staff => {
                                const roleName = roles.find(r => r.id === staff.role)?.role_name || 'Unknown';
                                return (
                                    <tr key={staff.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {staff.full_name.charAt(0)}
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{staff.full_name}</span>
                                            </div>
                                        </td>
                                        <td>{roleName}</td>
                                        <td>{staff.username}</td>
                                        <td>{staff.mobile_number}</td>
                                        <td>
                                            <span className={`badge ${staff.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                {staff.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => openEditModal(staff)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                                                    <Edit2 size={14} /> Edit
                                                </button>
                                                <button onClick={() => toggleStatus(staff)} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                                                    {staff.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Staff Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>{editingStaff ? 'Edit Staff Details' : 'Add New Staff'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="input-label">Full Name</label>
                                <input type="text" name="full_name" className="input-field" value={formData.full_name} onChange={handleInputChange} required />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Username</label>
                                    <input type="text" name="username" className="input-field" value={formData.username} onChange={handleInputChange} required />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Password {editingStaff && "(Leave blank to keep current)"}</label>
                                    <input type="password" name="password" className="input-field" value={formData.password} onChange={handleInputChange} required={!editingStaff} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Mobile Number</label>
                                    <input type="text" name="mobile_number" className="input-field" value={formData.mobile_number} onChange={handleInputChange} required />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Gender</label>
                                    <select name="gender" className="input-field" value={formData.gender} onChange={handleInputChange}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Joining Date</label>
                                    <input type="date" name="joining_date" className="input-field" value={formData.joining_date} onChange={handleInputChange} required />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Role</label>
                                    <select name="role" className="input-field" value={formData.role} onChange={handleInputChange} required>
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id}>{r.role_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {roles.find(r => r.id === parseInt(formData.role))?.role_name === 'Doctor' && (
                                <div className="input-group">
                                    <label className="input-label">Department (Specialization)</label>
                                    <select name="specialization" className="input-field" value={formData.specialization} onChange={handleInputChange} required>
                                        <option value="" disabled>Select Department</option>
                                        {specializations.map(s => (
                                            <option key={s.id} value={s.id}>{s.specialization_name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                {editingStaff ? 'Update Staff Member' : 'Save Staff Member'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStaffManagement;
