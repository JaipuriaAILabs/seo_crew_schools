import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

/**
 * SignUpPage component allows users to create a new account.
 */
export default function SignUpPage() {
    const [email, setEmail] = useState(''); // State for email input
    const [password, setPassword] = useState(''); // State for password input
    const [loading, setLoading] = useState(false); // State to manage loading status
    const [error, setError] = useState(null); // State to manage error messages
    const navigate = useNavigate(); // Hook to programmatically navigate

    /**
     * Handles the sign-up process.
     * @param {Event} e - The event triggered by form submission.
     */
    const handleSignUp = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setError(null); // Reset error state
        setLoading(true); // Set loading state to true

        try {
            // Check if email domain is allowed
            const domain = email.split('@')[1];
            if (domain !== import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN) {
                throw new Error(`Only ${import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN} email addresses are allowed`);
            }

            // Attempt to sign up with Supabase
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/verify-otp`,
                }
            });

            if (error) throw error; // Throw error if sign-up fails

            if (data?.user) {
                // Store email temporarily for OTP verification
                localStorage.setItem('verificationEmail', email);
                toast.success('Email verification link sent!', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: false
                });
                setTimeout(() => {
                    navigate('/verify-otp'); // Redirect to OTP verification page
                }, 2000);
            }
        } catch (error) {
            console.error('Signup error:', error); // Log error for debugging
            setError(error.message); // Set error message for user feedback
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                    <p className="mt-2 text-gray-600">Sign up to get started with SEO Blog Writer</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-xl p-8 border border-gray-100"
                >
                    <form onSubmit={handleSignUp} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                {error} {/* Display error message if exists */}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} // Update email state on change
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200
                                         focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                         transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} // Update password state on change
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200
                                         focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                         transition-colors"
                                required
                            />
                        </div>

                        <div className="flex flex-col space-y-3">
                            <button
                                type="submit"
                                disabled={loading} // Disable button while loading
                                className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg
                                         hover:bg-indigo-700 transition-colors flex items-center justify-center
                                         disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Account...
                                    </>
                                ) : (
                                    'Sign Up'
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/login')} // Navigate to login page
                                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                            >
                                Already have an account? Sign in
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    );
}
