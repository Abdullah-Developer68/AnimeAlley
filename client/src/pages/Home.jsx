import Navbar from "../components/Global/Navbar";
import Banner from "../components/Home/Banner";
import ComicsSection from "../components/Home/ComicsSection";
import ClothesSection from "../components/Home/ClothesSection";
import ActionFigureSection from "../components/Home/ActionFigureSection";
import Footer from "../components/Global/Footer";

const Home = () => {
  return (
    <>
      <Navbar />
      <Banner />

      <div className="w-screen h-1 bg-red-500" />
      <div className="sticky top-0 z-10">
        <ComicsSection />
      </div>

      <div className="sticky top-0 z-20 ">
        <ClothesSection />
      </div>

      <hr />

      <div className="sticky top-0 z-30">
        <ActionFigureSection />
      </div>
    </>
  );
};

export default Home;
