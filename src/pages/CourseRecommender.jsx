const CourseRecommender = () => {
  const openCourseRecommender = () => {
    window.open("http://localhost:8501","_blank");
  }
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-6">Course Recommender</h1>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <p className="text-gray-400 text-lg">
            Click here to access the Course Recommender Tool.
            <button className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200" onClick={openCourseRecommender}>
              Open Course Recommender
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseRecommender;