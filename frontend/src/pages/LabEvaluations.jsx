import { useState, useEffect } from 'react';
import api from '../api';
import { FlaskConical, CheckCircle, FileText, AlertCircle, Clock, History, Printer } from 'lucide-react';

const LabEvaluations = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [activeTab, setActiveTab] = useState('Pending');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [selectedPres, setSelectedPres] = useState(null);
    const [evalData, setEvalData] = useState({
        lab_test_value: '',
        remarks: ''
    });

    const fetchPrescriptions = async () => {
        try {
            const res = await api.get('prescriptions/labtest/');
            setPrescriptions(res.data);
        } catch (err) {
            console.error("Failed to fetch prescriptions", err);
            setError("Could not load lab tests.");
        }
    };

    useEffect(() => {
        void (async () => {
            await fetchPrescriptions();
        })();
    }, []);

    const handleEvaluateClick = (pres) => {
        setSelectedPres(pres);
        setEvalData({ lab_test_value: '', remarks: '' });
        setShowModal(true);
    };

    const handleEvalSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const res = await api.post(`prescriptions/labtest/${selectedPres.id}/evaluate/`, evalData);
            setSuccess(res.data.message);
            setShowModal(false);
            fetchPrescriptions();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Failed to evaluate lab test.");
        }
    };

    const handlePrintBill = (pres) => {
        const unitPrice = parseFloat(pres.lab_test_details?.amount || 0);
        const gstRate = 0.12;
        const gstAmount = unitPrice * gstRate;
        const totalAmount = unitPrice + gstAmount;

        const printWindow = window.open('', '', 'width=800,height=900');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Lab Invoice - Maclinic</title>
                    <style>
                        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #2d3748; background: #f7fafc; }
                        .invoice-box { max-width: 800px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; background: #fff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border-radius: 8px; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
                        .hospital-details h1 { color: #4F46E5; margin: 0 0 5px 0; font-size: 28px; }
                        .hospital-details p { margin: 2px 0; color: #718096; font-size: 14px; }
                        .invoice-details { text-align: right; }
                        .invoice-details h2 { margin: 0 0 5px 0; color: #2d3748; letter-spacing: 1px; }
                        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        .table th, .table td { padding: 15px; border-bottom: 1px solid #e2e8f0; text-align: left; }
                        .table th { background: #f8fafc; color: #4a5568; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; }
                        .table tr:last-child td { border-bottom: none; }
                        .totals { width: 50%; margin-left: auto; margin-top: 30px; border-top: 2px solid #e2e8f0; padding-top: 20px; }
                        .totals-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px; }
                        .totals-row.grand-total { font-size: 18px; font-weight: bold; color: #4F46E5; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 10px; }
                        .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
                        .signature-box { text-align: center; width: 200px; }
                        .signature-line { border-top: 1px solid #2d3748; margin-top: 50px; padding-top: 10px; font-weight: 600; font-size: 14px; }
                        @media print { body { background: white; padding: 0; } .invoice-box { box-shadow: none; border: none; padding: 20px; } }
                    </style>
                </head>
                <body>
                    <div class="invoice-box">
                        <div class="header">
                            <div class="hospital-details">
                                <h1>Maclinic Hospital</h1>
                                <p>123 Health Avenue, Medical District</p>
                                <p>Cityville, State 12345</p>
                                <p>Phone: 345678977 | Email: lab@maclinic.com</p>
                            </div>
                            <div class="invoice-details">
                                <h2>LAB INVOICE</h2>
                                <p><strong>Invoice No:</strong> #LAB-${Math.floor(Math.random() * 100000)}</p>
                                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                                <p><strong>Appt Ref:</strong> ${pres.appointment}</p>
                            </div>
                        </div>
                        
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Test Name</th>
                                    <th>Sample</th>
                                    <th style="text-align: right;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>${pres.lab_test_details?.test_name || 'Lab Test'}</strong></td>
                                    <td>${pres.lab_test_details?.sample_required || '-'}</td>
                                    <td style="text-align: right;">$${unitPrice.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="totals">
                            <div class="totals-row">
                                <span>Subtotal:</span>
                                <span>$${unitPrice.toFixed(2)}</span>
                            </div>
                            <div class="totals-row">
                                <span>GST (12%):</span>
                                <span>$${gstAmount.toFixed(2)}</span>
                            </div>
                            <div class="totals-row grand-total">
                                <span>Grand Total:</span>
                                <span>$${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div class="footer">
                            <div style="color: #718096; font-size: 12px; line-height: 1.5;">
                                <p><strong>Terms & Conditions:</strong></p>
                                <p>1. Lab reports are available at the front desk or via the portal.</p>
                                <p>2. This is a computer-generated invoice.</p>
                            </div>
                            <div class="signature-box">
                                <div class="signature-line">Authorized Technician</div>
                            </div>
                        </div>
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                        window.onafterprint = function() { window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handlePrintReport = (pres) => {
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
                        <p><strong>Appointment ID:</strong> ${pres.appointment}</p>
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
                                <td style="color: #4F46E5; font-weight: bold;">${pres.lab_test_value}</td>
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
                            <div style="border-top: 1px solid #000; padding-top: 5px;">Lab Technician Signature</div>
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
    const pendingTests = prescriptions.filter(p => !p.lab_test_value);
    const historyTests = prescriptions.filter(p => p.lab_test_value);
    const displayedTests = activeTab === 'Pending' ? pendingTests : historyTests;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><FlaskConical color="var(--primary)" /> Lab Evaluations</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Evaluate prescribed tests and enter patient results.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button 
                    className="btn" 
                    style={{ 
                        background: activeTab === 'Pending' ? 'linear-gradient(135deg, var(--primary), var(--primary-hover))' : 'rgba(79, 70, 229, 0.05)',
                        color: activeTab === 'Pending' ? 'white' : 'var(--text-main)',
                        border: activeTab === 'Pending' ? 'none' : '1px solid var(--border)',
                        padding: '0.8rem 2rem', borderRadius: '12px', fontSize: '1.05rem', fontWeight: '600'
                    }} 
                    onClick={() => setActiveTab('Pending')}
                >
                    <Clock size={18} /> Pending Tests
                </button>
                <button 
                    className="btn" 
                    style={{ 
                        background: activeTab === 'History' ? 'linear-gradient(135deg, var(--primary), var(--primary-hover))' : 'rgba(79, 70, 229, 0.05)',
                        color: activeTab === 'History' ? 'white' : 'var(--text-main)',
                        border: activeTab === 'History' ? 'none' : '1px solid var(--border)',
                        padding: '0.8rem 2rem', borderRadius: '12px', fontSize: '1.05rem', fontWeight: '600'
                    }} 
                    onClick={() => setActiveTab('History')}
                >
                    <History size={18} /> Completed Tests
                </button>
            </div>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={20} /> {error}
                </div>
            )}
            
            {success && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={20} /> {success}
                </div>
            )}

            <div className="table-container" style={{ borderRadius: 0 }}>
                <table className="table">
                        <thead>
                            <tr>
                                <th>Test ID</th>
                                <th>Appt Ref</th>
                                <th>Test Name</th>
                                <th>Sample</th>
                                <th>Status / Result</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedTests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', verticalAlign: 'top' }}>
                                        {activeTab === 'Pending' ? 'No pending lab tests.' : 'No completed tests yet.'}
                                    </td>
                                </tr>
                            ) : displayedTests.map(pres => (
                                <tr key={pres.id}>
                                    <td style={{ fontWeight: 600 }}>#{pres.id}</td>
                                    <td>Appt #{pres.appointment}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{pres.lab_test_details?.test_name}</td>
                                    <td><span className="badge badge-secondary">{pres.lab_test_details?.sample_required}</span></td>
                                    <td>
                                        {!pres.lab_test_value ? (
                                            <span className="badge badge-warning">Awaiting Evaluation</span>
                                        ) : (
                                            <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                                                {pres.lab_test_value} <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>
                                                    (Ref: {pres.lab_test_details?.reference_min_range}-{pres.lab_test_details?.reference_max_range})
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {!pres.lab_test_value ? (
                                                <button onClick={() => handleEvaluateClick(pres)} className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                                                    Evaluate
                                                </button>
                                            ) : (
                                                <>
                                                    <button onClick={() => handlePrintReport(pres)} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                                                        <FileText size={16} /> Report
                                                    </button>
                                                    <button onClick={() => handlePrintBill(pres)} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                                                        <Printer size={16} /> Bill
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                </table>
            </div>

            {/* Evaluate Modal */}
            {showModal && selectedPres && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, color: 'var(--primary)', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                                <FlaskConical size={24} /> Evaluate Test
                            </h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>&times;</span>
                            </button>
                        </div>
                        
                        <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}><strong>Test:</strong> {selectedPres.lab_test_details?.test_name}</p>
                            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}><strong>Reference:</strong> {selectedPres.lab_test_details?.reference_min_range} - {selectedPres.lab_test_details?.reference_max_range}</p>
                            <p style={{ margin: '0', color: 'var(--text-main)' }}><strong>Sample:</strong> {selectedPres.lab_test_details?.sample_required}</p>
                        </div>

                        <form onSubmit={handleEvalSubmit}>
                            <div className="input-group">
                                <label className="input-label">Result Value (Required)</label>
                                <input type="text" className="input-field" value={evalData.lab_test_value} onChange={(e) => setEvalData({...evalData, lab_test_value: e.target.value})} required autoFocus style={{ background: 'white' }} />
                            </div>
                            
                            <div className="input-group">
                                <label className="input-label">Remarks (Optional)</label>
                                <textarea className="input-field" rows="3" value={evalData.remarks} onChange={(e) => setEvalData({...evalData, remarks: e.target.value})} style={{ background: 'white', resize: 'vertical' }}></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>
                                Submit Result
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabEvaluations;
