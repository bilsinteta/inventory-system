import { useState, useEffect } from 'react';
import { FiX, FiActivity, FiArrowUp, FiArrowDown, FiClock, FiFileText } from 'react-icons/fi';
import { productService } from '../api/productService';

const StockHistoryModal = ({ isOpen, onClose, product }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && product?.id) {
            fetchHistory();
        }
    }, [isOpen, product]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await productService.getStockHistory(product.id);
            setHistory(data.history || []);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all animate-slide-up">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                            <FiActivity size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Stock History</h2>
                            <p className="text-sm text-gray-500">Transaction logs for <span className="font-semibold text-gray-900">{product?.name}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
                            <p className="text-gray-500 text-sm">Loading history...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiClock size={32} className="text-gray-300" />
                            </div>
                            <p>No transaction history found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((item) => (
                                <div key={item.id} className="group p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left: Type & Time */}
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl flex items-center justify-center ${item.type === 'in'
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-red-100 text-red-600'
                                                }`}>
                                                {item.type === 'in' ? <FiArrowUp size={20} /> : <FiArrowDown size={20} />}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`font-bold text-lg ${item.type === 'in' ? 'text-green-700' : 'text-red-700'
                                                        }`}>
                                                        {item.type === 'in' ? '+' : '-'}{item.quantity}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                                                        {item.stock_before} → {item.stock_after}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <FiClock size={12} />
                                                    <span>{formatDate(item.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Note */}
                                        <div className="flex-1 text-right sm:text-left sm:flex-none sm:w-1/2">
                                            {item.note ? (
                                                <div className="inline-flex items-start gap-2 bg-white px-3 py-2 rounded-lg border border-gray-100 text-sm text-gray-600 w-full">
                                                    <FiFileText className="mt-0.5 text-gray-400 shrink-0" size={14} />
                                                    <span className="italic">"{item.note}"</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-300 italic">No note provided</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StockHistoryModal;
