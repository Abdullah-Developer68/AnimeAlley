import Navbar from "../components/Global/Navbar";
import FilterBar from "../components/Shop/FilterBar";
import ProductNav from "../components/Shop/ProductNav";
import Footer from "../components/Global/Footer";
import ProductGrid from "../components/Shop/ProductGrid";
import Pagination from "../components/Shop/Pagination";

const Shop = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Main Content */}
      <div className="flex mt-[65px]">
        <div className="">
          <FilterBar />
        </div>
        <div className="flex flex-col justify-center items-center w-full">
          <div className="mt-15">
            <ProductNav />
          </div>
          <ProductGrid />
          <Pagination />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
