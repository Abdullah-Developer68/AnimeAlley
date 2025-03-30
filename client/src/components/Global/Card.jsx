import assets from "../../assets/asset";
import { Link } from "react-router-dom";
/* eslint-disable react/prop-types */
const Cards = ({ product }) => {
  return (
    <div
      key={product._id}
      className="group bg-gradient-to-b bg-black rounded-lg overflow-hidden border border-white/10 hover:border-pink-500/30 transition-all duration-300 shadow-lg max-w-[200px]"
    >
      {/* Product Image */}
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Product Info */}
      <div className="p-2">
        {/* Title and Rating */}
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-white/90 font-medium text-sm truncate max-w-[120px]">
            {product.name}
          </h3>
          <div className="flex items-center bg-white/10 px-1 py-0.5 rounded-full">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-white/70 text-xs ml-0.5">
              {product.rating}
            </span>
          </div>
        </div>

        {/* Category */}
        <p className="text-white/50 text-xs mb-1.5">{product.category}</p>

        {/* Price and Add to Cart */}
        <div className="flex justify-between items-center">
          <p className="text-black p-1 rounded-md font-bold text-xs bg-yellow-500">
            Rs. {product.price}
          </p>
          {/* Add to Cart Button with product._id as the url parameter */}
          <Link to={`/shop/:${product._id}`}>
            <button className="cursor-pointer p-1 rounded-md bg-pink-500 text-black text-xs font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300">
              <img src={assets.bag} alt="add to cart" className="w-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cards;
