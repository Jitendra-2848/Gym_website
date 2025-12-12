import React, { useRef } from 'react';
import { X, Download, Check, AlertTriangle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import InvoicePreview from './InvoicePreview';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, memberData, pricingData, photoPreview, loading }) => {
  const invoiceRef = useRef(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!invoiceRef.current) return;
    
    try {
        const canvas = await html2canvas(invoiceRef.current, { 
            scale: 2, // Higher scale for better quality
            useCORS: true, 
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF({ 
            orientation: 'p', 
            unit: 'mm', 
            format: 'a4' 
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`FITGYM_Invoice_${memberData.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={20} /> 
            Confirm Details & Download Invoice
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto bg-gray-100 flex-1 flex justify-center">
          {/* This component is what gets printed */}
          <InvoicePreview 
            ref={invoiceRef} 
            memberData={memberData} 
            pricingData={pricingData} 
            photoPreview={photoPreview} 
          />
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <button 
            onClick={handleDownload} 
            className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={18} /> Download Invoice
          </button>
          
          <button 
            onClick={onConfirm} 
            disabled={loading} 
            className="flex-1 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary-600/20"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check size={20} />
                Confirm & Add Member
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;