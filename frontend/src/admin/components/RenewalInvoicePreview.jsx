import React from 'react';
import { IndianRupee, ArrowRight, RefreshCw, Plus } from 'lucide-react';

const RenewalInvoicePreview = React.forwardRef(({ memberData, renewalData, photoPreview }, ref) => {
  
  // 1. Generate Invoice Date
  const invoiceDate = new Date().toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  
  // 2. Generate Unique ID
  const uniqueId = `REN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

  // 3. Date Formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // 4. Determine Action Type
  const isExtension = renewalData?.actionType === 'extension';
  
  // 5. Safe Data Handling (FIXED THE NULL ISSUE HERE)
  const safeRenewalData = {
    duration: renewalData?.duration || 1,
    
    // Dates
    previousEndDate: renewalData?.previousEndDate || null,
    newEndDate: renewalData?.newEndDate || null,
    
    // FIX: If newStartDate is null (common in fresh renewals), default to TODAY
    newStartDate: renewalData?.newStartDate || new Date().toISOString(),
    
    // Durations
    previousDuration: renewalData?.previousDuration || 0,
    newDuration: renewalData?.newDuration || renewalData?.duration || 1,
    
    // Money
    pricePerMonth: renewalData?.pricePerMonth || 0,
    subTotal: renewalData?.subTotal || 0,
    discount: renewalData?.discount || 0,
    finalTotal: renewalData?.finalTotal || 0,
    actionType: renewalData?.actionType || 'renewal'
  };

  // Safe Member Data
  const safeMemberData = {
    name: memberData?.name || 'N/A',
    mobile: memberData?.mobile || 'N/A',
    focus_note: memberData?.focus_note || ''
  };

  return (
    <div 
      ref={ref} 
      className="bg-white text-gray-900 font-sans mx-auto shadow-sm" 
      style={{ width: '794px', minHeight: '1123px', padding: '40px' }}
    >
      <div className="border-2 border-gray-800 h-full p-8 relative flex flex-col justify-between">
        
        {/* TOP SECTION */}
        <div>
          {/* Header */}
          <header className="flex justify-between items-start border-b-4 border-gray-900 pb-6 mb-8">
            <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
                SANATAN GYM
              </h2>
              <div className="mt-2 text-sm font-semibold text-gray-600 space-y-1">
                <p>123, Temple Road, Gym City</p>
                <p>Gujarat, India - 380001</p>
                <p>+91 98765 43210</p>
              </div>
            </div>
            <div className="text-right">
              <div 
                className={`${isExtension ? 'bg-blue-600' : 'bg-green-600'} text-white px-4 py-1 inline-block mb-2`}
              >
                <h1 className="text-xl font-bold uppercase tracking-widest">
                  {isExtension ? 'EXTENSION RECEIPT' : 'RENEWAL RECEIPT'}
                </h1>
              </div>
              <p className="text-lg font-bold text-gray-800">#{uniqueId}</p>
              <p className="text-sm font-medium text-gray-500">Date: {invoiceDate}</p>
            </div>
          </header>

          {/* Member Info */}
          <section className="flex justify-between items-center mb-10 bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="flex gap-4 items-center">
              {photoPreview ? (
                <img 
                  src={photoPreview} 
                  alt="Member" 
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm" 
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 font-bold text-xs">
                  NO PHOTO
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Member Details</p>
                <h3 className="text-2xl font-bold text-gray-900 uppercase">{safeMemberData.name}</h3>
                <p className="text-sm font-medium text-gray-700">{safeMemberData.mobile}</p>
              </div>
            </div>
            
            {/* Date Range Logic */}
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                {isExtension ? 'Extension Period' : 'Membership Period'}
              </p>
              
              {isExtension ? (
                // EXTENSION: Old End Date -> New End Date
                <>
                  <div className="flex items-center gap-2 text-lg font-bold text-gray-800 justify-end">
                    <span>{formatDate(safeRenewalData.previousEndDate)}</span>
                    <ArrowRight size={18} className="text-blue-500" />
                    <span>{formatDate(safeRenewalData.newEndDate)}</span>
                  </div>
                  <p className="text-sm text-blue-600 font-bold mt-1 flex items-center justify-end gap-1">
                    <Plus size={14} />
                    {safeRenewalData.duration} Month{safeRenewalData.duration > 1 ? 's' : ''} Extended
                  </p>
                </>
              ) : (
                // RENEWAL: Start Date (Today) -> New End Date
                <>
                  <div className="flex items-center gap-2 text-lg font-bold text-gray-800 justify-end">
                    <span>{formatDate(safeRenewalData.newStartDate)}</span>
                    <ArrowRight size={18} className="text-green-500" />
                    <span>{formatDate(safeRenewalData.newEndDate)}</span>
                  </div>
                  <p className="text-sm text-green-600 font-bold mt-1 flex items-center justify-end gap-1">
                    <RefreshCw size={14} />
                    {safeRenewalData.duration} Month{safeRenewalData.duration > 1 ? 's' : ''} Plan
                  </p>
                </>
              )}
            </div>
          </section>

          {/* Extension Summary Stack */}
          {isExtension && (
            <section className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm font-bold text-blue-800 flex items-center gap-2">
                <Plus size={16} />
                Duration Stacked: {safeRenewalData.previousDuration} months + {safeRenewalData.duration} months = {safeRenewalData.newDuration} months total
              </p>
            </section>
          )}

          {/* Table */}
          <section className="mb-8">
            <table className="w-full border-collapse">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Description</th>
                  <th className="p-4 text-center text-xs font-bold uppercase tracking-wider">Duration</th>
                  <th className="p-4 text-right text-xs font-bold uppercase tracking-wider">Rate</th>
                  <th className="p-4 text-right text-xs font-bold uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b border-gray-200">
                  <td className="p-4 text-sm font-bold text-gray-800">
                    Gym Membership {isExtension ? 'Extension' : 'Renewal'}
                    {safeMemberData.focus_note && (
                      <div className="text-xs text-gray-500 font-normal mt-1">
                        Note: {safeMemberData.focus_note}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-center text-sm font-medium text-gray-700">
                    {safeRenewalData.duration} Month{safeRenewalData.duration > 1 ? 's' : ''}
                  </td>
                  <td className="p-4 text-right text-sm font-medium text-gray-700">
                    ₹{safeRenewalData.pricePerMonth?.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-right text-sm font-bold text-gray-800">
                    ₹{safeRenewalData.subTotal?.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
          
          {/* Totals */}
          <section className="flex justify-end">
            <div className="w-80 space-y-3 bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between text-sm font-medium text-gray-600">
                <span>Subtotal</span>
                <span>₹{safeRenewalData.subTotal?.toLocaleString('en-IN')}</span>
              </div>
              
              {/* Discount Row */}
              {safeRenewalData.discount > 0 && (
                <div className="flex justify-between text-sm font-bold text-red-500">
                  <span>Special Discount</span>
                  <span>- ₹{safeRenewalData.discount?.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="border-t-2 border-gray-300 pt-3 mt-2 flex justify-between items-center">
                <span className="font-black text-gray-900 text-xl uppercase">Total Paid</span>
                <span className={`font-black ${isExtension ? 'text-blue-600' : 'text-green-600'} text-3xl flex items-center`}>
                  <IndianRupee size={24} strokeWidth={3} />
                  {safeRenewalData.finalTotal?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* BOTTOM SECTION */}
        <div className="relative">
          {/* Stamp */}
          <div className="absolute bottom-10 left-10 transform -rotate-12 pointer-events-none opacity-15">
            <div className={`border-8 ${isExtension ? 'border-blue-600 text-blue-600' : 'border-green-600 text-green-600'} px-8 py-4 text-6xl font-black uppercase tracking-widest`}>
              {isExtension ? 'EXTENDED' : 'RENEWED'}
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-gray-300 text-center">
            <p className="text-sm font-bold text-gray-800">Thank you for continuing with SANATAN GYM!</p>
            <p className="text-xs text-gray-500 mt-1">Computer generated invoice.</p>
          </footer>
        </div>
      </div>
    </div>
  );
});

RenewalInvoicePreview.displayName = 'RenewalInvoicePreview';

export default RenewalInvoicePreview;