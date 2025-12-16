import React from 'react';
import { IndianRupee, Phone, Mail, MapPin, Calendar, User, Dumbbell } from 'lucide-react';

const InvoicePreview = React.forwardRef(({ memberData, pricingData, photoPreview }, ref) => {
  
  // Debug log
  console.log('InvoicePreview received:', { memberData, pricingData });

  // Generate Invoice Details
  const invoiceDate = new Date().toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
  
  const invoiceId = `INV-${Date.now().toString().slice(-8).toUpperCase()}`;
  
  // Format Dates
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

  // ========================================
  // SAFE DATA ACCESS WITH MULTIPLE FALLBACKS
  // ========================================
  
  // Member Data - Handle different property name variations
  const safeData = {
    name: memberData?.name || 'N/A',
    mobile: memberData?.mobile || 'N/A',
    email: memberData?.email || '',
    duration: memberData?.duration || memberData?.duration_months || 1,
    focus_note: memberData?.focus_note || memberData?.focusNote || '',
    extraDiscount: Number(memberData?.extraDiscount || memberData?.discount || 0),
    startDate: memberData?.startDate || memberData?.start_date || null,
    endDate: memberData?.endDate || memberData?.end_date || null
  };

  // Pricing Data - Handle different property name variations
  const safePricing = {
    // Plan label
    planLabel: pricingData?.selectedPlan?.label || 
               pricingData?.planLabel || 
               `${safeData.duration} Month`,
    
    // Price per month
    pricePerMonth: Number(
      pricingData?.pricePerMonth || 
      pricingData?.price_per_month || 
      pricingData?.monthlyRate ||
      (pricingData?.totalBeforeDiscount && safeData.duration 
        ? Math.round(pricingData.totalBeforeDiscount / safeData.duration) 
        : 0)
    ),
    
    // Total before discount (subtotal)
    totalBeforeDiscount: Number(
      pricingData?.totalBeforeDiscount || 
      pricingData?.subTotal || 
      pricingData?.subtotal ||
      pricingData?.total ||
      0
    ),
    
    // Tier/Plan savings
    tierSaving: Number(
      pricingData?.tierSaving || 
      pricingData?.planSaving || 
      pricingData?.saving ||
      0
    ),
    
    // Grand total (final amount)
    grandTotal: Number(
      pricingData?.grandTotal || 
      pricingData?.finalTotal || 
      pricingData?.total ||
      pricingData?.amount ||
      0
    )
  };

  // Calculate if not provided
  if (safePricing.grandTotal === 0 && safePricing.totalBeforeDiscount > 0) {
    safePricing.grandTotal = safePricing.totalBeforeDiscount - safePricing.tierSaving - safeData.extraDiscount;
  }

  if (safePricing.pricePerMonth === 0 && safePricing.totalBeforeDiscount > 0) {
    safePricing.pricePerMonth = Math.round(safePricing.totalBeforeDiscount / safeData.duration);
  }

  const startDate = formatDate(safeData.startDate);
  const endDate = formatDate(safeData.endDate);

  return (
    <div 
      ref={ref} 
      className="bg-white text-gray-900 font-sans mx-auto" 
      style={{ width: '794px', minHeight: '1123px', padding: '0' }}
    >
      {/* Main Container */}
      <div className="h-full flex flex-col">
        
        {/* ========== HEADER SECTION ========== */}
        <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-10 py-8">
          <div className="flex justify-between items-start">
            {/* Logo & Gym Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Dumbbell size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">SANATAN GYM</h1>
                  <p className="text-orange-400 text-sm font-semibold tracking-widest">BUILD STRENGTH • BUILD CHARACTER</p>
                </div>
              </div>
              
              <div className="mt-4 space-y-1 text-gray-300 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-orange-400" />
                  <span>123, Temple Road, Gym City, Gujarat - 380001</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-orange-400" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-orange-400" />
                  <span>contact@sanatangym.com</span>
                </div>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="text-right">
              <div className="bg-orange-500 text-white px-6 py-2 inline-block rounded-lg mb-3">
                <h2 className="text-2xl font-black tracking-wider">INVOICE</h2>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-white">#{invoiceId}</p>
                <p className="text-gray-400 text-sm">
                  <span className="text-gray-500">Date:</span> {invoiceDate}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ========== BODY SECTION ========== */}
        <div className="flex-1 px-10 py-8">
          
          {/* Member & Membership Info */}
          <section className="flex gap-8 mb-10">
            
            {/* Billed To */}
            <div className="flex-1 bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-4 flex items-center gap-2">
                <User size={14} className="text-orange-500" />
                Billed To
              </p>
              
              <div className="flex gap-4">
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Member" 
                    className="w-20 h-20 rounded-xl object-cover border-2 border-orange-200 shadow-sm" 
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 border-2 border-gray-300">
                    <User size={32} />
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 uppercase">{safeData.name}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone size={12} className="text-gray-400" />
                      {safeData.mobile}
                    </p>
                    {safeData.email && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Mail size={12} className="text-gray-400" />
                        {safeData.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Membership Period */}
            <div className="w-64 bg-orange-50 rounded-2xl p-6 border border-orange-200">
              <p className="text-xs text-orange-600 uppercase font-bold tracking-wider mb-4 flex items-center gap-2">
                <Calendar size={14} />
                Membership Period
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Start</span>
                  <span className="text-sm font-bold text-gray-800 bg-white px-3 py-1 rounded-lg">{startDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">End</span>
                  <span className="text-sm font-bold text-gray-800 bg-white px-3 py-1 rounded-lg">{endDate}</span>
                </div>
                <div className="border-t border-orange-200 pt-3 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Duration</span>
                  <span className="text-sm font-black text-orange-600 bg-orange-100 px-3 py-1 rounded-lg">
                    {safeData.duration} Month{safeData.duration > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ========== INVOICE TABLE ========== */}
          <section className="mb-8">
            <table className="w-full border-collapse overflow-hidden rounded-xl">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Description</th>
                  <th className="p-4 text-center text-xs font-bold uppercase tracking-wider">Duration</th>
                  <th className="p-4 text-right text-xs font-bold uppercase tracking-wider">Rate</th>
                  <th className="p-4 text-right text-xs font-bold uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                        <Dumbbell size={20} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{safePricing.planLabel} Membership Plan</p>
                        <p className="text-xs text-gray-500 mt-1">Full gym access with all facilities</p>
                        {safeData.focus_note && (
                          <p className="text-xs text-orange-600 mt-2 bg-orange-50 inline-block px-2 py-1 rounded">
                            Note: {safeData.focus_note}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">
                      {safeData.duration} Mo
                    </span>
                  </td>
                  <td className="p-5 text-right text-sm text-gray-600">
                    ₹{safePricing.pricePerMonth?.toLocaleString('en-IN')}/mo
                  </td>
                  <td className="p-5 text-right text-lg font-bold text-gray-900">
                    ₹{safePricing.totalBeforeDiscount?.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* ========== TOTALS SECTION ========== */}
          <section className="flex justify-end">
            <div className="w-80 bg-gray-50 rounded-2xl p-6 border border-gray-200">
              
              {/* Subtotal */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-sm font-medium text-gray-700">
                  ₹{safePricing.totalBeforeDiscount?.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Plan Savings */}

              {/* Extra Discount */}
              {safeData.extraDiscount > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-sm text-red-500 flex items-center gap-1">
                    ★ Special Discount
                  </span>
                  <span className="text-sm font-bold text-red-500">
                    - ₹{safeData.extraDiscount?.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {/* Grand Total */}
              <div className="flex justify-between items-center pt-4 mt-2">
                <span className="text-lg font-black text-gray-900 uppercase">Total Paid</span>
                <span className="text-2xl font-black text-orange-600 flex items-center">
                  <IndianRupee size={22} strokeWidth={3} />
                  {safePricing.grandTotal?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* ========== FOOTER SECTION ========== */}
        <footer className="bg-gray-100 px-10 py-6 mt-auto relative">
          
          {/* Paid Stamp */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.07] rotate-[-15deg]">
            <div className="border-[10px] border-green-600 text-green-600 px-12 py-6 text-7xl font-black uppercase tracking-widest rounded-xl">
              PAID
            </div>
          </div>

          {/* Footer Content */}
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-px w-12 bg-gray-300"></div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Thank You For Choosing Us</p>
              <div className="h-px w-12 bg-gray-300"></div>
            </div>
            
            <p className="text-xs text-gray-400 max-w-lg mx-auto">
              This is a computer-generated invoice. Membership is non-transferable and non-refundable. 
              Please retain this invoice for your records.
            </p>

            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-400">
              <span>www.sanatangym.com</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>@sanatangym</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>GST: 24XXXXX1234X1ZX</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
});

InvoicePreview.displayName = 'InvoicePreview';

export default InvoicePreview;