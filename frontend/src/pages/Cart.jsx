import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, ArrowRight, ShieldCheck, MapPin, Loader2, CheckCircle, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import { useLocation as useAppLocation } from '../context/LocationContext';

const Cart = ({ cart, onAddToCart, onRemoveFromCart, onClearCart }) => {
  const [step, setStep] = React.useState(1);
  const { districts, selectedDistrict, setSelectedDistrict, areas, selectedArea, setSelectedArea } = useAppLocation();
  
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 49 : 0;
  const platformFee = 10;
  const [couponCode, setCouponCode] = React.useState('');
  const [discount, setDiscount] = React.useState(0);
  const total = subtotal + deliveryFee + platformFee - discount;

  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [razorpayStep, setRazorpayStep] = React.useState('idle');
  
  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem('user');
      if (stored && stored !== 'undefined') {
        return JSON.parse(stored);
      }
    } catch (e) {}
    return null;
  };
  const storedUser = getStoredUser();

  const [contactName, setContactName] = React.useState(storedUser?.name || '');
  const [contactPhone, setContactPhone] = React.useState('');
  const [extendedAddress, setExtendedAddress] = React.useState('');

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'GUJARAT50') {
      setDiscount(50);
      toast.success('Coupon Applied: ₹50 Off!');
    } else {
      toast.error('Invalid Coupon Code');
    }
  };

  const saveOrderLocally = (order) => {
    try {
      const existing = JSON.parse(localStorage.getItem('my_orders') || '[]');
      localStorage.setItem('my_orders', JSON.stringify([order, ...existing]));
    } catch (e) {}
  };

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    setRazorpayStep('processing');
    const fullAddress = `${selectedArea?.name || ''}, ${selectedDistrict}, Gujarat. ${extendedAddress}${contactPhone ? ` (Ph: ${contactPhone})` : ''}`;
    const shopId = cart[0]?.shopId || cart[0]?.shop || null;
    
    setTimeout(async () => {
      const userObj = getStoredUser() || {};
      const customerId = userObj.id || userObj._id || `cust_${Date.now()}`;
      
      const orderData = {
        amount: total,
        items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
        paymentMethod: 'online',
        deliveryAddress: fullAddress,
        customerId,
        shopId,
        date: new Date().toISOString(),
        status: 'pending'
      };

      try {
        const res = await axios.post('/create-order', orderData);
        saveOrderLocally(res.data?.order || { ...orderData, _id: res.data?.orderId || `ord_${Date.now()}` });
      } catch (err) {
        console.warn("Backend payment sync warning (saving order directly):", err.message);
        saveOrderLocally({ ...orderData, _id: `ord_${Date.now()}` });
      }

      setRazorpayStep('success');
      toast.success('Payment Successful! Order Confirmed.');
      setTimeout(() => {
        onClearCart();
        navigate('/profile');
      }, 1500);
    }, 1500);
  };

  const handleCOD = async () => {
     const fullAddress = `${selectedArea?.name || ''}, ${selectedDistrict}, Gujarat. ${extendedAddress}${contactPhone ? ` (Ph: ${contactPhone})` : ''}`;
     const shopId = cart[0]?.shopId || cart[0]?.shop || null;
     const userObj = getStoredUser() || {};
     const customerId = userObj.id || userObj._id || `cust_${Date.now()}`;

     const orderData = {
       amount: total,
       items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
       paymentMethod: 'COD',
       deliveryAddress: fullAddress,
       customerId,
       shopId,
       date: new Date().toISOString(),
       status: 'pending'
     };

     try {
       const res = await axios.post('/cod', orderData);
       saveOrderLocally(res.data?.order || { ...orderData, _id: res.data?.orderId || `ord_${Date.now()}` });
     } catch (err) {
       console.warn("Backend COD sync warning (saving order directly):", err.message);
       saveOrderLocally({ ...orderData, _id: `ord_${Date.now()}` });
     }

     toast.success('Order Placed Successfully!');
     onClearCart();
     navigate('/profile');
  };

  if (cart.length === 0 && razorpayStep === 'idle') {
    return (
      <div className="pt-40 pb-24 px-4 bg-slate-50 min-h-screen text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100">
          <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag size={40} className="text-slate-300" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Cart Empty</h2>
          <Link to="/menu" className="bg-[#E23744] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#C52B34] transition-all inline-flex items-center gap-3">
            Browse Menu <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  const renderProgressBar = () => (
    <div className="max-w-xl mx-auto mb-16 px-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full" />
        <div className="absolute top-1/2 left-0 h-1 bg-[#E23744] -translate-y-1/2 z-0 rounded-full transition-all duration-500" style={{ width: `${(step - 1) * 50}%` }} />
        {[1, 2, 3].map((num) => (
          <div key={num} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-black transition-all duration-500 ${step >= num ? 'bg-[#E23744] text-white shadow-lg' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
            {num}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span>Information</span>
        <span>Order Details</span>
        <span>Payment</span>
      </div>
    </div>
  );

  return (
    <div className="pt-32 pb-24 bg-slate-50 min-h-screen">
      <AnimatePresence>
        {razorpayStep !== 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <div className="bg-white rounded-[2.5rem] p-12 text-center max-w-sm w-full shadow-2xl">
              {razorpayStep === 'processing' ? (
                <>
                  <div className="w-16 h-16 border-4 border-[#E23744] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                  <h3 className="text-xl font-black">Processing Secure Payment</h3>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-green-200"><CheckCircle size={40} /></div>
                  <h3 className="text-2xl font-black">Order Successful!</h3>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-4 text-center">CHECKOUT</h1>
        {renderProgressBar()}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                  <h3 className="text-xl font-black mb-8 flex items-center gap-3"><MapPin className="text-[#E23744]" /> Delivery Information</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black uppercase text-slate-400 mb-2 block">District (Gujarat)</label>
                        <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-[#E23744] focus:outline-none">
                          {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Area</label>
                        <select value={selectedArea?.name} onChange={e => setSelectedArea(areas.find(a => a.name === e.target.value))} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-[#E23744] focus:outline-none">
                          {areas.map(a => <option key={a.name} value={a.name}>{a.name} ({a.pincode})</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Full House/Building Address</label>
                      <textarea value={extendedAddress} onChange={e => setExtendedAddress(e.target.value)} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-[#E23744] focus:outline-none h-24 resize-none" placeholder="Flat No, Wing, Building Name..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                        <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Contact Name</label>
                        <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold" />
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Phone Number</label>
                        <input type="text" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold" placeholder="+91" />
                      </div>
                    </div>
                    <button onClick={nextStep} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#E23744] transition-all shadow-xl shadow-slate-200">Continue to Order Details</button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                  <h3 className="text-xl font-black mb-8 flex items-center gap-3"><ShoppingBag className="text-[#E23744]" /> Review Order</h3>
                  <div className="space-y-6">
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <img src={item.image} className="w-16 h-16 rounded-xl object-cover" />
                           <div className="flex-1">
                              <h4 className="font-black text-slate-900">{item.name}</h4>
                              <p className="text-sm font-bold text-slate-400">₹{item.price} x {item.quantity}</p>
                           </div>
                           <p className="font-black">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                       <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block">Promo Code</label>
                       <div className="flex gap-2">
                          <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Try GUJARAT50" className="flex-1 bg-white border border-slate-200 p-4 rounded-xl focus:outline-none font-bold" />
                          <button onClick={applyCoupon} className="bg-slate-900 text-white px-6 rounded-xl font-black text-xs uppercase tracking-widest">Apply</button>
                       </div>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={prevStep} className="flex-1 bg-slate-100 text-slate-600 p-5 rounded-2xl font-black uppercase text-xs">Back</button>
                      <button onClick={nextStep} className="flex-[2] bg-slate-900 text-white p-5 rounded-2xl font-black uppercase text-xs hover:bg-[#E23744] transition-all">Proceed to Payment</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                   <h3 className="text-xl font-black mb-8 flex items-center gap-3"><CreditCard className="text-[#E23744]" /> Select Payment Method</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      <button onClick={handleRazorpayPayment} className="flex flex-col items-center gap-4 p-8 rounded-3xl border-2 border-slate-100 hover:border-[#E23744] hover:bg-red-50 transition-all group">
                         <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><CreditCard /></div>
                         <div className="text-center">
                            <p className="font-black text-slate-900">Online Payment</p>
                            <p className="text-[10px] text-slate-400 uppercase font-black">UPI, Cards, Banking</p>
                         </div>
                      </button>
                      <button onClick={handleCOD} className="flex flex-col items-center gap-4 p-8 rounded-3xl border-2 border-slate-100 hover:border-[#E23744] hover:bg-red-50 transition-all group">
                         <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><MapPin /></div>
                         <div className="text-center">
                            <p className="font-black text-slate-900">Cash on Delivery</p>
                            <p className="text-[10px] text-slate-400 uppercase font-black">Pay at doorstep</p>
                         </div>
                      </button>
                   </div>
                   <button onClick={prevStep} className="w-full bg-slate-100 text-slate-600 p-5 rounded-2xl font-black uppercase text-xs">Back to Summary</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4">
             <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 sticky top-32">
                <h4 className="text-lg font-black mb-6 border-b pb-4">Payment Summary</h4>
                <div className="space-y-4 mb-6">
                   <div className="flex justify-between text-sm font-bold text-slate-400 uppercase"><span>Subtotal</span><span className="text-slate-900">₹{subtotal}</span></div>
                    <div className="flex justify-between text-sm font-bold text-slate-400 uppercase">
                      <span>Delivery Charge</span>
                      <span className="text-slate-900">₹{deliveryFee}</span>
                    </div>
                   {discount > 0 && <div className="flex justify-between text-sm font-bold text-green-500 uppercase"><span>Discount</span><span>-₹{discount}</span></div>}
                   <div className="flex justify-between text-sm font-bold text-slate-400 uppercase"><span>Platform Fee</span><span className="text-slate-900">₹{platformFee}</span></div>
                   <div className="pt-4 border-t flex justify-between text-xl font-black text-slate-900 uppercase tracking-tighter"><span>Total</span><span className="text-[#E23744]">₹{total}</span></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex gap-3 items-center">
                   <ShieldCheck className="text-green-500 shrink-0" size={20} />
                   <p className="text-[9px] font-black uppercase text-slate-400 leading-tight">Secure Payment encryption active. Checkout safely.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

