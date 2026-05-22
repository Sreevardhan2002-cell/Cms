import { useState, useEffect } from 'react';
import api from '../api';
import { FlaskConical, Plus, ListPlus, Trash2 } from 'lucide-react';

const LabTestManagement = () => {
    const [tests, setTests] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    
    const [newCategoryName, setNewCategoryName] = useState('');
    
    const [formData, setFormData] = useState({
        test_name: '',
        amount: '',
        reference_min_range: '',
        reference_max_range: '',
        sample_required: '',
        category: ''
    });

    const fetchData = async () => {
        try {
            const [testRes, catRes] = await Promise.all([
                api.get('labtests/'),
                api.get('labtest-categories/')
            ]);

            setTests(testRes.data);
            setCategories(catRes.data);

            if (catRes.data.length > 0) {
                setFormData(prev => (
                    prev.category ? prev : { ...prev, category: catRes.data[0].id }
                ));
            }
        } catch (err) {
            console.error("Failed to fetch lab tests", err);
        }
    };

    useEffect(() => {
        void (async () => {
            await fetchData();
        })();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('labtest-categories/', { category_name: newCategoryName });
            setCategories([...categories, res.data]);
            setFormData(prev => ({ ...prev, category: res.data.id }));
            setNewCategoryName('');
            setShowCategoryModal(false);
        } catch (err) {
            console.error(err);
            alert("Error adding category");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('labtests/', formData);
            setShowModal(false);
            setFormData({
                test_name: '', amount: '', reference_min_range: '', reference_max_range: '', sample_required: '', category: categories.length > 0 ? categories[0].id : ''
            });
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Error adding lab test");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this lab test?")) return;
        try {
            await api.delete(`labtests/${id}/`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Error deleting lab test");
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><FlaskConical color="var(--primary)" /> Lab Test Directory</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage available lab tests, reference ranges, and pricing.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => setShowCategoryModal(true)}>
                        <ListPlus size={18} /> Add Category
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Add New Test
                    </button>
                </div>
            </div>

            <div className="glass-panel">
                <div className="table-container">
                    <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Test Name</th>
                                <th>Category</th>
                                <th>Sample Required</th>
                                <th>Reference Range</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tests.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No lab tests defined.</td></tr>
                            ) : tests.map(test => (
                                <tr key={test.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{test.test_name}</td>
                                    <td>{test.category_details?.category_name || 'Unknown'}</td>
                                    <td><span className="badge badge-secondary">{test.sample_required}</span></td>
                                    <td>{test.reference_min_range} - {test.reference_max_range}</td>
                                    <td style={{ fontWeight: 600 }}>${test.amount}</td>
                                    <td>
                                        <button className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.4rem 0.6rem', border: 'none' }} onClick={() => handleDelete(test.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for adding Category */}
            {showCategoryModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 , paddingTop: '5vh'}}>
                    <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Add Category</h2>
                            <button onClick={() => setShowCategoryModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                                <Trash2 size={24} style={{ display: 'none' }} /> {/* Using an X icon would be better, but we don't have it imported. Let's import X at the top or just use text/html entity */}
                                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>&times;</span>
                            </button>
                        </div>
                        <form onSubmit={handleCategorySubmit}>
                            <div className="input-group">
                                <label className="input-label">Category Name</label>
                                <input type="text" className="input-field" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required style={{ background: 'white' }} />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>
                                Save Category
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for adding Lab Test */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Add New Lab Test</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>&times;</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="input-label">Test Name</label>
                                <input type="text" name="test_name" className="input-field" value={formData.test_name} onChange={handleInputChange} required style={{ background: 'white' }} />
                            </div>
                            
                            <div className="input-group">
                                <label className="input-label">Category</label>
                                <select name="category" className="input-field" value={formData.category} onChange={handleInputChange} required style={{ background: 'white' }}>
                                    <option value="" disabled>Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Min Reference</label>
                                    <input type="text" name="reference_min_range" className="input-field" value={formData.reference_min_range} onChange={handleInputChange} style={{ background: 'white' }} />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Max Reference</label>
                                    <input type="text" name="reference_max_range" className="input-field" value={formData.reference_max_range} onChange={handleInputChange} style={{ background: 'white' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Sample Required</label>
                                    <input type="text" name="sample_required" className="input-field" value={formData.sample_required} onChange={handleInputChange} placeholder="e.g. Blood, Urine" required style={{ background: 'white' }} />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Price ($)</label>
                                    <input type="number" step="0.01" name="amount" className="input-field" value={formData.amount} onChange={handleInputChange} required style={{ background: 'white' }} />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>
                                Save Test
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabTestManagement;
