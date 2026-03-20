import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Filter, MoreVertical, Shield, Mail, MapPin, ChevronRight, RefreshCw, XCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiRequest } from '../api/client';
import { User } from '../types';

export const UserManagementView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Direct redirection for administrators as they use Django Admin "only"
    window.location.assign(`http://${window.location.hostname}:8000/admin/accounts/user/`);
  }, []);
  
  // Create User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Employee');
  const [newUserDept, setNewUserDept] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/accounts/api/users/');
      if (res.success) setUsers(res.users);
      
      const deptRes = await apiRequest('/accounts/api/departments/');
      if (deptRes.success) setDepartments(deptRes.departments);
    } catch (err) {
      console.error("Failed to fetch users/departments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await apiRequest('/accounts/api/users/create/', {
        method: 'POST',
        body: JSON.stringify({
          username: newUserName,
          password: 'password123', // Default password for now
          email: newUserEmail,
          role: newUserRole,
          department_id: newUserDept
        })
      });
      if (res.success) {
        setShowAddModal(false);
        fetchUsers();
        // Reset form
        setNewUserName('');
        setNewUserEmail('');
      } else {
        alert(res.error || "Failed to create user");
      }
    } catch (err) {
      alert("Error creating user");
    } finally {
      setIsCreating(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await apiRequest(`/accounts/api/users/${userId}/update/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.success) fetchUsers();
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || u.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">User & Role Management</h1>
          <p className="text-slate-500 mt-1 font-bold italic opacity-70 italic tracking-tight uppercase text-[10px]">Manage staff identities, operational roles, and system permissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.location.assign(`http://${window.location.hostname}:8000/admin/accounts/user/`)}
            className="bg-white border border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl transition-all hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest text-[10px]"
          >
            <Shield className="w-4 h-4" />
            Django Admin
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary-200 flex items-center gap-2 uppercase tracking-widest text-xs"
          >
            <UserPlus className="w-4 h-4" />
            Add New User
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none shadow-sm"
          />
        </div>
        <select 
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="bg-white border border-slate-200 text-slate-600 font-bold px-6 py-4 rounded-2xl outline-none shadow-sm text-sm min-w-[200px]"
        >
          <option value="All">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Info</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center font-black text-lg">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{user.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mt-0.5">
                            <Mail className="w-3 h-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Shield className={`w-4 h-4 ${user.role === 'ADMIN' ? 'text-primary-600' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{user.role.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-300" />
                        {user.department}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <button 
                        onClick={() => toggleUserStatus(user.id, user.status || 'ACTIVE')}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${
                          user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {user.status || 'ACTIVE'}
                      </button>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-900">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-black text-slate-900 mb-6">Register New Staff</h2>
              
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <input 
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    placeholder="Enter unique username"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <input 
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    placeholder="staff@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                    <select 
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm outline-none"
                    >
                      <option value="Employee">Employee</option>
                      <option value="HR Officer">HR Officer</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                    <select 
                      required
                      value={newUserDept}
                      onChange={(e) => setNewUserDept(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm outline-none"
                    >
                      <option value="">Select Dept</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                
                <button 
                  disabled={isCreating}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-3xl mt-6 transition-all shadow-xl shadow-primary-100 flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:bg-slate-300"
                >
                  {isCreating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <span>Confirm Registration</span>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
