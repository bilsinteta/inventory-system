import { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiEdit2, FiPhone, FiMail, FiUser } from 'react-icons/fi';
import { supplierService } from '../api/supplierService';

const SupplierModal = ({ isOpen, onClose, refreshSuppliers }) => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingSupplier, setEditingSupplier] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        contact_name: '',
        phone: '',
        email: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetchSuppliers();
        }
    }, [isOpen]);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const data = await supplierService.getAll();
            setSuppliers(data);
        } catch (error) {
            console.error('Failed to fetch suppliers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await supplierService.update(editingSupplier.id, formData);
            } else {
                await supplierService.create(formData);
            }
            resetForm();
            fetchSuppliers();
            refreshSuppliers(); // Update dashboard
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to save supplier');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This might affect products linked to this supplier.')) {
            try {
                await supplierService.delete(id);
                fetchSuppliers();
                refreshSuppliers();
            } catch (error) {
                alert('Failed to delete supplier');
            }
        }
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name,
            contact_name: supplier.contact_name,
            phone: supplier.phone,
            email: supplier.email,
        });
    };

    const resetForm = () => {
        setEditingSupplier(null);
        setFormData({
            name: '',
            contact_name: '',
            phone: '',
            email: '',
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50 backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-gray-800">Manage Suppliers</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row h-full overflow-hidden">
                    {/* List Section */}
                    <div className="flex-1 overflow-y-auto p-4 border-r border-gray-100 bg-gray-50/30">
                        {loading ? (
                            <div className="flex justify-center p-8"><div className="w-8 h-8 md:w-10 md:h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div></div>
                        ) : (
                            <div className="space-y-3">
                                {suppliers.map(supplier => (
                                    <div key={supplier.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{supplier.name}</h4>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                    <FiUser size={14} /> {supplier.contact_name}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                                    <FiPhone size={14} /> {supplier.phone}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(supplier)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 size={16} /></button>
                                                <button onClick={() => handleDelete(supplier.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Form Section */}
                    <div className="w-full lg:w-96 p-6 bg-white overflow-y-auto">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-1">
                                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {editingSupplier ? 'Update supplier details below.' : 'Fill in the information to add a partner.'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                    placeholder="e.g. PT Example"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Person</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.contact_name}
                                    onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                    placeholder="08123..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                    placeholder="contact@company.com"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                {editingSupplier && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary justify-center shadow-lg shadow-primary-500/20"
                                >
                                    {editingSupplier ? 'Save Changes' : 'Add Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierModal;
