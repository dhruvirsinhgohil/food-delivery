
import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import PopularRestaurants from "../components/home/PopularRestaurants";
import PopularFoods from "../components/home/PopularFoods";
import SpecialOffers from "../components/home/SpecialOffers";
import WhyChooseUs from "../components/home/WhyChooseUs";

function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <PopularRestaurants />
      <PopularFoods />
      <SpecialOffers />
        <WhyChooseUs />
    </>
  );
}

export default Home;
