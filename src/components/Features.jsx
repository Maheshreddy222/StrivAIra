import { Sparkles, Briefcase, TrendingUp, FileText } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Sparkles size={40} />,
      title: 'AI-Powered Career Guidance',
      description:
        'Get personalized career advice and insights powered by advanced AI technology.',
    },
    {
      icon: <Briefcase size={40} />,
      title: 'Interview Preparation',
      description:
        'Practice with role-specific questions and get instant feedback to improve your performance.',
    },
    {
      icon: <TrendingUp size={40} />,
      title: 'Industry Insights',
      description:
        'Stay ahead with real-time industry trends, salary data, and market analysis.',
    },
    {
      icon: <FileText size={40} />,
      title: 'Smart Resume Creation',
      description: 'Generate ATS-optimized resumes with AI assistance.',
    },
  ];

  return (
    <section className="bg-black text-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Powerful Features for Your Career Growth
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition"
            >
              <div className="text-blue-500 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;