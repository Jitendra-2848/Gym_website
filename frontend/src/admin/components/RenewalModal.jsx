import React, { useRef, useState } from 'react';
import { X, Download, Check, RefreshCw, Plus, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import RenewalInvoicePreview from './RenewalInvoicePreview';

const RenewalModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  memberData, 
  renewalData, 
  photoPreview, 
  loading 
}) => {
  const invoiceRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  // Determine action type
  const isExtension = renewalData?.actionType === 'extension';
  const duration = renewalData?.duration || 1;

  const handleDownload = async () => {
    if (!invoiceRef.current) {
      alert("Invoice preview not ready. Please try again.");
      return;
    }
    
    setDownloading(true);
    
    try {
      // High quality canvas capture
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
      
      // Generate filename
      const memberName = memberData?.name?.replace(/\s+/g, '_') || 'Member';
      const actionType = isExtension ? 'EXTENSION' : 'RENEWAL';
      const timestamp = new Date().toISOString().split('T')[0];
      
      pdf.save(`${actionType}_${memberName}_${timestamp}.pdf`);
      
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!loading && !downloading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className={`p-4 border-b border-gray-200 flex justify-between items-center ${isExtension ? 'bg-blue-50' : 'bg-green-50'}`}>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {isExtension ? (
              <>
                <Plus className="text-blue-600" size={20} /> 
                Confirm Extension
              </>
            ) : (
              <>
                <RefreshCw className="text-green-600" size={20} /> 
                Confirm Renewal
              </>
            )}
          </h2>
          <button 
            onClick={handleClose} 
            disabled={loading || downloading}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Type Info Banner */}
        <div className={`px-4 py-3 ${isExtension ? 'bg-blue-100 border-b border-blue-200' : 'bg-green-100 border-b border-green-200'}`}>
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle size={16} className={isExtension ? 'text-blue-600' : 'text-green-600'} />
            <span className={`font-medium ${isExtension ? 'text-blue-800' : 'text-green-800'}`}>
              {isExtension 
                ? `Extending membership by ${duration} month(s). Duration will be stacked.`
                : `Starting fresh membership from today for ${duration} month(s).`
              }
            </span>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-auto bg-gray-200 p-4 flex justify-center items-start">
          {/* Scale down for visual display, PDF captures at full size */}
          <div 
            className="origin-top" 
            style={{ 
              transform: 'scale(0.75)', 
              transformOrigin: 'top center' 
            }}
          >
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
          {/* Download Button */}
          <button 
            onClick={handleDownload}
            disabled={downloading || loading}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {downloading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download size={18} /> 
                Download Receipt
              </>
            )}
          </button>
          
          {/* Confirm Button */}
          <button 
            onClick={handleConfirm} 
            disabled={loading || downloading}
            className={`flex-1 py-3 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all ${
              isExtension 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check size={20} /> 
                Confirm {isExtension ? 'Extension' : 'Renewal'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenewalModal;