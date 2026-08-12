import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Sessions from './pages/Sessions';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';
import Call from './pages/Call';
import Mentoring from './pages/Mentoring';
import Dashboard from './pages/Dashboard';
import JobBoard from './pages/JobBoard';
import MyApplications from './pages/MyApplications';
import Directory from './pages/Directory';
import InterviewExperiences from './pages/InterviewExperiences';
import InterviewExperienceDetail from './pages/InterviewExperienceDetail';
import SubmitInterviewExperience from './pages/SubmitInterviewExperience';
import InterviewBookmarks from './pages/InterviewBookmarks';
import Resources from './pages/Resources';
import ResourceDetail from './pages/ResourceDetail';
import UploadResource from './pages/UploadResource';
import ResourceBookmarks from './pages/ResourceBookmarks';
import Projects from './pages/Projects';
import CreateProject from './pages/CreateProject';
import ProjectDetail from './pages/ProjectDetail';
import ProjectBookmarks from './pages/ProjectBookmarks';

import CareerDashboard from './pages/career/CareerDashboard';
import CareerSkillGaps from './pages/career/CareerSkillGaps';
import CareerRoadmap from './pages/career/CareerRoadmap';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #475569' }
          }} />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:userId" element={<Chat />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/call/:id" element={<Call />} />
              <Route path="/mentoring" element={<Mentoring />} />
              <Route path="/job-board" element={<JobBoard />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/interview-experiences" element={<InterviewExperiences />} />
              <Route path="/interview-experiences/submit" element={<SubmitInterviewExperience />} />
              <Route path="/interview-experiences/bookmarks" element={<InterviewBookmarks />} />
              <Route path="/interview-experiences/:id" element={<InterviewExperienceDetail />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/resources/upload" element={<UploadResource />} />
              <Route path="/resources/bookmarks" element={<ResourceBookmarks />} />
              <Route path="/resources/:id" element={<ResourceDetail />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/create" element={<CreateProject />} />
              <Route path="/projects/bookmarks" element={<ProjectBookmarks />} />
              <Route path="/projects/:slug" element={<ProjectDetail />} />
              
              <Route path="/career" element={<CareerDashboard />} />
              <Route path="/career/skill-gaps" element={<CareerSkillGaps />} />
              <Route path="/career/roadmap" element={<CareerRoadmap />} />
              
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
