import React, { useState, useEffect, useRef } from 'react';
import { Users, UserPlus, Search, Filter, MoreVertical, Shield, Mail, MapPin, ChevronRight, RefreshCw, XCircle, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Create User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Employee');
  const [newUserDept, setNewUserDept] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit User Form State
  const [editingUserId, setEditingUserId] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState('Employee');
  const [editUserDept, setEditUserDept] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const openEditModal = (user: User) => {
    setActiveDropdown(null);
    setEditingUserId(user.id);
    setEditUserEmail(user.email);
    // Normalize role string
    let matchingRole = 'Employee';
    const roleStr = String(user.role).toUpperCase();
    if (roleStr.includes('HR') || roleStr === 'HR_OFFICER') matchingRole = 'HR Officer';
    if (roleStr.includes('ADMIN') || roleStr === 'ADMINISTRATOR') matchingRole = 'Administrator';
    setEditUserRole(matchingRole);
    
    const dept = departments.find(d => d.name === user.department);
    setEditUserDept(dept ? dept.id : '');
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await apiRequest(`/accounts/api/users/${editingUserId}/update/`, {
        method: 'PATCH',
        body: JSON.stringify({
          email: editUserEmail,
          role: editUserRole,
          department_id: editUserDept
        })
      });
      if (res.success) {
        setShowEditModal(false);
        fetchUsers();
      } else {
        alert(res.error || "Failed to update user");
      }
    } catch (err) {
      alert("Error updating user");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    setActiveDropdown(null);
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        const res = await apiRequest(`/accounts/api/users/${user.id}/delete/`, { method: 'DELETE' });
        if (res.success) {
          fetchUsers();
        } else {
          alert(res.error || "Failed to delete user");
        }
      } catch (err) {
        alert("Error deleting user");
      }
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

  const renderTable = (usersToRender: User[]) => (
    <div className="glass-card rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm relative">
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
            {usersToRender.map((user) => (
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
                    <Shield className={`w-4 h-4 ${String(user.role).toUpperCase().includes('ADMIN') ? 'text-primary-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{String(user.role).replace('_', ' ')}</span>
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
                <td className="px-8 py-5 text-right relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === user.id ? null : user.id); }}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-900"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {/* Action Dropdown */}
                  <AnimatePresence>
                    {activeDropdown === user.id && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-12 top-10 w-48 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-20 py-2"
                        ref={dropdownRef}
                      >
                        <button 
                          onClick={() => openEditModal(user)}
                          className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-primary-500" />
                          Edit User
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete User
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">User & Role Management</h1>
          <p className="text-slate-500 mt-1 font-bold italic opacity-70 italic tracking-tight uppercase text-[10px]">Manage staff identities, operational roles, and system permissions.</p>
        </div>
        <div className="flex items-center gap-3">
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

      <div className="space-y-12">
        {loading ? (
          <div className="glass-card rounded-[2.5rem] min-h-[400px] flex items-center justify-center border border-slate-100 shadow-sm relative">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <>
            {/* Administrators Section */}
            {filteredUsers.some(u => String(u.role).toUpperCase().includes('ADMIN')) && (
              <section className="space-y-4">
                <div className="flex items-center gap-3 px-4">
                  <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">System Administrators</h2>
                  <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-lg text-[10px] font-black">{filteredUsers.filter(u => String(u.role).toUpperCase().includes('ADMIN')).length}</span>
                </div>
                {renderTable(filteredUsers.filter(u => String(u.role).toUpperCase().includes('ADMIN')))}
              </section>
            )}

            {/* HR Officers Section */}
            {filteredUsers.some(u => String(u.role).toUpperCase().includes('HR')) && (
              <section className="space-y-4">
                <div className="flex items-center gap-3 px-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">HR Officers</h2>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-[10px] font-black">{filteredUsers.filter(u => String(u.role).toUpperCase().includes('HR')).length}</span>
                </div>
                {renderTable(filteredUsers.filter(u => String(u.role).toUpperCase().includes('HR')))}
              </section>
            )}

            {/* Employees Section */}
            {filteredUsers.some(u => String(u.role).toUpperCase().includes('EMPLOYEE')) && (
              <section className="space-y-4">
                <div className="flex items-center gap-3 px-4">
                  <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Active Staff / Employees</h2>
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-[10px] font-black">{filteredUsers.filter(u => String(u.role).toUpperCase().includes('EMPLOYEE')).length}</span>
                </div>
                {renderTable(filteredUsers.filter(u => String(u.role).toUpperCase().includes('EMPLOYEE')))}
              </section>
            )}
            
            {filteredUsers.length === 0 && (
              <div className="glass-card rounded-[2.5rem] min-h-[300px] flex flex-col items-center justify-center border border-slate-100 shadow-sm relative py-12">
                <Search className="w-12 h-12 text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold italic">No matching users found.</p>
              </div>
            )}
          </>
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

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative"
            >
              <button 
                onClick={() => setShowEditModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-black text-slate-900 mb-6">Edit Staff Profile</h2>
              
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <input 
                    type="email"
                    required
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    placeholder="staff@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                    <select 
                      value={editUserRole}
                      onChange={(e) => setEditUserRole(e.target.value)}
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
                      value={editUserDept}
                      onChange={(e) => setEditUserDept(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm outline-none"
                    >
                      <option value="">Select Dept</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                
                <button 
                  disabled={isUpdating}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-3xl mt-6 transition-all shadow-xl shadow-primary-100 flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:bg-slate-300"
                >
                  {isUpdating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <span>Update Profile</span>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
