const Stats = () => {
  const stats = [
    { value: '50+', label: 'Industries Covered' },
    { value: '1000+', label: 'Interview Questions' },
    { value: '95%', label: 'Success Rate' },
    { value: '24/7', label: 'AI Support' },
  ];

  return (
    <section className="bg-black text-white py-16 px-6 border-y border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl font-bold mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;