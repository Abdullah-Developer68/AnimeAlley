import Navbar from "../Global/Navbar";
import assets from "../../assets/asset";

const ProductDes = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0b0133] text-white">
        {/* Navigation Bar */}
        <div className="mt-16 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button className="flex items-center gap-2 text-white/70 hover:text-white">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Shop
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Product Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Left Side - Image */}
            <div className="rounded-xl overflow-hidden border border-purple-500/30 shadow-lg shadow-purple-500/10">
              <div className="aspect-[4/3] max-h-[500px]">
                {" "}
                {/* Added aspect ratio and max height */}
                <img
                  src={assets.genos}
                  alt="Product"
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Right Side - Details */}
            <div className="space-y-6">
              {/* Title and Badge */}
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-white">
                  Anime Product Name
                </h2>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-pink-500 text-white text-sm font-medium rounded-full">
                    Category
                  </span>
                  <div className="flex items-center bg-white/10 px-3 py-1 rounded-full">
                    <span className="text-yellow-400">★</span>
                    <span className="text-white/70 text-sm ml-1">4.5</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-white/70 text-sm leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco.
              </p>

              {/* Size Selection */}
              <div className="space-y-3">
                <h3 className="text-white/90 text-sm font-medium">
                  Select Size
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["S", "M", "L", "XL"].map((size) => (
                    <button
                      key={size}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white/70 hover:bg-pink-500 hover:text-white transition-all duration-300 cursor-pointer"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <h3 className="text-white/90 text-sm font-medium">Quantity</h3>
                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors cursor-pointer">
                    -
                  </button>
                  <span className="w-12 text-center text-white">1</span>
                  <button className="w-10 h-10 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors cursor-pointer">
                    +
                  </button>
                </div>
              </div>

              {/* Price and Add to Cart */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div>
                  <p className="text-white/60 text-sm">Price</p>
                  <p className="text-2xl font-bold text-white">Rs. 1,999</p>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 cursor-pointer">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Review Card */}
              {[1, 2, 3, 4].map((review) => (
                <div
                  key={review}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600" />
                    <div>
                      <h4 className="font-medium">Customer Name</h4>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400">
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm">
                    This product exceeded my expectations! The quality is
                    amazing and the design is perfect.
                  </p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <button className="px-6 py-2 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors cursor-pointer font-medium">
                View All Reviews
              </button>
            </div>
          </div>

          {/* Recommended Products Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Recommended Product Card */}
              {[1, 2, 3, 4].map((product) => (
                <div
                  key={product}
                  className="group bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-pink-500/30 transition-all duration-300"
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={assets.genos}
                      alt="Recommended Product"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-white/90 font-medium text-sm mb-1">
                      Product Name
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-pink-500 font-bold text-sm">
                        Rs. 1,999
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-white/70 text-xs">4.5</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDes;
