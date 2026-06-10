import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User, ChefHat, Bike } from 'lucide-react';

const roleIcons = {
  customer: <User size={20} className="text-red-500" />, 
  owner: <ChefHat size={20} className="text-amber-500" />, 
  staff: <Bike size={20} className="text-green-500" />
};

const ProfileLayout = ({ user, logout, children }) => {
  const theme = {
    customer: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' },
    owner: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
    staff: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' }
  }[user.role];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className={`w-64 p-6 ${theme.bg} ${theme.border} border-r`}>
        <div className="flex items-center gap-3 mb-8">
          {roleIcons[user.role]}
          <div>
            <h2 className="font-black text-lg">{user.name}</h2>
            <p className="text-sm capitalize">{user.role} portal</p>
          </div>
        </div>
        <nav className="flex flex-col gap-4">
          <Link to="/profile" className={`font-black uppercase ${theme.text}`}>Dashboard</Link>
          <button onClick={logout} className="flex items-center gap-2 text-sm font-black uppercase text-slate-500 hover:text-slate-900">
            <LogOut size={16} /> Logout
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

export default ProfileLayout;

