import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { FiX, FiCheck, FiUserCheck, FiUserX, FiShield, FiMoreVertical, FiTrash2, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const UserManagementModal = ({ isOpen, onClose }) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null); // ID of user being edited
    const [tempRole, setTempRole] = useState({}); // Temporary role changes

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/admin/users');
            // Sort: Pending first, then by name
            const sortedUsers = response.data.sort((a, b) => {
                if (a.is_active === b.is_active) return a.name.localeCompare(b.name);
                return a.is_active ? 1 : -1;
            });
            setUsers(sortedUsers);

            // Init temp roles
            const roles = {};
            sortedUsers.forEach(u => roles[u.id] = u.role);
            setTempRole(roles);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (user, newRole, newStatus) => {
        if (user.id === currentUser.id) {
            if (!window.confirm("Warning: You are editing your own account. If you demote yourself, you will lose Admin access immediately.")) {
                return;
            }
        }

        try {
            await axios.put(`/admin/users/${user.id}/approve`, {
                is_active: newStatus !== undefined ? newStatus : user.is_active,
                role: newRole || user.role
            });
            alert("User updated successfully!");
            fetchUsers();
            setEditingUser(null);
        } catch (error) {
            console.error("Failed to update user", error);
            alert("Failed to update user");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50 backdrop-blur-sm">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FiShield className="text-primary-600" /> User Management
                        </h2>
                        <p className="text-sm text-gray-500">Manage user roles and access approvals.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                    {loading ? (
                        <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div></div>
                    ) : (
                        <div className="space-y-4">
                            {users.map(user => (
                                <div key={user.id} className={`bg-white p-4 rounded-xl shadow-sm border ${user.is_active ? 'border-gray-100' : 'border-yellow-200 bg-yellow-50/50'} flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md`}>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900 text-lg">{user.name}</h4>
                                            {!user.is_active && <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-700">PENDING</span>}
                                            {user.id === currentUser.id && <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">YOU</span>}
                                        </div>
                                        <p className="text-gray-500 text-sm flex items-center gap-2">
                                            <FiUserCheck size={14} /> {user.email}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">Role: <span className="font-medium uppercase">{user.role}</span></p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Role Dropdown */}
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] uppercase font-bold text-gray-400">Role</label>
                                            <select
                                                value={tempRole[user.id] || user.role}
                                                onChange={(e) => setTempRole({ ...tempRole, [user.id]: e.target.value })}
                                                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 w-32 disabled:bg-gray-200 disabled:text-gray-400"
                                                disabled={user.email === 'admin'}
                                            >
                                                <option value="staff">Staff</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-1 items-end">
                                            <label className="text-[10px] uppercase font-bold text-gray-400">Actions</label>
                                            <div className="flex gap-2">
                                                {/* Approve / Save Role */}
                                                {!user.is_active ? (
                                                    <button
                                                        onClick={() => handleUpdateUser(user, tempRole[user.id], true)}
                                                        className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm shadow-green-200 flex items-center gap-1 text-sm font-medium"
                                                        title="Approve User"
                                                    >
                                                        <FiCheck /> Approve
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUpdateUser(user, tempRole[user.id], true)} // Keep active
                                                        disabled={tempRole[user.id] === undefined || tempRole[user.id] === user.role}
                                                        className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm shadow-primary-200 flex items-center gap-1 text-sm font-medium"
                                                        title="Save Role Change"
                                                    >
                                                        <FiSave /> Save
                                                    </button>
                                                )}

                                                {/* Deactivate (Ban) */}
                                                {user.is_active && user.id !== currentUser.id && user.email !== 'admin' && (
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Are you sure you want to DEACTIVATE ${user.name}? They will not be able to login.`)) {
                                                                handleUpdateUser(user, user.role, false);
                                                            }
                                                        }}
                                                        className="px-3 py-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors flex items-center gap-1 text-sm font-medium"
                                                        title="Deactivate User"
                                                    >
                                                        <FiUserX />
                                                    </button>
                                                )}

                                                {/* Delete */}
                                                {user.id !== currentUser.id && user.email !== 'admin' && (
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm(`Are you sure you want to DELETE ${user.name}? This action cannot be undone.`)) {
                                                                try {
                                                                    await axios.delete(`/admin/users/${user.id}`);
                                                                    fetchUsers();
                                                                } catch (e) { alert("Failed to delete user: " + (e.response?.data?.error || "Unknown Error")); }
                                                            }
                                                        }}
                                                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1 text-sm font-medium"
                                                        title="Delete User"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                )}
                                            </div>
                                        </div>                            </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagementModal;
