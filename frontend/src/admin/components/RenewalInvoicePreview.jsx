import React from 'react';
import { IndianRupee, ArrowRight } from 'lucide-react';

const RenewalInvoicePreview = React.forwardRef(({ memberData, renewalData, photoPreview }, ref) => {
  const invoiceDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  // Unique Invoice ID
  const uniqueId = `REN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div ref={ref} className="bg-white text-gray-900 font-sans mx-auto shadow-sm" style={{ width: '794px', minHeight: '1123px', padding: '40px' }}>
      <div className="border-2 border-primary-900 h-full p-8 relative flex flex-col justify-between">
        
        {/* TOP SECTION */}
        <div>
            {/* Header */}
            <header className="flex justify-between items-start border-b-4 border-gray-900 pb-6 mb-8">
            <div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">SANATAN GYM</h2>
                <div className="mt-2 text-sm font-semibold text-gray-600 space-y-1">
                    <p>123, Temple Road, Gym City</p>
                    <p>Gujarat, India - 380001</p>
                    <p>+91 98765 43210</p>
                </div>
            </div>
            <div className="text-right">
                <div className="bg-primary-600 text-white px-4 py-1 inline-block mb-2">
                    <h1 className="text-xl font-bold uppercase tracking-widest">RENEWAL RECEIPT</h1>
                </div>
                <p className="text-lg font-bold text-gray-800">#{uniqueId}</p>
                <p className="text-sm font-medium text-gray-500">Date: {invoiceDate}</p>
            </div>
            </header>

            {/* Member Info */}
            <section className="flex justify-between items-center mb-10 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex gap-4 items-center">
                    {photoPreview ? (
                        <img src={photoPreview} alt="Member" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 font-bold">NO PHOTO</div>
                    )}
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Member Details</p>
                        <h3 className="text-2xl font-bold text-gray-900 uppercase">{memberData.name}</h3>
                        <p className="text-sm font-medium text-gray-700">{memberData.mobile}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Renewal Period</p>
                    <div className="flex items-center gap-2 text-lg font-bold text-gray-800 justify-end">
                        <span>{formatDate(renewalData.previousEndDate)}</span>
                        <ArrowRight size={18} className="text-primary-500" />
                        <span>{formatDate(renewalData.newEndDate)}</span>
                    </div>
                    <p className="text-sm text-green-600 font-bold mt-1">
                        + {renewalData.duration} Month{renewalData.duration > 1 ? 's' : ''} Added
                    </p>
                </div>
            </section>

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
                        Membership Renewal
                        {memberData.focus_note && <div className="text-xs text-gray-500 font-normal mt-1">Note: {memberData.focus_note}</div>}
                    </td>
                    <td className="p-4 text-center text-sm font-medium text-gray-700">{renewalData.duration} Months</td>
                    <td className="p-4 text-right text-sm font-medium text-gray-700">₹{renewalData.pricePerMonth}</td>
                    <td className="p-4 text-right text-sm font-bold text-gray-800">₹{renewalData.subTotal}</td>
                </tr>
                </tbody>
            </table>
            </section>
            
            {/* Totals */}
            <section className="flex justify-end">
            <div className="w-80 space-y-3 bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{renewalData.subTotal}</span>
                </div>
                
                {/* Discount Row */}
                {renewalData.discount > 0 && (
                    <div className="flex justify-between text-sm font-bold text-red-500">
                        <span>Special Discount</span>
                        <span>- ₹{renewalData.discount}</span>
                    </div>
                )}

                <div className="border-t-2 border-gray-300 pt-3 mt-2 flex justify-between items-center">
                    <span className="font-black text-gray-900 text-xl uppercase">Total Paid</span>
                    <span className="font-black text-primary-600 text-3xl flex items-center">
                        <IndianRupee size={24} strokeWidth={3} />
                        {renewalData.finalTotal}
                    </span>
                </div>
            </div>
            </section>
        </div>

        {/* BOTTOM SECTION */}
        <div className="relative">
             {/* Stamp */}
            <div className="absolute bottom-10 left-10 transform -rotate-12 pointer-events-none opacity-15">
                <div className="border-8 border-green-600 px-8 py-4 text-6xl font-black uppercase tracking-widest text-green-600">
                    RENEWED
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

export default RenewalInvoicePreview;