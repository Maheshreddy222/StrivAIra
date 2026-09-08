import { Users, FileEdit, MessageSquare, TrendingUp } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Users size={40} />,
      title: 'Professional Onboarding',
      description: 'Share your industry and expertise for personalized guidance',
    },
    {
      icon: <FileEdit size={40} />,
      title: 'Craft Your Documents',
      description: 'Create ATS-optimized resumes and compelling cover letters',
    },
    {
      icon: <MessageSquare size={40} />,
      title: 'Prepare for Interviews',
      description: 'Practice with AI-powered mock interviews tailored to your role',
    },
    {
      icon: <TrendingUp size={40} />,
      title: 'Track Your Progress',
      description: 'Monitor improvements with detailed performance analytics',
    },
  ];

  return (
    <section className="bg-black text-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg">
            Four simple steps to accelerate your career growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-gray-900 border border-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <div className="text-blue-500">{step.icon}</div>
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;