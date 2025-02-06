import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify'; // Import toast for notifications

/**
 * ResetPassword component allows users to reset their password using a token.
 */
export default function ResetPassword() {
    const [password, setPassword] = useState(''); // State for new password
    const [confirmPassword, setConfirmPassword] = useState(''); // State for confirming new password
    const [loading, setLoading] = useState(false); // State to manage loading status
    const [error, setError] = useState(null); // State to manage error messages
    const navigate = useNavigate(); // Hook to programmatically navigate
    const [searchParams] = useSearchParams(); // Hook to access URL search parameters
    const tokenHash = searchParams.get('token_hash'); // Extract token hash from URL
    const type = searchParams.get('type'); // Extract type from URL

    // Effect to check token validity and redirect if invalid
    useEffect(() => {
        if (!tokenHash || type !== 'recovery') {
            navigate('/login'); // Redirect to login if token is invalid
        }
    }, [tokenHash, type, navigate]);

    // Handle form submission for password reset
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setError(null); // Reset error state

        // Validate password and confirmation
        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true); // Set loading state

        try {
            // Verify the OTP to ensure the token is valid
            const { error: verifyError } = await supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: 'recovery',
                options: {
                    shouldCreateSession: false
                }
            });

            if (verifyError) throw verifyError; // Throw error if verification fails

            // Attempt to update the password
            const { error } = await supabase.auth.updateUser(
                { password: password },
                {
                    skipSessionRefresh: true // Force update even without an active session
                }
            );

            if (error) throw error; // Throw error if update fails

            // Notify user of successful password update
            toast.success('Password updated successfully!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: false
            });

            // Redirect to login after a delay
            setTimeout(() => {
                navigate('/login');
            }, 4000);
        } catch (error) {
            console.error('Error resetting password:', error); // Log error for debugging

            // Provide specific error messages based on error type
            if (error.message.includes('AuthSessionMissingError')) {
                setError('Session expired. Please request a new password reset link.');
            } else if (error.message.includes('Invalid token')) {
                setError('Invalid or expired reset link. Please request a new one.');
            } else {
                setError(error.message || 'Failed to reset password. Please try again.');
            }
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
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Reset Your Password</h2>
                    <p className="mt-2 text-sm sm:text-base text-gray-600">Enter your new password below</p>
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

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                New Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md
                                         text-sm sm:text-base
                                         shadow-sm focus:outline-none focus:ring-indigo-500
                                         focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md
                                         text-sm sm:text-base
                                         shadow-sm focus:outline-none focus:ring-indigo-500
                                         focus:border-indigo-500"
                                required
                            />
                        </div>

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
                                    Updating Password...
                                </>
                            ) : (
                                'Update Password'
                            )}
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    );
}
