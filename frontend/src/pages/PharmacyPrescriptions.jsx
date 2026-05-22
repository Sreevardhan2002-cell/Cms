import { useState, useEffect } from 'react';
import api from '../api';
import { Pill, CheckCircle, Printer, AlertCircle, History, Clock } from 'lucide-react';

const PharmacyPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('Pending');

    useEffect(() => {
        const loadPrescriptions = async () => {
            try {
                const res = await api.get('prescriptions/medicine/');
                setPrescriptions(res.data);
            } catch (err) {
                console.error("Failed to fetch prescriptions", err);
                setError("Could not load prescriptions.");
            }
        };

        loadPrescriptions();
    }, []);

    const dispenseAll = async (prescriptionsArray) => {
        setError('');
        setSuccess('');
        let successCount = 0;
        let hasError = false;
        let errorMessage = '';

        for (const pres of prescriptionsArray) {
            try {
                await api.post(`prescriptions/medicine/${pres.id}/dispense/`);
                successCount++;
            } catch (err) {
                console.error(err);
                hasError = true;
                errorMessage = err.response?.data?.error || "Failed to dispense medicine.";
                break; // Stop if there's an error (like out of stock)
            }
        }
        
        if (hasError) {
            setError(errorMessage);
        }
        if (successCount > 0) {
            setSuccess(`Dispensed ${successCount} medicines successfully.`);
        }
        try {
            const res = await api.get('prescriptions/medicine/');
            setPrescriptions(res.data);
        } catch (err) {
            console.error("Failed to fetch prescriptions", err);
            setError("Could not load prescriptions.");
        }
    };

    const handlePrintBill = (apptGroup) => {
        let overallSubtotal = 0;
        const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amount);
        
        const rows = apptGroup.prescriptions.map(pres => {
            let perDay = 1;
            const freqStr = pres.frequency || '';
            if (freqStr.includes('-')) {
                const parts = freqStr.split('-');
                const sum = parts.reduce((acc, val) => acc + (parseInt(val) || 0), 0);
                if (sum > 0) perDay = sum;
            } else {
                const nums = freqStr.replace(/[^0-9]/g, '');
                if (nums) perDay = parseInt(nums) || 1;
            }

            let days = 1;
            const durStr = pres.duration || '';
            const durNums = durStr.replace(/[^0-9]/g, '');
            if (durNums) days = parseInt(durNums) || 1;

            const totalQuantity = perDay * days;

            const unitPrice = parseFloat(pres.medicine_details?.unit_price || 0);
            const subtotal = unitPrice * totalQuantity;
            overallSubtotal += subtotal;

            return `
                <tr>
                    <td><strong>${pres.medicine_details?.medicine_name || 'Medicine'}</strong></td>
                    <td>${pres.dosage} for ${pres.duration}</td>
                    <td>${totalQuantity}</td>
                    <td style="text-align: right;">${formatCurrency(unitPrice)}</td>
                    <td style="text-align: right;">${formatCurrency(subtotal)}</td>
                </tr>
            `;
        }).join('');

        const gstRate = 0.12; // 12% GST
        const gstAmount = overallSubtotal * gstRate;
        const totalAmount = overallSubtotal + gstAmount;
        const invoiceNumber = `#INV-${apptGroup.appointment}-${apptGroup.prescriptions.length}`;

        const printWindow = window.open('', '', 'width=800,height=900');
        printWindow.document.write(`
            <html>
                <head>
                    <title>maclinic lab report</title>
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
                                <h1>maclinic lab report</h1>
                                <p>123 Health Avenue, Medical District</p>
                                <p>Cityville, State 12345</p>
                                <p>Phone: +1 (555) 123-4567 | Email: pharmacy@clinicsys.com</p>
                            </div>
                            <div class="invoice-details">
                                <h2>TAX INVOICE</h2>
                                <p><strong>Invoice No:</strong> ${invoiceNumber}</p>
                                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                                <p><strong>Appt Ref:</strong> ${apptGroup.appointment}</p>
                            </div>
                        </div>
                        
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Dosage & Duration</th>
                                    <th>Qty</th>
                                    <th style="text-align: right;">Unit Price</th>
                                    <th style="text-align: right;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows}
                            </tbody>
                        </table>

                        <div class="totals">
                            <div class="totals-row">
                                <span>Subtotal:</span>
                                <span>${formatCurrency(overallSubtotal)}</span>
                            </div>
                            <div class="totals-row">
                                <span>GST (12%):</span>
                                <span>${formatCurrency(gstAmount)}</span>
                            </div>
                            <div class="totals-row grand-total">
                                <span>Grand Total:</span>
                                <span>${formatCurrency(totalAmount)}</span>
                            </div>
                        </div>

                        <div class="footer">
                            <div style="color: #718096; font-size: 12px; line-height: 1.5;">
                                <p><strong>Terms & Conditions:</strong></p>
                                <p>1. Medicines once dispensed cannot be returned or exchanged.</p>
                                <p>2. Keep medicines in a cool, dry place out of reach of children.</p>
                                <p>3. This is a computer-generated invoice.</p>
                            </div>
                            <div class="signature-box">
                                <div class="signature-line">Authorized Pharmacist</div>
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

    const getGroupedPrescriptions = (prescriptionsList) => {
        const groups = {};
        prescriptionsList.forEach(p => {
            if (!groups[p.appointment]) {
                groups[p.appointment] = {
                    appointment: p.appointment,
                    prescriptions: [],
                    is_dispensed: p.is_dispensed
                };
            }
            groups[p.appointment].prescriptions.push(p);
        });
        return Object.values(groups).sort((a,b) => b.appointment - a.appointment);
    };

    const pendingPrescriptions = prescriptions.filter(p => !p.is_dispensed);
    const historyPrescriptions = prescriptions.filter(p => p.is_dispensed);

    const displayedGroups = getGroupedPrescriptions(activeTab === 'Pending' ? pendingPrescriptions : historyPrescriptions);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Pill color="var(--primary)" /> Pharmacy Prescriptions</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage and dispense medicines prescribed by doctors.</p>
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
                    <Clock size={18} /> Pending Queue
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
                    <History size={18} /> Dispensed History
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

            <div className="glass-panel animate-fade-in">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Appt. ID</th>
                                <th>Medicines Prescribed</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedGroups.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        {activeTab === 'Pending' ? 'No pending prescriptions found.' : 'No prescription history available.'}
                                    </td>
                                </tr>
                            ) : displayedGroups.map(group => (
                                <tr key={group.appointment}>
                                    <td style={{ fontWeight: 600 }}>Appt #{group.appointment}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {group.prescriptions.map(pres => (
                                                <div key={pres.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--background)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                    <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{pres.medicine_details?.medicine_name}</span>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>({pres.dosage} for {pres.duration})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ verticalAlign: 'middle' }}>
                                        {group.is_dispensed ? (
                                            <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><CheckCircle size={14} /> Dispensed</span>
                                        ) : (
                                            <span className="badge badge-warning">Pending</span>
                                        )}
                                    </td>
                                    <td style={{ verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {!group.is_dispensed ? (
                                                <button onClick={() => dispenseAll(group.prescriptions)} className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                                                    Dispense All
                                                </button>
                                            ) : (
                                                <button onClick={() => handlePrintBill(group)} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                                                    <Printer size={16} /> Print Consolidated Bill
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PharmacyPrescriptions;
