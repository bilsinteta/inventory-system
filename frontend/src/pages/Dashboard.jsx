import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import StockModal from '../components/StockModal';
import SupplierModal from '../components/SupplierModal'; // New import
import UserManagementModal from '../components/UserManagementModal'; // New import
import { productService } from '../api/productService';
import { supplierService } from '../api/supplierService';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { FiPlus, FiSearch, FiAlertCircle, FiPackage, FiFilter, FiChevronLeft, FiChevronRight, FiUsers, FiTruck, FiCheckSquare } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth(); // Get user for role check
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false); // New
  const [approvalModalOpen, setApprovalModalOpen] = useState(false); // New

  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalSuppliers: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch stats data
      const [suppliersData, lowStockData, allProductsData] = await Promise.all([
        supplierService.getAll(),
        productService.getLowStock(),
        productService.getAll({ page: 1, limit: 1000 }) // Get all for simple count, or backend could send count
      ]);

      setSuppliers(suppliersData);

      // Update stats
      setStats({
        totalProducts: allProductsData.pagination ? allProductsData.pagination.total : (allProductsData.products ? allProductsData.products.length : 0), // Adjust based on API structure
        lowStockCount: lowStockData.products ? lowStockData.products.length : 0,
        totalSuppliers: suppliersData.length,
      });

      if (showLowStockOnly) {
        setProducts(lowStockData.products);
        setPagination({});
      } else {
        const productsData = await productService.getAll({
          page: currentPage,
          limit: 12,
          search: searchQuery,
        });
        setProducts(productsData.products);
        setPagination(productsData.pagination);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, showLowStockOnly]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, formData);
      } else {
        await productService.create(formData);
      }
      setProductModalOpen(false);
      setEditingProduct(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(id);
        fetchData();
      } catch {
        alert('Failed to delete product');
      }
    }
  };

  const handleStockUpdate = async (data) => {
    try {
      await productService.updateStock(selectedProduct.id, data);
      setStockModalOpen(false);
      setSelectedProduct(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update stock');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData();
  };

  if (loading && !products.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Loading Inventory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <main className="container mx-auto px-6 py-8">
        {/* Header & Stats */}
        <div className="mb-10 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-500">Overview of your inventory status.</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-primary-500">
              <div className="p-4 rounded-full bg-primary-50 text-primary-600">
                <FiPackage size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Products</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalProducts}</h3>
              </div>
            </div>

            <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-red-500">
              <div className="p-4 rounded-full bg-red-50 text-red-600">
                <FiAlertCircle size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Low Stock Items</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.lowStockCount}</h3>
              </div>
            </div>

            <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-indigo-500">
              <div className="p-4 rounded-full bg-indigo-50 text-indigo-600">
                <FiTruck size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Suppliers</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalSuppliers}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar (Search, Filters, Buttons) */}
        <div className="glass-card p-4 mb-8 flex flex-col xl:flex-row gap-4 items-center justify-between sticky top-24 z-30 animate-fade-in transition-all">
          {/* Search */}
          <div className="w-full xl:w-96 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-100 text-gray-700 placeholder-gray-400 transition-all"
              />
            </form>
          </div>

          {/* Controls Group */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
            {/* Filter Low Stock */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => {
                  setShowLowStockOnly(false);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${!showLowStockOnly
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setShowLowStockOnly(true);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${showLowStockOnly
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Low Stock
              </button>
            </div>

            {/* Admin Actions */}
            <button
              onClick={() => setSupplierModalOpen(true)}
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 font-medium shadow-sm"
            >
              <FiTruck className="text-indigo-500" />
              <span>Suppliers</span>
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => setApprovalModalOpen(true)}
                className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 font-medium shadow-sm"
              >
                <FiCheckSquare className="text-green-500" />
                <span>Approvals</span>
              </button>
            )}

            <button
              onClick={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
              className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/30 px-5 py-2.5"
            >
              <FiPlus size={20} />
              <span className="hidden sm:inline">New Product</span>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="glass-card py-20 text-center animate-fade-in">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage className="text-4xl text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {searchQuery ? `No results found for "${searchQuery}"` : "Get started by adding your first product to the inventory."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={(prod) => {
                  setEditingProduct(prod);
                  setProductModalOpen(true);
                }}
                onDelete={handleDelete}
                onViewDetail={(prod) => {
                  setSelectedProduct(prod);
                  setStockModalOpen(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Pagination */}{!showLowStockOnly && pagination.total_pages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12 animate-fade-in">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-3 rounded-xl border border-gray-200 hover:bg-white hover:shadow-md disabled:opacity-50 disabled:hover:shadow-none transition-all"
            >
              <FiChevronLeft size={20} />
            </button>
            <span className="text-gray-600 font-medium">
              Page {currentPage} of {pagination.total_pages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.total_pages}
              className="p-3 rounded-xl border border-gray-200 hover:bg-white hover:shadow-md disabled:opacity-50 disabled:hover:shadow-none transition-all"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <ProductModal
        key={editingProduct ? editingProduct.id : 'create'}
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleCreateOrUpdate}
        product={editingProduct}
        suppliers={suppliers}
      />

      <StockModal
        key={selectedProduct ? selectedProduct.id : 'stock'}
        isOpen={stockModalOpen}
        onClose={() => {
          setStockModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleStockUpdate}
        product={selectedProduct}
      />

      {/* Pending Implementation: these components need to be created */}
      {supplierModalOpen && (
        <SupplierModal
          isOpen={supplierModalOpen}
          onClose={() => setSupplierModalOpen(false)}
          refreshSuppliers={fetchData}
        />
      )}

      {approvalModalOpen && user?.role === 'admin' && (
        <UserManagementModal
          isOpen={approvalModalOpen}
          onClose={() => setApprovalModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;