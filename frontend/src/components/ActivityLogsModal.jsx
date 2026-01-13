import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { exportService } from '../api/exportService';
import { FiX, FiActivity, FiClock, FiUser, FiInfo, FiDownload } from 'react-icons/fi';

const ActivityLogsModal = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        if (isOpen) {
            fetchLogs();
        }
    }, [isOpen]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/admin/logs');
            setLogs(response.data);
        } catch (error) {
            console.error('Failed to fetch activity logs', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredLogs = logs.filter(log => {
        if (filter === 'ALL') return true;
        return log.action === filter;
    });

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return 'bg-green-100 text-green-700';
            case 'DELETE': return 'bg-red-100 text-red-700';
            case 'UPDATE': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleExport = async () => {
        try {
            await exportService.downloadActivityLogs();
        } catch (error) {
            alert('Failed to export logs');
        }
    };

    if (!isOpen) return null;



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                            <FiActivity size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">System Activity Logs</h2>
                            <p className="text-sm text-gray-500">Track user activities and system changes.</p>
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 outline-none"
                        >
                            <option value="ALL">All Actions</option>
                            <option value="CREATE">Create</option>
                            <option value="UPDATE">Update</option>
                            <option value="DELETE">Delete</option>
                        </select>

                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                            <FiX size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-0">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <FiActivity size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No activity logs found matching filter.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                                            <FiClock size={14} /> {formatDate(log.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                    {log.user?.name?.charAt(0) || <FiUser />}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{log.user?.name || `Unknown (ID: ${log.user_id})`}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                            <span className="ml-2 text-xs text-gray-400 uppercase">{log.entity}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-start gap-2 max-w-sm">
                                                <FiInfo className="mt-1 text-gray-400 shrink-0" size={14} />
                                                <span className="truncate hover:whitespace-normal transition-all">{log.details}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityLogsModal;
