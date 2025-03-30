import { useState } from "react";
import { Link } from "react-router-dom";
import assets from "../../assets/asset";
import useAuth from "../../Hooks/UseAuth";

const Navbar = () => {
  const [menu, setMenu] = useState(false);
  const { user } = useAuth();

  const handleMenu = () => {
    setMenu(!menu);
  };

  const navLinks = (
    <ul className="flex flex-col w-full justify-start p-2 rounded-lg bg-[#0F172A] gap-2 md:flex-row md:gap-8 md:p-0 md:bg-none text-white/90 font-medium items-center">
      <Link to="/" className="w-full md:w-auto">
        <li className="w-full px-3 py-1.5 md:px-0 md:py-0 hover:bg-white/10 md:hover:bg-transparent md:hover:text-pink-500 rounded-lg transition-all duration-300 cursor-pointer text-sm md:text-base">
          Home
        </li>
      </Link>
      <Link to="/shop" className="w-full md:w-auto">
        <li className="w-full px-3 py-1.5 md:px-0 md:py-0 hover:bg-white/10 md:hover:bg-transparent md:hover:text-pink-500 rounded-lg transition-all duration-300 cursor-pointer text-sm md:text-base">
          Shop
        </li>
      </Link>
      <Link to="/cart" className="w-full md:w-auto">
        <li className="w-full px-3 py-1.5 md:px-0 md:py-0 hover:bg-white/10 md:hover:bg-transparent md:hover:text-pink-500 rounded-lg transition-all duration-300 cursor-pointer text-sm md:text-base">
          Cart
        </li>
      </Link>
      <Link to="/history" className="w-full md:w-auto">
        <li className="w-full px-3 py-1.5 md:px-0 md:py-0 hover:bg-white/10 md:hover:bg-transparent md:hover:text-pink-500 rounded-lg transition-all duration-300 cursor-pointer text-sm md:text-base">
          History
        </li>
      </Link>
      <Link to="/dashboard" className="w-full md:w-auto">
        <li className="w-full px-3 py-1.5 md:px-0 md:py-0 hover:bg-white/10 md:hover:bg-transparent md:hover:text-pink-500 rounded-lg transition-all duration-300 cursor-pointer text-sm md:text-base">
          Dashboard
        </li>
      </Link>
    </ul>
  );

  return (
    <>
      <nav className="w-full fixed top-0 bg-gradient-to-r bg-[#0F172A] flex justify-between items-center px-3 py-1.5 md:px-4 md:py-2 shadow-lg shadow-indigo-500/10 z-50">
        <span className="flex items-center gap-2 md:gap-3">
          {/* Menu Button */}
          <button
            className="md:hidden inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg hover:bg-white/10 transition-colors duration-300"
            onClick={handleMenu}
          >
            <img
              className="w-5 h-5 md:w-6 md:h-6"
              src={assets.menu}
              alt="menu"
            />
          </button>

          {/* Logo */}
          <img
            src={assets.logo}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full ring-1 ring-red-500 shadow-lg"
            alt="Logo"
          />
        </span>

        {/* Mobile Menu */}
        <div
          className={`
          fixed inset-x-0 top-[60px] md:top-[73px] p-2 md:p-4 md:hidden
          transition-all duration-300 ease-in-out transform
          ${
            menu
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-full pointer-events-none"
          }
        `}
        >
          <div className="bg-[#0b0133]/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/10">
            {navLinks}
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:inline">{navLinks}</div>

        {/* Search and Auth */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search Box */}
          <form className="relative flex items-center">
            <input
              type="text"
              className="w-[120px] md:w-[200px] px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-white/10 border border-white/20 outline-none text-white placeholder:text-white/60 focus:border-pink-500/50 transition-all duration-300 text-sm md:text-base"
              placeholder="Search..."
            />
            <button
              type="submit"
              className="absolute right-2 md:right-3 hover:opacity-75 transition-opacity"
            >
              <img
                src={assets.search}
                className="w-4 h-4 md:w-5 md:h-5"
                alt="search"
              />
            </button>
          </form>

          {user ? (
            <div className="flex items-center gap-2 md:gap-4">
              <img
                src={user.profilePic}
                alt="Profile"
                className="w-7 h-7 md:w-8 md:h-8 rounded-full"
              />
              <button
                onClick={() =>
                  (window.location.href =
                    "http://localhost:3000/googleAuth/logout")
                }
                className="text-black bg-red-500 px-2 py-1 md:px-3 md:py-2 rounded-md cursor-pointer text-sm md:text-base"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/signup">
              <button className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-pink-500 text-black font-medium hover:shadow-lg text-sm md:text-base cursor-pointer">
                Sign Up
              </button>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
