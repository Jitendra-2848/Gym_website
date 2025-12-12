import React, { useRef } from 'react';
import { X, Download, Check, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import RenewalInvoicePreview from './RenewalInvoicePreview';

const RenewalModal = ({ isOpen, onClose, onConfirm, memberData, renewalData, photoPreview, loading }) => {
  const invoiceRef = useRef(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!invoiceRef.current) return;
    
    try {
        // High quality canvas capture
        const canvas = await html2canvas(invoiceRef.current, { 
            scale: 2, 
            useCORS: true, 
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`RENEWAL_${memberData.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
        console.error("PDF Error:", error);
        alert("Could not generate PDF.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <RefreshCw className="text-primary-600" size={20} /> 
            Confirm Renewal
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500"><X size={20} /></button>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-auto bg-gray-200 p-4 flex justify-center items-start">
            {/* Scale down slightly to fit screen visually, PDF is full size */}
            <div className="scale-75 md:scale-90 origin-top">
                <RenewalInvoicePreview 
                    ref={invoiceRef} 
                    memberData={memberData} 
                    renewalData={renewalData} 
                    photoPreview={photoPreview} 
                />
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleDownload} 
            className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <Download size={18} /> Download Receipt
          </button>
          
          <button 
            onClick={onConfirm} 
            disabled={loading} 
            className="flex-1 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? 'Processing...' : <><Check size={20} /> Confirm Renewal</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenewalModal;