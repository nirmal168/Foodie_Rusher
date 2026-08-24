import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Key, ArrowRight, ArrowLeft, CheckCircle, Phone, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ForgetPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleQuickForgot = (selectedEmail) => {
    setEmail(selectedEmail);
    toast.success(`Selected test account: ${selectedEmail}`);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/forgot-password', { email });
      if (res.data?.otp) {
        setOtp(res.data.otp);
        toast.success(`Verification OTP: ${res.data.otp}`, { duration: 6000, icon: '🔑' });
      } else {
        toast.success(`OTP sent to ${email}! Please check your inbox.`);
      }
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter the OTP code received.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/verify-otp', { email, otp });
      toast.success('OTP verified! You can now reset your password.');
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/reset-password', { email, newPassword });
      toast.success('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-white flex items-center justify-center px-4 relative overflow-hidden">
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-zomato p-8 relative z-10 border border-slate-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/login')}
            className="w-10 h-10 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reset Password</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Step {step} of 3</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOtp} 
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors font-medium text-slate-900 text-sm placeholder:text-slate-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[12px] uppercase tracking-widest hover:bg-red-500 transition-colors shadow-xl shadow-slate-200 mt-6 flex items-center justify-center gap-2"
              >
                {loading ? 'Sending OTP...' : 'Send Reset OTP'}
                <ArrowRight size={16} />
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-black tracking-widest text-[9px]">Select Test Account</span></div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                 <button 
                   type="button" 
                   onClick={() => handleQuickForgot('customer@test.com')}
                   className="flex flex-col items-center justify-center py-2.5 border border-slate-100 rounded-2xl hover:bg-red-50 hover:border-red-100 transition-all shadow-sm gap-1 group"
                 >
                   <Mail size={18} className="text-red-500 group-hover:scale-110 transition-transform"/>
                   <span className="text-[9px] font-black uppercase tracking-tight text-slate-400 group-hover:text-red-500 transition-colors">Customer</span>
                 </button>
                 <button 
                   type="button" 
                   onClick={() => handleQuickForgot('staff@test.com')}
                   className="flex flex-col items-center justify-center py-2.5 border border-slate-100 rounded-2xl hover:bg-green-50 hover:border-green-100 transition-all shadow-sm gap-1 group"
                 >
                   <Phone size={18} className="text-green-500 group-hover:scale-110 transition-transform"/>
                   <span className="text-[9px] font-black uppercase tracking-tight text-slate-400 group-hover:text-green-500 transition-colors">Staff</span>
                 </button>
                 <button 
                   type="button" 
                   onClick={() => handleQuickForgot('owner@test.com')}
                   className="flex flex-col items-center justify-center py-2.5 border border-slate-100 rounded-2xl hover:bg-amber-50 hover:border-amber-100 transition-all shadow-sm gap-1 group"
                 >
                   <Globe size={18} className="text-blue-400 group-hover:scale-110 transition-transform"/>
                   <span className="text-[9px] font-black uppercase tracking-tight text-slate-400 group-hover:text-amber-500 transition-colors">Owner</span>
                 </button>
              </div>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleVerifyOtp} 
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">One-Time Password (OTP)</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors font-medium text-slate-900 text-sm placeholder:text-slate-300 tracking-[0.2em] text-center font-bold text-lg"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-1 ml-1">
                  Enter the 6-digit verification code sent to {email}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[12px] uppercase tracking-widest hover:bg-red-500 transition-colors shadow-xl shadow-slate-200 mt-6 flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying OTP...' : 'Verify OTP'}
                <ArrowRight size={16} />
              </button>
            </motion.form>
          )}

          {step === 3 && (
            <motion.form 
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleResetPassword} 
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors font-medium text-slate-900 text-sm placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors font-medium text-slate-900 text-sm placeholder:text-slate-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[12px] uppercase tracking-widest hover:bg-red-500 transition-colors shadow-xl shadow-slate-200 mt-6 flex items-center justify-center gap-2"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
                <CheckCircle size={16} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgetPassword;

