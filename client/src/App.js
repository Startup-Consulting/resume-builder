import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import NewResumePage from './pages/NewResumePage';
import ResumeReviewPage from './pages/ResumeReviewPage';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/new-resume" element={<NewResumePage />} />
          <Route path="/resume-review" element={<ResumeReviewPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
