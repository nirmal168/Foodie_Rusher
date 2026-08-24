import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, LogIn, Globe, Shield, ChefHat, Bike, Phone, CheckCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const Auth = ({ defaultIsLogin = true }) => {
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('customer');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', inviteCode: '', phone: '' });
  const navigate = useNavigate();
  const { login, register, loginWithToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const user = await login(formData.email, formData.password, role);
        if (user.role !== role) {
          toast.error(`This account is not a ${role} account. Please select the correct role.`);
          return;
        }
        toast.success(`Welcome back! Logged in as ${role}.`);
        navigate('/');
      } else {
        await register(formData.name, formData.email, formData.password, role, formData.inviteCode, formData.phone);
        toast.success(`Welcome! Your ${role} account has been created.`);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || (err.message === 'Network Error' ? 'Cannot connect to backend server. Please make sure the backend is running on port 5000.' : (err.message || 'Authentication failed')));
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuickLogin = async (email, password, targetRole) => {
    try {
      if (isLogin) {
        setIsLogin(true);
        setRole(targetRole);
        setFormData({
          name: '',
          email: email,
          password: password,
          inviteCode: ''
        });
        const loginToastId = toast.loading('Logging in...');
        const user = await login(email, password, targetRole);
        if (user.role !== targetRole) {
          toast.error(`This account is not a ${targetRole} account. Please select the correct role.`, { id: loginToastId });
          return;
        }
        toast.success(`Welcome back! Logged in as ${targetRole}.`, { id: loginToastId });
        navigate('/');
      } else {
        // Register Mode Autofill
        if (targetRole === 'owner') {
          toast.success("Owner already exists! Switching to Login Mode...");
          setIsLogin(true);
          setRole('owner');
          setFormData({
            name: '',
            email: 'owner@test.com',
            password: 'password123',
            inviteCode: ''
          });
          return;
        }
        
        const testName = targetRole === 'customer' ? 'Test Customer' : 'Test Staff';
        const testEmail = targetRole === 'customer' 
          ? `cust_${Math.floor(1000 + Math.random() * 9000)}@test.com` 
          : `stf_${Math.floor(1000 + Math.random() * 9000)}@test.com`;
        
        setRole(targetRole);
        setFormData({
          name: testName,
          email: testEmail,
          password: 'password123',
          inviteCode: targetRole === 'staff' ? '701674' : ''
        });
        toast.success(`Filled ${targetRole} sign-up form with test credentials!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || (err.message === 'Network Error' ? 'Cannot connect to backend server. Please make sure the backend is running on port 5000.' : (err.message || 'Authentication failed')));
    }
  };

  const roles = [
    { id: 'customer', name: 'Customer', icon: User },
    { id: 'owner', name: 'Restaurant Owner', icon: ChefHat },
    { id: 'staff', name: 'Delivery Staff', icon: Bike },
  ];

  const getTheme = (roleType = role) => {
    switch(roleType) {
      case 'staff': return { bg: 'bg-green-500', hoverBg: 'hover:bg-green-500', text: 'text-green-500', hoverText: 'hover:text-green-500', ring: 'focus:ring-green-500', border: 'focus:border-green-500', lightBg: 'bg-green-50', outline: 'ring-1 ring-green-500', borderCurrent: 'border-green-500' };
      case 'owner': return { bg: 'bg-amber-500', hoverBg: 'hover:bg-amber-500', text: 'text-amber-500', hoverText: 'hover:text-amber-500', ring: 'focus:ring-amber-500', border: 'focus:border-amber-500', lightBg: 'bg-amber-50', outline: 'ring-1 ring-amber-500', borderCurrent: 'border-amber-500' };
      default: return { bg: 'bg-red-500', hoverBg: 'hover:bg-red-500', text: 'text-red-500', hoverText: 'hover:text-red-500', ring: 'focus:ring-red-500', border: 'focus:border-red-500', lightBg: 'bg-red-50', outline: 'ring-1 ring-red-500', borderCurrent: 'border-red-500' };
    }
  };

  const theme = getTheme();

  return (
    <div className="min-h-screen pt-24 pb-16 bg-white flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-500">
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-zomato p-8 relative z-10 border border-slate-100"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-slate-400 font-medium text-sm">
            {isLogin
              ? `Sign in to your ${role} portal`
              : `Create your ${role} account on Foodie Rusher`}
          </p>
        </div>

        {/* Role Selector Dashboard Style */}
        <div className="mb-8 overflow-x-auto no-scrollbar pb-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block text-center">Select your role</label>
          <div className="flex justify-between gap-3">
            {roles.map((r) => {
              const rTheme = getTheme(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border transition-all flex-1 min-w-[100px] ${
                    role === r.id 
                      ? `${rTheme.lightBg} ${rTheme.borderCurrent} ${rTheme.text} shadow-md ${rTheme.outline}` 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-white transition-all shadow-sm'
                  }`}
                >
                  <r.icon size={20} />
                  <span className="text-[10px] font-black uppercase tracking-tighter text-center">{r.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Role Description Banner */}
        <motion.div
          key={role}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-3 rounded-2xl border ${theme.lightBg} ${theme.borderCurrent} flex items-center gap-3`}
        >
          <div className={`w-8 h-8 rounded-full ${theme.bg} flex items-center justify-center shrink-0`}>
            {role === 'customer' && <User size={14} className="text-white" />}
            {role === 'owner' && <ChefHat size={14} className="text-white" />}
            {role === 'staff' && <Bike size={14} className="text-white" />}
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${theme.text}`}>
              {role === 'customer' && 'Customer Portal'}
              {role === 'owner' && 'Restaurant Owner Portal'}
              {role === 'staff' && 'Delivery Staff Portal'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              {role === 'customer' && 'Browse menu, track orders & manage your account'}
              {role === 'owner' && 'Manage orders, update status & run your restaurant'}
              {role === 'staff' && 'View deliveries, share location & complete orders'}
            </p>
          </div>
        </motion.div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <AnimatePresence mode='wait'>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    name="name"
                    type="text"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    required
                    className={`w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-1 ${theme.ring} ${theme.border} transition-colors font-medium text-slate-900 text-sm placeholder:text-slate-300`}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLogin ? (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address or Mobile Number</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  name="email"
                  type="text"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your email or mobile number"
                  required
                  className={`w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-1 ${theme.ring} ${theme.border} transition-colors font-medium text-slate-900 text-sm placeholder:text-slate-300`}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    required
                    className={`w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-1 ${theme.ring} ${theme.border} transition-colors font-medium text-slate-900 text-sm placeholder:text-slate-300`}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Mobile Number (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your mobile number"
                    className={`w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-1 ${theme.ring} ${theme.border} transition-colors font-medium text-slate-900 text-sm placeholder:text-slate-300`}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Password</label>
              {isLogin && (
                <button 
                  type="button" 
                  onClick={() => navigate('/forgot-password')}
                  className={`text-[10px] font-bold uppercase tracking-widest ${theme.text} hover:underline`}
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password || ''}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                className={`w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-1 ${theme.ring} ${theme.border} transition-colors font-medium text-slate-900 text-sm placeholder:text-slate-300`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {!isLogin && role === 'staff' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-1.5"
              >
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic underline decoration-green-500/30">Restaurant Invite Code</label>
                <div className="relative">
                  <Bike className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    name="inviteCode"
                    type="text"
                    value={formData.inviteCode || ''}
                    onChange={handleInputChange}
                    placeholder="Enter 6-digit code (e.g. 701674)"
                    required
                    className={`w-full pl-12 pr-4 py-3 bg-green-50/30 border border-green-100 rounded-xl focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors font-black text-slate-900 text-sm placeholder:text-slate-300 uppercase tracking-widest`}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className={`w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[12px] uppercase tracking-widest ${theme.hoverBg} transition-colors shadow-xl shadow-slate-200 mt-6 flex items-center justify-center gap-2`}
          >
            {isLogin ? 'Sign In Now' : 'Create Account'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-black tracking-widest text-[10px]">Instant 1-Click Demo Portals</span></div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
           <button 
             type="button" 
             onClick={() => handleQuickLogin('customer@test.com', 'password123', 'customer')}
             className="flex flex-col items-center justify-center py-3 border border-slate-100 rounded-2xl hover:bg-red-50 hover:border-red-200 transition-all shadow-sm gap-1 group"
             title="Login as Customer"
           >
             <User size={18} className="text-red-500 group-hover:scale-110 transition-transform"/>
             <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 group-hover:text-red-600 transition-colors">Customer</span>
           </button>
           <button 
             type="button" 
             onClick={() => handleQuickLogin('owner@test.com', 'password123', 'owner')}
             className="flex flex-col items-center justify-center py-3 border border-slate-100 rounded-2xl hover:bg-amber-50 hover:border-amber-200 transition-all shadow-sm gap-1 group"
             title="Login as Restaurant Owner"
           >
             <ChefHat size={18} className="text-amber-500 group-hover:scale-110 transition-transform"/>
             <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 group-hover:text-amber-600 transition-colors">Owner</span>
           </button>
           <button 
             type="button" 
             onClick={() => handleQuickLogin('staff@test.com', 'password123', 'staff')}
             className="flex flex-col items-center justify-center py-3 border border-slate-100 rounded-2xl hover:bg-green-50 hover:border-green-200 transition-all shadow-sm gap-1 group"
             title="Login as Delivery Staff"
           >
             <Bike size={18} className="text-green-500 group-hover:scale-110 transition-transform"/>
             <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 group-hover:text-green-600 transition-colors">Staff</span>
           </button>
        </div>

        <div className="mt-8 text-center text-sm font-medium text-slate-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className={`${theme.text} hover:underline font-black ml-1 transition-colors`}
          >
            {isLogin ? 'Join now' : 'Sign in here'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;

