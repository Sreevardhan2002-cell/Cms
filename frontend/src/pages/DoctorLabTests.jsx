import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Microscope, Clock, FileText, Search } from 'lucide-react';

const DoctorLabTests = () => {
    const { user } = useAuth();
    const [labTests, setLabTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All'); // All, Pending, Completed

    useEffect(() => {
        const fetchDoctorLabTests = async () => {
            try {
                // Get the doctor profile for the current user
                const docsRes = await api.get('doctors/');
                const currentDoc = docsRes.data.find(d => String(d.staff) === String(user.id) || String(d.staff_details?.id) === String(user.id));
                
                if (currentDoc) {
                    const testsRes = await api.get(`prescriptions/labtest/doctor/${currentDoc.id}/`);
                    setLabTests(testsRes.data);
                }
                setLoading(false);
            } catch (err) {
                console.error("Failed to load lab tests", err);
                setLoading(false);
            }
        };
        fetchDoctorLabTests();
    }, [user]);

    const handlePrintReport = (pres) => {
        if (!pres.lab_test_value) return;
        
        const printWindow = window.open('', '', 'width=800,height=900');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Lab Report - Maclinic</title>
                    <style>
                        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #2d3748; }
                        h1 { color: #4F46E5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
                        .details { margin-top: 20px; margin-bottom: 30px; font-size: 16px; line-height: 1.6; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
                        th { background: #f8fafc; }
                    </style>
                </head>
                <body>
                    <h1>Maclinic Lab Report</h1>
                    <div class="details">
                        <p><strong>Date:</strong> ${pres.created_date ? new Date(pres.created_date).toLocaleDateString() : 'N/A'}</p>
                        <p><strong>Appointment Ref:</strong> #${pres.appointment}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Test Name</th>
                                <th>Result Value</th>
                                <th>Reference Range</th>
                                <th>Sample</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>${pres.lab_test_details?.test_name}</strong></td>
                                <td style="color: var(--primary); font-weight: bold;">${pres.lab_test_value}</td>
                                <td>${pres.lab_test_details?.reference_min_range} - ${pres.lab_test_details?.reference_max_range}</td>
                                <td>${pres.lab_test_details?.sample_required}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="margin-top: 30px;">
                        <h4>Remarks:</h4>
                        <p>${pres.remarks || 'No remarks provided.'}</p>
                    </div>
                    <div style="margin-top: 60px; text-align: right; width: 100%;">
                        <div style="display: inline-block; text-align: center;">
                            <div style="border-top: 1px solid #000; padding-top: 5px;">Verified by Lab</div>
                        </div>
                    </div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Filter logic
    const filteredTests = labTests.filter(test => {
        const matchesSearch = test.lab_test_details?.test_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              String(test.appointment).includes(searchTerm);
        
        if (filterStatus === 'Pending') return matchesSearch && !test.lab_test_value;
        if (filterStatus === 'Completed') return matchesSearch && test.lab_test_value;
        return matchesSearch;
    });

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', fontWeight: '800' }}>
                        <Microscope color="var(--primary)" size={32} /> Patient Lab Results
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Review all lab tests requested for your patients.</p>
                </div>
            </div>

            <div className="glass-panel" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem 1.5rem' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--background)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                    <input 
                        type="text" 
                        placeholder="Search by Test Name or Appt ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'var(--text-main)' }}
                    />
                </div>
                
                <select 
                    className="input-field" 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ width: '200px', marginBottom: 0, background: 'var(--background)' }}
                >
                    <option value="All">All Tests</option>
                    <option value="Pending">Pending Evaluation</option>
                    <option value="Completed">Completed Results</option>
                </select>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading lab results...</div>
            ) : (
                <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-container" style={{ margin: 0 }}>
                        <table className="table" style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Appt ID</th>
                                    <th>Test Name</th>
                                    <th>Reference Range</th>
                                    <th>Status / Result</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTests.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                            No lab tests found matching your criteria.
                                        </td>
                                    </tr>
                                ) : filteredTests.map(test => (
                                    <tr key={test.id}>
                                        <td style={{ color: 'var(--text-muted)' }}>{new Date(test.created_date).toLocaleDateString()}</td>
                                        <td style={{ fontWeight: 500 }}>#{test.appointment}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{test.lab_test_details?.test_name}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>
                                            {test.lab_test_details?.reference_min_range} - {test.lab_test_details?.reference_max_range}
                                        </td>
                                        <td>
                                            {!test.lab_test_value ? (
                                                <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}>
                                                    <Clock size={14} /> Pending
                                                </span>
                                            ) : (
                                                <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                    {test.lab_test_value}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {test.lab_test_value ? (
                                                <button onClick={() => handlePrintReport(test)} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                                                    <FileText size={16} /> View Report
                                                </button>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Awaiting Lab</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorLabTests;
