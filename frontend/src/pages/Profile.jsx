import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import CustomerProfile from '../components/profile/CustomerProfile';
import OwnerProfile from '../components/profile/OwnerProfile';
import StaffProfile from '../components/profile/StaffProfile';
import ProfileLayout from '../components/profile/ProfileLayout';

const Profile = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
        return;
      }
      fetchOrders();
    }
  }, [user, loading]);

  const fetchOrders = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/profile/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setFetching(false);
    }
  };

  if (loading || (user && fetching)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!user && !loading) return null;

  const renderDashboard = () => {
    if (!user) return null;
    switch (user.role) {
      case 'customer':
        return <CustomerProfile orders={orders} refresh={fetchOrders} />;
      case 'owner':
        return <OwnerProfile orders={orders} refresh={fetchOrders} />;
      case 'staff':
        return <StaffProfile orders={orders} refresh={fetchOrders} />;
      default:
        return null;
    }
  };

  return (
    <ProfileLayout user={user} logout={() => { logout(); toast.success('Logged out'); navigate('/'); }}>
      {renderDashboard()}
    </ProfileLayout>
  );
};

export default Profile;

