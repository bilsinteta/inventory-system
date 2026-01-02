import { useState } from 'react';
import { FiX, FiTrendingUp, FiTrendingDown, FiPackage, FiInfo } from 'react-icons/fi';

const StockModal = ({ isOpen, onClose, onSubmit, product }) => {
  const [type, setType] = useState('in');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      type,
      quantity: parseInt(quantity),
      note,
    });

    // Reset form
    setQuantity('');
    setNote('');
  };

  if (!isOpen) return null;

  const currentStock = product?.stock || 0;
  const quantityNum = parseInt(quantity) || 0;
  const newStock = type === 'in' ? currentStock + quantityNum : currentStock - quantityNum;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Update Stock</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Product Info Card */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-2xl">
            📦
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-1">{product?.name}</h3>
            <p className="text-sm text-gray-500">Current Stock: <span className="font-medium text-gray-900">{product?.stock} pcs</span></p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Operation Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setType('in')}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${type === 'in'
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <FiTrendingUp size={24} />
                  <span className="font-medium">Stock In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('out')}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${type === 'out'
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <FiTrendingDown size={24} />
                  <span className="font-medium">Stock Out</span>
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium text-lg"
                  placeholder="0"
                  min="1"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">pcs</span>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Note <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none resize-none"
                rows="2"
                placeholder="Reason for stock adjustment..."
              />
            </div>

            {/* Preview Banner */}
            {quantity && (
              <div className={`rounded-xl p-4 flex items-center justify-between ${type === 'in' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                <div className="flex items-center gap-2">
                  <FiInfo />
                  <span className="text-sm font-medium">New Stock Balance:</span>
                </div>
                <span className="text-lg font-bold">{newStock} pcs</span>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!quantity}
              className={`flex-1 px-4 py-2.5 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none ${type === 'in'
                  ? 'bg-green-600 hover:bg-green-500 shadow-green-500/30'
                  : 'bg-red-600 hover:bg-red-500 shadow-red-500/30'
                }`}
            >
              Confirm Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockModal;