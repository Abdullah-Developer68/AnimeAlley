import { Link } from "react-router-dom";
import assets from "../assets/asset";
import Navbar from "../components/Global/Navbar";
import Footer from "../components/Global/Footer";

const Cart = () => {
  // Sample cart items for UI
  const cartItems = [
    {
      name: "Naruto Manga Vol. 1",
      image: assets.sao,
      price: 599,
      quantity: 1,
      category: "Comics",
      genre: "Action",
    },
    {
      name: "Anime T-Shirt",
      image: assets.sao,
      price: 899,
      quantity: 2,
      category: "Clothes",
      itemSize: "M",
    },
  ];

  return (
    <>
      <div className="flex flex-col">
        <Navbar />

        <div className="container mx-auto p-4 md:p-8 mt-16">
          <div className="flex flex-col lg:flex-row bg-gradient-to-b bg-black rounded-xl shadow-lg overflow-hidden">
            {/* Cart Items Section */}
            <div className="w-full h-[600px] lg:w-3/4 p-4 md:p-8">
              <h2 className="text-2xl font-bold mb-6 text-white/90">
                Shopping Cart
              </h2>

              <div className="flex justify-between items-center border-b border-white/10 mb-6 pb-4">
                <span className="text-lg text-white/70">
                  Items: {cartItems.length}
                </span>
                <Link to="/shop">
                  <span className="text-pink-500 hover:text-pink-400 transition-colors">
                    Continue Shopping
                  </span>
                </Link>
              </div>

              {/* Cart Items List */}
              <div className="h-[500px] lg:h-[600px] overflow-auto">
                {cartItems.map((item, index) => (
                  <div
                    key={index}
                    className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4"
                  >
                    {/* Product Info */}
                    <div className="flex flex-col gap-2 mb-4 sm:mb-0">
                      <h3 className="text-lg font-medium text-white/90">
                        {item.name}
                      </h3>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      {item.category !== "Action Figures" && (
                        <span className="text-sm bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-1 rounded-full inline-block">
                          {item.category === "Clothes"
                            ? `Size: ${item.itemSize}`
                            : `Genre: ${item.genre}`}
                        </span>
                      )}
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center gap-4">
                      <div className="flex border border-white/20 rounded-lg overflow-hidden">
                        <button className="px-3 py-1 text-white/90 hover:bg-white/10 transition-colors">
                          -
                        </button>
                        <input
                          type="text"
                          className="w-12 text-center bg-transparent text-white"
                          value={item.quantity}
                          readOnly
                        />
                        <button className="px-3 py-1 text-white/90 hover:bg-white/10 transition-colors">
                          +
                        </button>
                      </div>
                      <p className="text-white/90 font-bold text-xs">
                        Rs. {item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="w-full lg:w-1/4 bg-white/5 backdrop-blur-sm p-6">
              <h2 className="text-xl font-bold mb-6 text-white/90">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-white/70">
                  <span>Items ({cartItems.length})</span>
                  <span>Rs. 1,498</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Shipping</span>
                  <span>Rs. 99</span>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between text-white font-bold">
                    <span>Total</span>
                    <span>Rs. 1,597</span>
                  </div>
                </div>
              </div>

              {/* Checkout Section */}
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Delivery Address"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:border-pink-500/50 outline-none transition-colors"
                />
                <button className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300">
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative bottom-0 w-full">
        <Footer />
      </div>
    </>
  );
};

export default Cart;
