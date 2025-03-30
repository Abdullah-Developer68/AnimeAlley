import { useDispatch } from "react-redux";
import { setCategory } from "../../redux/Slice/categorySlice";
import assets from "../../assets/asset";

const ProductNav = () => {
  const productCategories = [
    { name: "all", icon: assets.house },
    { name: "comics", icon: assets.comics },
    { name: "toys", icon: assets.actionfigure },
    { name: "clothes", icon: assets.clothes },
    { name: "shoes", icon: assets.shoes },
  ];

  // for updating states in redux store
  const dispatch = useDispatch();

  return (
    <div className="w-fit h-fit rounded-full bg-black  py-3 px-4 shadow-lg rounded.full">
      <div className="flex items-center gap-3">
        {productCategories.map((category) => (
          <div
            key={category.name}
            className="flex items-center gap-2 p-2 bg-white/10 rounded-lg cursor-pointer"
            onClick={() => dispatch(setCategory(category.name))}
          >
            <img src={category.icon} alt={category.name} className="w-6 h-6" />
            <span className="text-white/90">{category.name.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductNav;
