/* eslint-disable react/prop-types */
const Cards = ({ product }) => {
  return (
    <div
      key={product._id}
      className="group bg-gradient-to-b bg-black rounded-xl overflow-hidden border border-white/10 hover:border-pink-500/30 transition-all duration-300 shadow-lg"
    >
      {/* Product Image */}
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Title and Rating */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white/90 font-medium text-lg truncate">
            {product.name}
          </h3>
          <div className="flex items-center bg-white/10 px-2 py-1 rounded-full">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-white/70 text-sm ml-1">{product.rating}</span>
          </div>
        </div>

        {/* Category */}
        <p className="text-white/50 text-sm mb-3">{product.category}</p>

        {/* Price and Add to Cart */}
        <div className="flex justify-between items-center">
          <p className="text-white/90 font-bold">₹{product.price}</p>
          <button className="px-3 py-1.5 rounded-lg bg-yellow-500 text-black text-sm font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cards;
