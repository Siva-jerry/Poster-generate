import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import TrendingDesigns from "../components/home/TrendingDesigns";
import Features from "../components/home/Features";
import HowItWorks from "../components/home/HowItWorks";
import HomeCTA from "../components/home/HomeCTA";

import "./HomePage.css";

function HomePage() {
  return (
    <main className="home-page">
      <Hero />
      <Categories />
      <TrendingDesigns />
      <Features />
      <HowItWorks />
      <HomeCTA />
    </main>
  );
}

export default HomePage;