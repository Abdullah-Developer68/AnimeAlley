import { Link } from "react-router-dom";
import {
  FaBox,
  FaClipboardList,
  FaUsers,
  FaBoxOpen,
  FaPlus,
} from "react-icons/fa";

const Dashbar = () => {
  return (
    <div className="sticky top-0 h-screen w-64 bg-black bg-opacity-95 text-white shadow-lg overflow-y-auto">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h2>
      </div>

      <nav className="p-4 space-y-2">
        {/* Add New Product */}
        <Link
          to="/admin/add-product"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
        >
          <FaPlus className="text-pink-500 group-hover:text-purple-500 transition-colors" />
          <span className="text-white/70 group-hover:text-white/90">
            Add New Product
          </span>
        </Link>

        {/* Pending Orders */}
        <Link
          to="/admin/pending-orders"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
        >
          <FaClipboardList className="text-pink-500 group-hover:text-purple-500 transition-colors" />
          <span className="text-white/70 group-hover:text-white/90">
            Pending Orders
          </span>
        </Link>

        {/* Completed Orders */}
        <Link
          to="/admin/completed-orders"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
        >
          <FaBox className="text-pink-500 group-hover:text-purple-500 transition-colors" />
          <span className="text-white/70 group-hover:text-white/90">
            Completed Orders
          </span>
        </Link>

        {/* Member Management */}
        <Link
          to="/admin/members"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
        >
          <FaUsers className="text-pink-500 group-hover:text-purple-500 transition-colors" />
          <span className="text-white/70 group-hover:text-white/90">
            Member Management
          </span>
        </Link>

        {/* Inventory Management */}
        <Link
          to="/admin/inventory"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
        >
          <FaBoxOpen className="text-pink-500 group-hover:text-purple-500 transition-colors" />
          <span className="text-white/70 group-hover:text-white/90">
            Inventory
          </span>
        </Link>
      </nav>

      {/* Stats Section */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-white/50">Total Orders</span>
            <span className="text-pink-500">128</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Pending</span>
            <span className="text-purple-500">23</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashbar;
