import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Users, CheckCircle, Package, Truck, UserPlus, ShieldCheck, Bike, Hash, X, CreditCard, Store, Utensils, Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import DemandForecaster from './DemandForecaster';

const OwnerProfile = ({ orders, refresh }) => {
  const { user } = useAuth();
  const { districts } = useLocation();

  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState({});
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'shop', 'menu', 'staff'
  const [orderToView, setOrderToView] = useState(null);

  // Shop state
  const [shop, setShop] = useState(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [localDistrict, setLocalDistrict] = useState("");
  const [localAreas, setLocalAreas] = useState([]);
  const [localArea, setLocalArea] = useState("");

  const [shopForm, setShopForm] = useState({
    name: "",
    city: "",
    state: "Gujarat",
    address: "",
    district: "",
    area: "",
    imageFile: null
  });

  // Menu items state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: "",
    category: "Pizza",
    foodType: "veg",
    price: "",
    imageFile: null
  });

  const fetchStaffData = async () => {
    const token = localStorage.getItem('token');
    try {
      const hiredRes = await axios.get('http://localhost:5001/api/staff', { 
         headers: { Authorization: `Bearer ${token}` } 
      });
      setStaffList(hiredRes.data);
    } catch (err) { 
      toast.error("Error loading fleet data");
    }
  };

  const fetchShop = async () => {
    try {
      setShopLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5001/api/shop/get-my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShop(res.data);
      if (res.data) {
        setShopForm({
          name: res.data.name || "",
          city: res.data.city || "",
          state: res.data.state || "Gujarat",
          address: res.data.address || "",
          district: res.data.district || "",
          area: res.data.area || "",
          imageFile: null
        });
        setLocalDistrict(res.data.district || "");
        setLocalArea(res.data.area || "");
      }
    } catch (err) {
      console.error("Failed to fetch shop details", err);
    } finally {
      setShopLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
    fetchShop();
    if (!user?.inviteCode || user.inviteCode === 'N/A' || user.inviteCode === 'CODE-NA') {
        const refreshAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    await axios.get('http://localhost:5001/me', { headers: { Authorization: `Bearer ${token}` } });
                } catch (e) {}
            }
        };
        refreshAuth();
    }
  }, [user]);

  useEffect(() => {
    if (!localDistrict) return;
    const fetchAreas = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/locations/${localDistrict}/areas`);
        setLocalAreas(res.data);
      } catch (err) {
        console.error("Error fetching areas", err);
      }
    };
    fetchAreas();
  }, [localDistrict]);

  const assignStaff = async (orderId) => {
    const staffId = selectedStaff[orderId];
    if (!staffId) return toast.error("Please select a staff member");
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5001/api/orders/${orderId}/assign`, { staffId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Staff assigned and order accepted!");
      refresh();
    } catch (err) { toast.error("Failed to assign staff"); }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/admin/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Order marked as ${status.replace('-', ' ')}`);
      refresh();
    } catch (err) { toast.error("Failed to update status"); }
  };

  const handleDistrictChange = (e) => {
    const dist = e.target.value;
    setLocalDistrict(dist);
    setShopForm(prev => ({ ...prev, district: dist, area: "" }));
  };

  const handleAreaChange = (e) => {
    const ar = e.target.value;
    setLocalArea(ar);
    setShopForm(prev => ({ ...prev, area: ar }));
  };

  const handleShopSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append("name", shopForm.name);
    formData.append("city", shopForm.city);
    formData.append("state", shopForm.state);
    formData.append("address", shopForm.address);
    formData.append("district", shopForm.district);
    formData.append("area", shopForm.area);
    if (shopForm.imageFile) {
      formData.append("image", shopForm.imageFile);
    } else if (shop?.image) {
      formData.append("existingImage", shop.image);
    }

    try {
      setShopLoading(true);
      const res = await axios.post("http://localhost:5001/api/shop/create-edit", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setShop(res.data);
      toast.success("Shop Profile saved successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save shop profile");
    } finally {
      setShopLoading(false);
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append("name", itemForm.name);
    formData.append("category", itemForm.category);
    formData.append("foodType", itemForm.foodType);
    formData.append("price", itemForm.price);
    if (itemForm.imageFile) {
      formData.append("image", itemForm.imageFile);
    }

    try {
      let res;
      if (editingItem) {
        if (!itemForm.imageFile && editingItem.image) {
          formData.append("existingImage", editingItem.image);
        }
        res = await axios.put(`http://localhost:5001/api/item/edit/${editingItem._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        toast.success("Menu item updated successfully!");
      } else {
        res = await axios.post("http://localhost:5001/api/item/add", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        toast.success("Menu item added successfully!");
      }
      setShop(res.data);
      setItemModalOpen(false);
      setItemForm({ name: "", category: "Pizza", foodType: "veg", price: "", imageFile: null });
      setEditingItem(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save menu item");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    const token = localStorage.getItem('token');
    try {
      const res = await axios.delete(`http://localhost:5001/api/item/delete/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShop(res.data);
      toast.success("Menu item deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete menu item");
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setItemForm({ name: "", category: "Pizza", foodType: "veg", price: "", imageFile: null });
    setItemModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name || "",
      category: item.category || "Pizza",
      foodType: item.foodType || "veg",
      price: item.price || "",
      imageFile: null
    });
    setItemModalOpen(true);
  };

  const stats = [
    { label: 'Total Revenue', value: `₹${orders.reduce((acc, o) => acc + o.total, 0)}`, icon: <TrendingUp size={20} />, color: 'bg-green-100 text-green-600' },
    { label: 'My Fleet', value: staffList.length, icon: <Users size={20} />, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Active Orders', value: orders.filter(o => o.status !== 'delivered').length, icon: <Package size={20} />, color: 'bg-amber-100 text-amber-600' },
  ];

  const gujaratDistricts = districts && districts.length > 0 ? districts : ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Anand"];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Owner Hub</h2>
          <p className="text-slate-500 font-medium tracking-tight">Manage your restaurant fleet and operations</p>
        </div>
        <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl gap-1">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Order Queue
          </button>
          <button 
            onClick={() => setActiveTab('shop')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'shop' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Shop Profile
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'menu' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Manage Menu
          </button>
          <button 
            onClick={() => setActiveTab('staff')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'staff' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Manage Staff
          </button>
        </div>
      </div>

      <DemandForecaster recentOrders={orders.length} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-6 group hover:scale-[1.02] transition-all">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {activeTab === 'orders' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-3"><ShoppingBag className="text-[#E23744]" /> Active Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Details</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Items & Dishes</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Delivery Partner</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">No active orders found</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-6 font-black text-slate-900 italic tracking-tighter">#{order._id.slice(-6)}</td>
                      <td className="p-6">
                        <p className="font-black text-slate-800 uppercase text-xs">{order.customerId?.name || 'Guest User'}</p>
                        <p className="text-xs text-slate-500 font-bold truncate max-w-[200px] mt-1" title={order.deliveryAddress}>{order.deliveryAddress}</p>
                      </td>
                      <td 
                         className="p-6 cursor-pointer hover:bg-slate-100/50 transition-all group/item relative"
                         onClick={() => setOrderToView(order)}
                         title="Click to view full order details"
                      >
                         <div className="space-y-1">
                            {order.items?.map((item, idx) => (
                               <div key={idx} className="flex justify-between items-center gap-4 max-w-[180px]">
                                  <span className="text-[10px] font-black text-slate-700 uppercase truncate">{item.name}</span>
                                  <span className="text-[10px] font-bold text-slate-400 italic">₹{item.price}</span>
                               </div>
                            ))}
                            <div className="pt-1 mt-1 border-t border-slate-100 font-black text-[10px] text-slate-900 flex justify-between uppercase">
                               <span>Total</span>
                               <span className="text-[#E23744]">₹{order.total}</span>
                            </div>
                         </div>
                         <div className="absolute top-2 right-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <div className="bg-[#E23744] text-white p-1 rounded-md shadow-lg"><Hash size={10} /></div>
                         </div>
                      </td>
                      <td className="p-6">
                         {order.staffId ? (
                            <div className="flex items-center gap-2">
                               <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-[10px] font-black uppercase">{order.staffId?.name?.charAt(0)}</div>
                               <span className="text-xs font-black text-slate-900">{order.staffId?.name}</span>
                            </div>
                         ) : (
                            <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-50 px-3 py-1 rounded-full">Pending Assignment</span>
                         )}
                      </td>
                      <td className="p-6 text-right">
                        {order.status === 'pending' && (
                          <div className="flex gap-2 justify-end items-center">
                            <select 
                               onChange={(e) => setSelectedStaff({ ...selectedStaff, [order._id]: e.target.value })}
                               className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-[#E23744]"
                            >
                               <option value="">Select Staff</option>
                               {staffList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                            <button onClick={() => assignStaff(order._id)} className="bg-[#E23744] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-100">Assign</button>
                          </div>
                        )}
                        {order.status === 'preparing' && (
                          <button onClick={() => updateStatus(order._id, 'out-for-delivery')} className="bg-slate-900 text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#E23744] transition-all">Dispatch</button>
                        )}
                        {order.status === 'out-for-delivery' && <span className="text-purple-600 text-xs font-black uppercase flex items-center justify-end gap-2"><Truck size={16}/> In Transit</span>}
                        {order.status === 'delivered' && <span className="text-green-500 flex items-center justify-end gap-2 text-xs font-black uppercase"><CheckCircle size={16}/> Finished</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'shop' && (
        <div className="space-y-6">
          {shopLoading ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading shop details...</p>
            </div>
          ) : (
            <>
              {shop && (
                 <div className="bg-slate-50 p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 border border-slate-100 shadow-inner">
                   <img src={shop.image} alt={shop.name} className="w-40 h-28 object-cover rounded-2xl shadow-md" />
                   <div>
                     <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{shop.name}</h4>
                     <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{shop.address}, {shop.city}, {shop.state}</p>
                     <div className="flex gap-2 mt-3">
                       <span className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{shop.district}</span>
                       <span className="bg-red-50 text-[#E23744] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{shop.area}</span>
                     </div>
                   </div>
                 </div>
              )}

              <form onSubmit={handleShopSubmit} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 space-y-6">
                 <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 border-b pb-4"><Store className="text-[#E23744]" /> {shop ? "Update Shop Profile" : "Register Your Restaurant"}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Restaurant Name</label>
                       <input type="text" required value={shopForm.name} onChange={e => setShopForm({...shopForm, name: e.target.value})} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-[#E23744] focus:outline-none text-slate-900 text-sm" placeholder="e.g. Pizza Paradise" />
                    </div>
                    <div>
                       <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Banner Image</label>
                       <input type="file" accept="image/*" onChange={e => setShopForm({...shopForm, imageFile: e.target.files[0]})} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-bold focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-900 file:text-white hover:file:bg-[#E23744] text-xs" />
                       {shop && !shopForm.imageFile && <p className="text-[10px] text-slate-400 mt-1 font-bold">Leave blank to keep existing image</p>}
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                       <label className="text-xs font-black uppercase text-slate-400 mb-2 block">District</label>
                       <select required value={shopForm.district} onChange={handleDistrictChange} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-[#E23744] focus:outline-none text-xs">
                          <option value="">Select District</option>
                          {gujaratDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Area</label>
                       <select required value={shopForm.area} onChange={handleAreaChange} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-[#E23744] focus:outline-none text-xs">
                          <option value="">Select Area</option>
                          {localAreas.map(a => <option key={a.name} value={a.name}>{a.name} ({a.pincode})</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="text-xs font-black uppercase text-slate-400 mb-2 block">City</label>
                       <input type="text" required value={shopForm.city} onChange={e => setShopForm({...shopForm, city: e.target.value})} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-[#E23744] focus:outline-none text-slate-900 text-sm" placeholder="e.g. Ahmedabad" />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="text-xs font-black uppercase text-slate-400 mb-2 block">State</label>
                       <input type="text" required value={shopForm.state} onChange={e => setShopForm({...shopForm, state: e.target.value})} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-[#E23744] focus:outline-none text-slate-900 text-sm" placeholder="e.g. Gujarat" />
                    </div>
                    <div>
                       <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Full Address</label>
                       <textarea required value={shopForm.address} onChange={e => setShopForm({...shopForm, address: e.target.value})} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-[#E23744] focus:outline-none text-slate-900 h-20 resize-none text-sm" placeholder="e.g. Shop 4, Food Court Street" />
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#E23744] transition-all shadow-xl shadow-slate-200">
                    Save Shop Profile
                 </button>
              </form>
            </>
          )}
        </div>
      )}

      {activeTab === 'menu' && (
        <div className="space-y-6">
          {!shop ? (
            <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-xl border border-slate-100">
               <Store className="text-slate-300 mx-auto mb-4" size={48} />
               <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tighter">No Shop Profile Registered</h3>
               <p className="text-slate-400 font-medium text-sm mb-6">You must set up your restaurant shop profile first under the "Shop Profile" tab before adding menu items.</p>
               <button onClick={() => setActiveTab('shop')} className="bg-slate-900 text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#E23744] transition-all">Go to Shop Profile</button>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><Utensils className="text-[#E23744]" /> Menu Management</h3>
                <button onClick={openAddModal} className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#E23744] transition-all flex items-center gap-2">
                  <Plus size={14} /> Add Menu Item
                </button>
              </div>

              {!shop.items || shop.items.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="font-bold uppercase tracking-widest text-xs">Your menu is empty. Click "Add Menu Item" to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {shop.items.map((item) => (
                    <div key={item._id} className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex gap-4 shadow-sm hover:shadow-md transition-shadow relative group">
                      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-2xl shadow-sm" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${item.foodType === 'veg' ? 'bg-green-500' : 'bg-red-500'}`} title={item.foodType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}></span>
                            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">{item.category}</span>
                          </div>
                          <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mt-1 truncate max-w-[200px]">{item.name}</h4>
                        </div>
                        <p className="text-base font-black text-[#E23744]">₹{item.price}</p>
                      </div>
                      
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(item)} className="bg-white hover:bg-slate-100 text-slate-700 p-2 rounded-full border border-slate-200 shadow-sm transition-all" title="Edit Item">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteItem(item._id)} className="bg-white hover:bg-red-50 text-red-500 p-2 rounded-full border border-slate-200 shadow-sm transition-all" title="Delete Item">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* My Fleet Table */}
           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden lg:col-span-1">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                 <h3 className="text-lg font-black text-slate-900 flex items-center gap-3"><ShieldCheck className="text-indigo-600" /> My Active Fleet</h3>
              </div>
              <div className="p-4">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-slate-50">
                          <th className="p-4 text-[10px] font-black uppercase text-slate-400">Join ID</th>
                          <th className="p-4 text-[10px] font-black uppercase text-slate-400">Name & Contact</th>
                       </tr>
                    </thead>
                    <tbody>
                       {staffList.length === 0 ? (
                          <tr><td colSpan="2" className="p-12 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">No staff in your fleet</td></tr>
                       ) : (
                          staffList.map(s => (
                             <tr key={s._id} className="group hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                   <span className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black italic tracking-widest shadow-md flex items-center gap-2 w-fit">
                                      <Hash size={12}/> {s.staffRegistrationCode || 'N/A'}
                                   </span>
                                </td>
                                <td className="p-4">
                                   <div>
                                      <p className="text-xs font-black text-slate-900 uppercase">{s.name}</p>
                                      <p className="text-[10px] font-bold text-slate-500">{s.email}</p>
                                   </div>
                                </td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Invite System */}
           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden lg:col-span-1 border-t-4 border-t-[#E23744]">
              <div className="p-8 border-b border-slate-100 bg-red-50/20">
                 <h3 className="text-lg font-black text-slate-900 flex items-center gap-3"><UserPlus className="text-[#E23744]" /> Onboard New Partners</h3>
              </div>
              <div className="p-10 text-center space-y-8">
                 <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-[#E23744] shadow-inner">
                    <Bike size={36} />
                 </div>
                 
                 <div>
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Your Restaurant Invite Code</h4>
                    <p className="text-sm font-medium text-slate-500 mt-2">New staff must enter this code during signup to join your restaurant fleet</p>
                 </div>
                 
                 <div className="relative group max-w-xs mx-auto">
                    <div className="bg-slate-900 text-white p-7 rounded-[2rem] text-4xl font-black tracking-[0.2em] shadow-2xl shadow-red-100 group-hover:scale-105 transition-all duration-500 italic flex items-center justify-center border-4 border-slate-800">
                       {user?.inviteCode || 'N/A'}
                    </div>
                 </div>

                 <div className="pt-10 flex flex-col items-center gap-4">
                    <div className="p-5 bg-slate-50 rounded-2xl flex items-center gap-5 text-left w-full border border-slate-100">
                       <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm"><ShieldCheck size={24}/></div>
                       <div>
                          <p className="text-[10px] font-black text-slate-900 uppercase">Secure Verification</p>
                          <p className="text-[10px] font-medium text-slate-500 mt-0.5">Automated linking ensures only your staff can access your orders.</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Menu Item Add/Edit Modal */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setItemModalOpen(false)}></div>
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">{editingItem ? "Edit Menu Item" : "Add Menu Item"}</h3>
                    <p className="text-[10px] font-black text-[#E23744] tracking-widest mt-0.5">{editingItem ? "MODIFY DISH DETAILS" : "CREATE NEW DISH"}</p>
                 </div>
                 <button onClick={() => setItemModalOpen(false)} className="w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:scale-110 transition-all shadow-sm"><X size={20}/></button>
              </div>
              <form onSubmit={handleItemSubmit} className="p-8 space-y-6">
                 <div>
                    <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Dish Name</label>
                    <input type="text" required value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-[#E23744] focus:outline-none text-slate-900 text-sm" placeholder="e.g. Margherita Pizza" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Category</label>
                       <select required value={itemForm.category} onChange={e => setItemForm({...itemForm, category: e.target.value})} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-[#E23744] focus:outline-none text-xs">
                          <option value="Pizza">Pizza</option>
                          <option value="Burger">Burger</option>
                          <option value="Beverages">Beverages</option>
                          <option value="Dessert">Dessert</option>
                          <option value="Chinese">Chinese</option>
                          <option value="Main Course">Main Course</option>
                          <option value="Sandwich">Sandwich</option>
                          <option value="Pasta">Pasta</option>
                          <option value="Sides">Sides</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Price (₹)</label>
                       <input type="number" required min="1" value={itemForm.price} onChange={e => setItemForm({...itemForm, price: e.target.value})} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-[#E23744] focus:outline-none text-slate-900 text-sm" placeholder="e.g. 299" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Food Type</label>
                       <select required value={itemForm.foodType} onChange={e => setItemForm({...itemForm, foodType: e.target.value})} className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-[#E23744] focus:outline-none text-xs">
                          <option value="veg">Veg</option>
                          <option value="non-veg">Non-Veg</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Dish Image</label>
                       <input type="file" accept="image/*" onChange={e => setItemForm({...itemForm, imageFile: e.target.files[0]})} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-bold focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-900 file:text-white hover:file:bg-[#E23744] text-xs" />
                    </div>
                 </div>
                 <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setItemModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em]">Cancel</button>
                    <button type="submit" className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-[#E23744] transition-all shadow-xl shadow-slate-200">Save Item</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {orderToView && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setOrderToView(null)}></div>
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Order Details</h3>
                    <p className="text-[10px] font-black text-[#E23744] tracking-widest mt-0.5">#{orderToView._id}</p>
                 </div>
                 <button onClick={() => setOrderToView(null)} className="w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:scale-110 transition-all shadow-sm"><X size={20}/></button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                 {/* Customer Info */}
                 <div className="flex gap-6">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black">{orderToView.customerId?.name?.charAt(0) || 'G'}</div>
                    <div>
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Customer</p>
                       <p className="text-lg font-black text-slate-900 uppercase">{orderToView.customerId?.name || 'Guest User'}</p>
                       <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-2 italic">{orderToView.deliveryAddress}</p>
                    </div>
                 </div>

                 {/* Order Summary */}
                 <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Cart Summary</p>
                    {orderToView.items?.map((item, idx) => (
                       <div key={idx} className="flex justify-between items-center group">
                          <span className="text-xs font-black text-slate-800 uppercase group-hover:text-[#E23744] transition-colors">{item.name}</span>
                          <span className="text-xs font-bold text-slate-400 italic">₹{item.price}</span>
                       </div>
                    ))}
                    <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                       <p className="text-sm font-black text-slate-900 uppercase">Grand Total</p>
                       <p className="text-xl font-black text-[#E23744]">₹{orderToView.total}</p>
                    </div>
                 </div>

                 {/* Quick Details */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
                       <CreditCard className="text-[#E23744]" size={18} />
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment</p>
                          <p className="text-[10px] font-black text-slate-900 uppercase">{orderToView.paymentStatus || 'Paid Online'}</p>
                       </div>
                    </div>
                    <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
                       <Truck className="text-[#E23744]" size={18} />
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Method</p>
                          <p className="text-[10px] font-black text-slate-900 uppercase">Home Delivery</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                 <button 
                  onClick={() => setOrderToView(null)}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-200"
                 >
                    Dismiss
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default OwnerProfile;

