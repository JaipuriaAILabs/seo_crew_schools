import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify'; // Import toast for notifications

/**
 * VerifyOTP component allows users to verify their email using a one-time password (OTP).
 */
export default function VerifyOTP() {
    const [otp, setOtp] = useState(''); // State for OTP input
    const [loading, setLoading] = useState(false); // State to manage loading status
    const [error, setError] = useState(null); // State to manage error messages
    const [email, setEmail] = useState(''); // State to store the user's email
    const navigate = useNavigate(); // Hook to programmatically navigate

    // Effect to retrieve stored email from local storage
    useEffect(() => {
        const storedEmail = localStorage.getItem('verificationEmail');
        if (!storedEmail) {
            navigate('/signup'); // Redirect to signup if no email is found
            return;
        }
        setEmail(storedEmail); // Set the email state
    }, [navigate]);

    // Handle OTP verification
    const handleVerify = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setError(null); // Reset error state
        setLoading(true); // Set loading state

        try {
            // Verify the OTP with Supabase
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'signup'
            });

            if (error) throw error; // Throw error if verification fails

            // Clear stored email after successful verification
            localStorage.removeItem('verificationEmail');

            // Notify user of successful verification
            toast.success('Email verified successfully!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: false
            });

            // Redirect to login after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Verification error:', error); // Log error for debugging
            setError(error.message); // Set error message for user feedback
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
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Verify Your Email</h2>
                    <p className="mt-2 text-sm sm:text-base text-gray-600">Enter the verification code sent to your email</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100"
                >
                    <form onSubmit={handleVerify} className="space-y-4 sm:space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs sm:text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Verification Code
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 border-gray-200
                                         text-sm sm:text-base
                                         focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                         transition-colors"
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
                                    Verifying...
                                </>
                            ) : (
                                'Verify Email'
                            )}
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    );
}
