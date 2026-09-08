import Hero from '../components/Hero';
import Features from '../components/Features';
import Stats from '../components/Stats';
import HowItWorks from '../components/HowItWorks';

const HomePage = () => {
  return (
    <div className="bg-black">
      <Hero />
      <Features />
      <Stats />
      <HowItWorks />
    </div>
  );
};

export default HomePage;