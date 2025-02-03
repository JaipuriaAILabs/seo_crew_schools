import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ErrorBoundary from './components/ErrorBoundary';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import SignUpPage from './components/auth/SignUpPage';
import VerifyOTP from './components/auth/VerifyOTP';

import Header from './components/common/Header';
import Hero from './components/home/Hero';
import Features from './components/home/Features';
import ProcessFlow from './components/home/ProcessFlow';
import InstituteForm from './components/forms/InstituteForm';
import DownloadPage from './components/download/DownloadPage';
import BlogGeneration from './components/blog/BlogGeneration';

// PrivateRoute component
function PrivateRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
}

// PublicRoute component for auth pages
function PublicRoute({ children }) {
    const { user } = useAuth();
    return !user ? children : <Navigate to="/" />;
}

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                    <div className="min-h-screen flex flex-col">
                        <Header />
                        <main className="flex-grow">
                            <Routes>
                                <Route path="/" element={
                                    <PrivateRoute>
                                        <div>
                                            <Hero />
                                            <Features />
                                            <ProcessFlow />
                                        </div>
                                    </PrivateRoute>
                                } />
                                <Route path="/form" element={
                                    <PrivateRoute>
                                        <InstituteForm />
                                    </PrivateRoute>
                                } />
                                <Route path="/signup" element={
                                    <PublicRoute>
                                        <SignUpPage />
                                    </PublicRoute>
                                } />
                                <Route path="/login" element={
                                    <PublicRoute>
                                        <LoginPage />
                                    </PublicRoute>
                                } />
                                <Route path="/download" element={
                                    <PrivateRoute>
                                        <DownloadPage />
                                    </PrivateRoute>
                                } />
                                <Route path="/forgot-password" element={
                                    <PublicRoute>
                                        <ForgotPassword />
                                    </PublicRoute>
                                } />
                                <Route path="/reset-password" element={
                                    <PublicRoute>
                                        <ResetPassword />
                                    </PublicRoute>
                                } />
                                <Route path="/blog" element={<BlogGeneration />} />
                                <Route path="/verify-otp" element={
                                    <PublicRoute>
                                        <VerifyOTP />
                                    </PublicRoute>
                                } />
                            </Routes>
                        </main>
                        <ToastContainer />
                    </div>
                </Router>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
