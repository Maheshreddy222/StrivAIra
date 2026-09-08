import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const Hero = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  const handleGetStarted = () => {
    if (isSignedIn) navigate("/dashboard");
    else navigate("/dashboard");
  };

  return (
    <section className="w-full pt-36 md:pt-48 pb-10 bg-black text-white">
      <div className="space-y-6 text-center px-6">
        <div className="space-y-6 mx-auto">
          <h1 className="font-extrabold tracking-tight leading-[1.05] text-center">
  <span className="block text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl">
    Your AI Career Coach for
  </span>

  <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-b from-gray-200 via-gray-400 to-gray-600 text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl">
    Professional Success
  </span>
</h1>


          <p className="mx-auto max-w-[600px] text-gray-400 md:text-xl">
            Advance your career with personalized guidance, interview prep, and
            AI-powered tools for job success.
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleGetStarted}
            className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Get Started
          </button>

          
        </div>

        <div className="mt-10 flex justify-center">
          <img
            src="src/banner.jpg"
            alt="Dashboard Preview"
            className="rounded-lg shadow-2xl border border-gray-700 w-full max-w-5xl"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
