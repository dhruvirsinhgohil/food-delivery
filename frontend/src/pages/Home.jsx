import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import PopularRestaurants from "../components/home/PopularRestaurants";
import PopularFoods from "../components/home/PopularFoods";
import SpecialOffers from "../components/home/SpecialOffers";
import CustomerReviews from "../components/home/CustomerReviews";

function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <PopularRestaurants />
      <PopularFoods />
      <SpecialOffers />
      <CustomerReviews />
    </>
  );
}

export default Home;
