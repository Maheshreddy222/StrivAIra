import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import BuildResume from "./pages/BuildResume";
import MockInterview from "./pages/MockInterview";
import CourseRecommender from "./pages/CourseRecommender";
import ProtectedRoute from "./components/ProtectedRoute";
import InterviewPrepModal from "./pages/InterviewPrepModal";
import InterviewSession from "./pages/InterviewSession";
import Trends from "./pages/Trends";
import StrivAIra from "./pages/StrivAIra";
import CareerRoadmap from "./pages/CareerRoadmap";
import CareerCompass from "./pages/CareerCompass";
import CareerDigitalTwin from "./pages/CareerDigitalTwin";
import CareerAnalyzer from "./pages/CareerAnalyzer";

function App() {
  return (
    <Router>
      <div className="w-screen min-h-screen bg-black overflow-x-hidden">
        <Header />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/build-resume"
            element={
              <ProtectedRoute>
                <BuildResume />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mock-interview"
            element={
              <ProtectedRoute>
                <MockInterview />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/course-recommender"
            element={
              <ProtectedRoute>
                <CourseRecommender />
              </ProtectedRoute>
            }
          /> */}
          <Route 
            path="/interview-prep"
            element={
              <ProtectedRoute>
                <InterviewPrepModal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mock-interview/interview-prep"
            element={
              <ProtectedRoute>
                <InterviewSession />
              </ProtectedRoute>
            }
          />
          <Route
            path = "/trends"
            element = {
              <ProtectedRoute>
                <Trends />
              </ProtectedRoute>
            }
            ></Route>
            <Route 
              path = "/strivaira-chatbot"
              element = {
                <ProtectedRoute>
                  <StrivAIra />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path = "/career-roadmap"
              element = {
                <ProtectedRoute>
                  <CareerRoadmap />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path = "/career-compass"
              element = {
                <ProtectedRoute>
                  <CareerCompass />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path = "/digital-twin"
              element = {
                <ProtectedRoute>
                  <CareerDigitalTwin />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path = "/career-analyzer"
              element = {
                <ProtectedRoute>
                  <CareerAnalyzer />
                </ProtectedRoute>
              }
            ></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
