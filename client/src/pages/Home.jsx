import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  markComponentLoaded,
  resetLoadingState,
} from "../redux/Slice/homeSlice";
import Banner from "../components/Home/Banner";
import ComicsSection from "../components/Home/ComicsSection";
import ClothesSection from "../components/Home/ClothesSection";
import ActionFigureSection from "../components/Home/ActionFigureSection";

const Home = () => {
  const dispatch = useDispatch();
  const { isLoading, loadingProgress, componentLoadStatus } = useSelector(
    (state) => state.home
  );

  const bannerRef = useRef(null);
  const comicsRef = useRef(null);
  const clothesRef = useRef(null);
  const actionFiguresRef = useRef(null);

  // Reset loading state when component mounts
  useEffect(() => {
    dispatch(resetLoadingState());
  }, [dispatch]);

  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Determine which component was loaded based on the ref
          let componentName = "";
          if (entry.target === bannerRef.current) componentName = "banner";
          else if (entry.target === comicsRef.current) componentName = "comics";
          else if (entry.target === clothesRef.current)
            componentName = "clothes";
          else if (entry.target === actionFiguresRef.current)
            componentName = "actionFigures";

          if (componentName && !componentLoadStatus[componentName]) {
            // Wait a bit for component to fully render and images to load
            setTimeout(() => {
              dispatch(markComponentLoaded(componentName));
            }, 100);
          }
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: "50px",
    });

    // Wait for DOM to be ready then start observing
    const startObserving = () => {
      const refs = [bannerRef, comicsRef, clothesRef, actionFiguresRef];

      refs.forEach((ref) => {
        if (ref.current) {
          observer.observe(ref.current);
        }
      });
    };

    // Start observing after a short delay to ensure components are mounted
    const timer = setTimeout(startObserving, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [dispatch, componentLoadStatus]);

  // Also detect when all images in the page are loaded
  useEffect(() => {
    const handleImagesLoad = () => {
      const images = document.querySelectorAll("img");
      let loadedImages = 0;

      const checkAllImagesLoaded = () => {
        loadedImages++;
        if (loadedImages === images.length && images.length > 0) {
          // Extra boost to progress when all images are loaded
          if (!componentLoadStatus.banner) {
            setTimeout(() => dispatch(markComponentLoaded("banner")), 200);
          }
        }
      };

      images.forEach((img) => {
        if (img.complete) {
          checkAllImagesLoaded();
        } else {
          img.addEventListener("load", checkAllImagesLoaded);
          img.addEventListener("error", checkAllImagesLoaded); // Count failed images too
        }
      });
    };

    // Check images after components mount
    setTimeout(handleImagesLoad, 500);
  }, [dispatch, componentLoadStatus.banner]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
        <div className="w-80 max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Loading Anime Alley...
          </h2>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>

          <div className="text-center text-gray-600 font-medium">
            {loadingProgress}%
          </div>

          <div className="text-center text-gray-500 text-sm mt-2">
            {loadingProgress < 25 && "Loading banner..."}
            {loadingProgress >= 25 &&
              loadingProgress < 50 &&
              "Loading comics section..."}
            {loadingProgress >= 50 &&
              loadingProgress < 75 &&
              "Loading clothes section..."}
            {loadingProgress >= 75 &&
              loadingProgress < 100 &&
              "Loading action figures..."}
            {loadingProgress === 100 && "Almost ready!"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={bannerRef}>
        <Banner />
      </div>

      <div className="w-screen h-1 bg-red-500" />

      <div className="sticky top-0 z-10" ref={comicsRef}>
        <ComicsSection />
      </div>

      <div className="sticky top-0 z-20" ref={clothesRef}>
        <ClothesSection />
      </div>

      <hr />

      <div className="sticky top-0 z-30" ref={actionFiguresRef}>
        <ActionFigureSection />
      </div>
    </>
  );
};

export default Home;
