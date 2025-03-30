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
    <ul className="flex flex-col w-full justify-start p-4 rounded-lg bg-[#0F172A] gap-3 md:flex-row md:gap-8 md:p-0 md:bg-none text-white/90 font-medium items-center">
      <Link to="/">
        <li className="w-full px-4 py-2 md:px-0 md:py-0 hover:bg-white/10 md:hover:bg-transparent md:hover:text-pink-500 rounded-lg transition-all duration-300 cursor-pointer">
          Home
        </li>
      </Link>
      <Link to="/shop">
        <li className="w-full px-4 py-2 md:px-0 md:py-0 hover:bg-white/10 md:hover:bg-transparent md:hover:text-pink-500 rounded-lg transition-all duration-300 cursor-pointer">
          Shop
        </li>
      </Link>
      <Link to="/cart">
        <li className="w-full px-4 py-2 md:px-0 md:py-0 hover:bg-white/10 md:hover:bg-transparent md:hover:text-pink-500 rounded-lg transition-all duration-300 cursor-pointer">
          Cart
        </li>
      </Link>
      <Link to="/history">
        <li className="w-full px-4 py-2 md:px-0 md:py-0 hover:bg-white/10 md:hover:bg-transparent md:hover:text-pink-500 rounded-lg transition-all duration-300 cursor-pointer">
          History
        </li>
      </Link>
      <Link to="/dashboard">
        <li className="w-full px-4 py-2 md:px-0 md:py-0 hover:bg-white/10 md:hover:bg-transparent md:hover:text-pink-500 rounded-lg transition-all duration-300 cursor-pointer">
          Dashboard
        </li>
      </Link>
    </ul>
  );

  return (
    <>
      <nav className="w-full fixed top-0 bg-gradient-to-r bg-[#0F172A] flex justify-between items-center px-4 py-2 shadow-lg shadow-indigo-500/10 z-50">
        <span className="flex items-center gap-3">
          {/* Menu Button */}
          <button
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-colors duration-300"
            onClick={handleMenu}
          >
            <img className="w-6 h-6" src={assets.menu} alt="menu" />
          </button>

          {/* Logo */}
          <img
            src={assets.logo}
            className="w-12 h-12 rounded-full ring-1 ring-white shadow-lg"
            alt="Logo"
          />
        </span>

        {/* Mobile Menu */}
        <div
          className={`
          fixed inset-x-0 top-[73px] p-4 md:hidden
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
        <div className="flex items-center gap-4">
          {/* Search Box */}
          <form className="relative flex items-center">
            <input
              type="text"
              className="w-full md:w-[200px] px-4 py-2 rounded-lg bg-white/10 border border-white/20 outline-none text-white placeholder:text-white/60 focus:border-pink-500/50 transition-all duration-300"
              placeholder="Search Items..."
            />
            <button
              type="submit"
              className="absolute right-3 hover:opacity-75 transition-opacity"
            >
              <img src={assets.search} className="w-5 h-5" alt="search" />
            </button>
          </form>

          {user ? (
            <div className="flex items-center gap-4">
              <img
                src={user.profilePic}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <button
                onClick={() =>
                  (window.location.href =
                    "http://localhost:3000/googleAuth/logout")
                }
                className="text-black bg-red-500 p-2 rounded-md cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/signup">
              <button className="px-4 py-2 rounded-lg bg-pink-500 text-black font-medium hover:shadow-lg">
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
