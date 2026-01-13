import { FiEdit2, FiTrash2, FiAlertCircle, FiClock } from 'react-icons/fi';

const ProductCard = ({ product, onEdit, onDelete, onViewDetail, onViewHistory }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isLowStock = product.stock < product.min_stock;
  const imageUrl = product.image_url
    ? `http://localhost:8081${product.image_url}`
    : 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'; // Clean fallback

  return (
    <div className="group glass-card overflow-hidden hover:-translate-y-1 transition-transform duration-300">
      {/* Product Image */}
      <div
        className="h-56 bg-gray-100 cursor-pointer relative overflow-hidden"
        onClick={() => onViewDetail(product)}
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {isLowStock && (
          <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg animate-pulse">
            <FiAlertCircle />
            Low Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5">
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-medium text-gray-400 tracking-wider uppercase">SKU: {product.sku}</p>
            {product.category && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-600 border border-purple-200 uppercase tracking-wide">
                {product.category.name}
              </span>
            )}
          </div>
          <h3
            className="text-lg font-bold text-gray-800 hover:text-primary-600 cursor-pointer transition-colors line-clamp-1"
            onClick={() => onViewDetail(product)}
            title={product.name}
          >
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
            {product.supplier?.name || 'Unknown Supplier'}
          </p>
        </div>

        {/* Price & Stats */}
        <div className="flex items-end justify-between mb-6 pb-6 border-b border-gray-100">
          <div>
            <p className="text-2xl font-bold text-primary-600 tracking-tight">
              {formatCurrency(product.price)}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${isLowStock ? 'text-red-500' : 'text-green-600'}`}>
              {product.stock} <span className="text-gray-400 font-normal text-xs">in stock</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 hover:text-primary-600 transition-colors font-medium text-sm group/btn"
          >
            <FiEdit2 size={16} className="group-hover/btn:scale-110 transition-transform" />
            Edit
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="flex items-center justify-center gap-2 p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors group/btn"
          >
            <FiTrash2 size={18} className="group-hover/btn:rotate-12 transition-transform" />
          </button>
          <button
            onClick={() => onViewHistory(product)}
            className="flex items-center justify-center gap-2 p-2.5 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-100 transition-colors group/btn"
            title="View History"
          >
            <FiClock size={18} className="group-hover/btn:rotate-12 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;