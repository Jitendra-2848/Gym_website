import React from 'react';
import { IndianRupee } from 'lucide-react';

const InvoicePreview = React.forwardRef(({ memberData, pricingData, photoPreview }, ref) => {
  const invoiceDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const invoiceId = `INV-${Date.now().toString().slice(-6)}`;

  const startDate = memberData.startDate ? new Date(memberData.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
  const endDate = memberData.endDate ? new Date(memberData.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

  return (
    // Fixed width container to simulate A4 paper (210mm approx 794px)
    // min-h-[1123px] simulates A4 height
    <div ref={ref} className="bg-white text-gray-900 font-sans mx-auto shadow-sm" style={{ width: '794px', minHeight: '1123px', padding: '40px' }}>
      <div className="border-2 border-gray-800 h-full p-8 relative flex flex-col justify-between">
        
        {/* TOP SECTION */}
        <div>
            {/* Header */}
            <header className="flex justify-between items-start border-b-4 border-gray-800 pb-6 mb-8">
            <div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">SANATAN GYM</h2>
                <div className="mt-2 text-sm font-semibold text-gray-600 space-y-1">
                    <p>123, Temple Road, Gym City</p>
                    <p>Gujarat, India - 380001</p>
                    <p>+91 98765 43210 | contact@sanatangym.com</p>
                </div>
            </div>
            <div className="text-right">
                <div className="bg-gray-900 text-white px-4 py-1 inline-block mb-2">
                    <h1 className="text-2xl font-bold uppercase tracking-widest">INVOICE</h1>
                </div>
                <p className="text-lg font-bold text-gray-800">#{invoiceId}</p>
                <p className="text-sm font-medium text-gray-500">Date: {invoiceDate}</p>
            </div>
            </header>

            {/* Bill To Section */}
            <section className="flex justify-between items-start mb-10">
                <div className="w-1/2">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2 border-b border-gray-300 inline-block pb-1">Billed To</p>
                    <div className="flex gap-4 mt-2">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Member" className="w-20 h-20 rounded-lg object-cover border-2 border-gray-800" />
                        ) : (
                            <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold border-2 border-gray-300">NO PHOTO</div>
                        )}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 uppercase">{memberData.name}</h3>
                            <p className="text-sm font-medium text-gray-700 mt-1">{memberData.mobile}</p>
                            {memberData.email && <p className="text-sm text-gray-600">{memberData.email}</p>}
                        </div>
                    </div>
                </div>
                <div className="w-1/3 text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2 border-b border-gray-300 inline-block pb-1">Membership Details</p>
                    <div className="mt-2 space-y-1">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Start Date:</span>
                            <span className="text-sm font-bold text-gray-800">{startDate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">End Date:</span>
                            <span className="text-sm font-bold text-gray-800">{endDate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Duration:</span>
                            <span className="text-sm font-bold text-gray-800">{memberData.duration} Months</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Table */}
            <section className="mb-8">
            <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                <tr>
                    <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-y border-gray-300">Description</th>
                    <th className="p-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider border-y border-gray-300">Months</th>
                    <th className="p-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider border-y border-gray-300">Rate/Mo</th>
                    <th className="p-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider border-y border-gray-300">Amount</th>
                </tr>
                </thead>
                <tbody>
                <tr className="bg-white">
                    <td className="p-4 text-sm font-bold text-gray-800 border-b border-gray-200">
                    {pricingData.selectedPlan?.label || 'Custom'} Membership Plan
                    {memberData.focus_note && <div className="text-xs text-gray-500 font-normal mt-1">Note: {memberData.focus_note}</div>}
                    </td>
                    <td className="p-4 text-center text-sm font-medium text-gray-700 border-b border-gray-200">{memberData.duration}</td>
                    <td className="p-4 text-right text-sm font-medium text-gray-700 border-b border-gray-200">₹{pricingData.pricePerMonth}</td>
                    <td className="p-4 text-right text-sm font-bold text-gray-800 border-b border-gray-200">₹{pricingData.totalBeforeDiscount}</td>
                </tr>
                </tbody>
            </table>
            </section>
            
            {/* Totals */}
            <section className="flex justify-end">
            <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{pricingData.totalBeforeDiscount}</span>
                </div>
                
                {pricingData.tierSaving > 0 && (
                    <div className="flex justify-between text-sm font-medium text-green-600">
                        <span>Plan Savings</span>
                        <span>- ₹{pricingData.tierSaving}</span>
                    </div>
                )}

                {Number(memberData.extraDiscount) > 0 && (
                <div className="flex justify-between text-sm font-medium text-red-500">
                    <span>Extra Discount</span>
                    <span>- ₹{memberData.extraDiscount}</span>
                </div>
                )}

                <div className="border-t-2 border-gray-800 pt-3 mt-2 flex justify-between items-center">
                <span className="font-black text-gray-900 text-lg uppercase">Total</span>
                <span className="font-black text-gray-900 text-2xl flex items-center">
                    <IndianRupee size={22} strokeWidth={3} />
                    {pricingData.grandTotal}
                </span>
                </div>
            </div>
            </section>
        </div>

        {/* BOTTOM SECTION */}
        <div className="relative">
             {/* Stamp */}
            <div className="absolute bottom-20 left-0 transform -rotate-12 pointer-events-none opacity-10">
                <div className="border-8 border-gray-900 px-8 py-4 text-6xl font-black uppercase tracking-widest text-gray-900">
                    PAID
                </div>
            </div>

            {/* Terms / Footer */}
            <footer className="mt-12 pt-6 border-t border-gray-300 text-center">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Build Strength • Build Character</p>
                <p className="text-xs text-gray-400">
                    Membership is non-transferable and non-refundable. Please retain this invoice for your records.
                </p>
            </footer>
        </div>
      </div>
    </div>
  );
});

export default InvoicePreview;