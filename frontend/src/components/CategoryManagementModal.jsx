import { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { categoryService } from '../api/categoryService';

const CategoryManagementModal = ({ isOpen, onClose }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await categoryService.update(editingCategory.id, { name: newCategoryName });
            } else {
                await categoryService.create({ name: newCategoryName });
            }
            setNewCategoryName('');
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            alert('Failed to save category');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this category? Products in this category will not be deleted but will have no category.')) {
            try {
                await categoryService.delete(id);
                fetchCategories();
            } catch (error) {
                alert('Failed to delete category');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-slide-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Manage Categories</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <FiX size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Category Name"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        required
                    />
                    <button type="submit" className="btn-primary px-4 py-2 flex items-center gap-2">
                        {editingCategory ? <FiEdit2 /> : <FiPlus />}
                        {editingCategory ? 'Update' : 'Add'}
                    </button>
                </form>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {loading ? (
                        <p className="text-center text-gray-500">Loading...</p>
                    ) : categories.length === 0 ? (
                        <p className="text-center text-gray-500">No categories yet.</p>
                    ) : (
                        categories.map((cat) => (
                            <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                                <span className="font-medium text-gray-700">{cat.name}</span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setEditingCategory(cat);
                                            setNewCategoryName(cat.name);
                                        }}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryManagementModal;
