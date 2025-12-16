import React, { useRef, useState } from 'react';
import { X, Download, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import InvoicePreview from './InvoicePreview';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, memberData, pricingData, photoPreview, loading }) => {
  const invoiceRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  // Debug: Log received data
  console.log('ConfirmationModal received:', { memberData, pricingData });

  const handleDownload = async () => {
    if (!invoiceRef.current) {
      alert("Invoice preview not ready. Please try again.");
      return;
    }
    
    setDownloading(true);
    
    try {
      const canvas = await html2canvas(invoiceRef.current, { 
        scale: 2,
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        windowWidth: 794,
        windowHeight: 1123
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ 
        orientation: 'portrait', 
        unit: 'mm', 
        format: 'a4' 
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = `SANATAN_GYM_Invoice_${(memberData?.name || 'Member').replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-orange-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={20} /> 
            Confirm Details & Download Invoice
          </h2>
          <button 
            onClick={onClose} 
            disabled={loading || downloading}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-auto bg-gray-200 p-4 flex justify-center items-start">
          <div 
            className="origin-top" 
            style={{ 
              transform: 'scale(0.75)', 
              transformOrigin: 'top center' 
            }}
          >
            <InvoicePreview 
              ref={invoiceRef} 
              memberData={memberData} 
              pricingData={pricingData} 
              photoPreview={photoPreview} 
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleDownload}
            disabled={downloading || loading}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download size={18} /> 
                Download Invoice
              </>
            )}
          </button>
          
          <button 
            onClick={onConfirm} 
            disabled={loading || downloading}
            className="flex-1 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-lg shadow-orange-600/20"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
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