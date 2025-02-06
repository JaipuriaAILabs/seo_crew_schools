import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

/**
 * ForgotPassword component allows users to reset their password by entering their email.
 */
export default function ForgotPassword() {
    const [email, setEmail] = useState(''); // State to hold the email input
    const [loading, setLoading] = useState(false); // State to manage loading status
    const [message, setMessage] = useState(null); // State to hold success message
    const [error, setError] = useState(null); // State to hold error message
    const navigate = useNavigate(); // Hook to programmatically navigate

    /**
     * Handles the form submission for password reset.
     * @param {Event} e - The event object.
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setError(null); // Reset error state
        setMessage(null); // Reset message state
        setLoading(true); // Set loading state to true

        try {
            // Attempt to reset password for the provided email
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error; // Throw error if there is an issue

            setMessage('Check your email for the password reset link'); // Set success message
            setTimeout(() => navigate('/login'), 5000); // Redirect to login after 5 seconds
        } catch (error) {
            console.error('Error:', error); // Log error for debugging
            setError(error.message); // Set error message to display
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full mx-4 sm:mx-auto"
            >
                <div className="text-center mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Reset Password</h2>
                    <p className="mt-2 text-sm sm:text-base text-gray-600">Enter your email to receive a password reset link</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100"
                >
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs sm:text-sm mb-4">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-xs sm:text-sm mb-4">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md
                                         text-sm sm:text-base
                                         shadow-sm focus:outline-none focus:ring-indigo-500
                                         focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div className="flex flex-col space-y-2 sm:space-y-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2 sm:py-3 px-4 bg-indigo-600 text-white rounded-lg
                                         text-sm sm:text-base
                                         hover:bg-indigo-700 transition-colors flex items-center justify-center
                                         disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending Reset Link...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/login')} // Navigate back to login
                                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    );
}
