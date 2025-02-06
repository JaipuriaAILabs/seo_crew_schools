import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { runAnalysis } from '../../services/api';

/**
 * InstituteForm component allows users to input their institution details
 * and initiate an analysis process.
 */
export default function InstituteForm() {
    const [institutionName, setInstitutionName] = useState(''); // State for institution name
    const [domainUrl, setDomainUrl] = useState(''); // State for domain URL
    const [loading, setLoading] = useState(false); // State to manage loading status
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null); // State to manage error messages
    const navigate = useNavigate(); // Hook for navigation

    const MIN_SIMULATION_TIME = 300000;
    const startTimeRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const analysisCompleteRef = useRef(false);

    /**
     * Manages progress animation during loading
     */
    useEffect(() => {
        if (loading) {
            startTimeRef.current = Date.now();
            analysisCompleteRef.current = false;

            progressIntervalRef.current = setInterval(() => {
                const elapsedTime = Date.now() - startTimeRef.current;

                setProgress((prevProgress) => {
                    // If analysis is complete, aim to reach 100%
                    if (analysisCompleteRef.current) {
                        if (prevProgress >= 100) {
                            clearInterval(progressIntervalRef.current);
                            return 100;
                        }
                        return prevProgress + Math.random() * 10;
                    }

                    if (elapsedTime < MIN_SIMULATION_TIME) {
                        // Slow, gradual progress
                        const timeProgress = (elapsedTime / MIN_SIMULATION_TIME) * 100;
                        return Math.min(timeProgress, 95);
                    }

                    return 100;
                });

                // Auto-complete after full progress or time
                if (progress >= 100) {
                    clearInterval(progressIntervalRef.current);
                }
            }, 500);
        }

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, [loading]);

    /**
     * Handles form submission to initiate analysis.
     * @param {Event} e - The event object from the form submission.
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setError(null); // Reset error state
        setLoading(true); // Set loading state to true
        setProgress(0);

        try {
            const result = await runAnalysis({
                institution_name: institutionName,
                domain_url: domainUrl.replace(/^https?:\/\//, '') // Remove protocol from URL
            });

            if (result.status === 'success') {
                // Mark analysis as complete
                analysisCompleteRef.current = true;

                // Ensure progress reaches 100%
                setProgress(100);

                setTimeout(() => {
                    // Navigate to the download page with analysis results
                    navigate('/download', {
                        state: {
                            institution: institutionName,
                            domain: domainUrl,
                            analysisResult: result
                        }
                    });
                }, 500);
            } else {
                // Throw an error if the analysis failed
                throw new Error(result.message || 'Analysis failed');
            }
        } catch (err) {
            // Log the error and set the error state for user feedback
            console.error('Form submission error:', err);
            setError(err.message || 'Failed to start analysis');
            setLoading(false);
            setProgress(0);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="p-6 sm:p-8 lg:p-12">
                        <div className="text-center mb-8">
                            <motion.h2
                                className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                Start Your Analysis
                            </motion.h2>
                            <motion.p
                                className="text-base sm:text-lg text-gray-600"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Enter the School details to begin
                            </motion.p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm sm:text-base"
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="relative"
                            >
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    School Name
                                </label>
                                <div className="flex items-center">
                                    <span className="absolute left-3 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5a12.083 12.083 0 01-6.16-10.922L12 14z" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        value={institutionName}
                                        onChange={(e) => setInstitutionName(e.target.value)}
                                        disabled={loading}
                                        className={`w-full pl-10 px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-gray-200
                                                 focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                                 transition-colors bg-gray-50 hover:bg-white
                                                 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        placeholder="Jaipuria Schools"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="relative"
                            >
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Domain URL
                                </label>
                                <div className="flex items-center">
                                    <span className="absolute left-3 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11h8m-4-4v8" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        value={domainUrl}
                                        onChange={(e) => setDomainUrl(e.target.value)}
                                        disabled={loading}
                                        className={`w-full pl-10 px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-gray-200
                                                 focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                                 transition-colors bg-gray-50 hover:bg-white
                                                 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        placeholder="jaipuriaschools.ac.in"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="pt-4"
                            >
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600
                                             hover:from-indigo-700 hover:to-purple-700
                                             text-white py-2 sm:py-3 px-4 rounded-lg text-sm sm:text-base
                                             focus:outline-none focus:ring-2 focus:ring-offset-2
                                             focus:ring-indigo-500 transition-all
                                             disabled:opacity-50 disabled:cursor-not-allowed
                                             shadow-lg hover:shadow-xl
                                             transform hover:-translate-y-0.5
                                             ${loading ? 'cursor-not-allowed' : ''}`}
                                >
                                    Start Analysis
                                </button>

                                {/* Animated Progress Bar */}
                                <AnimatePresence>
                                    {loading && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 w-full bg-transparent border-2 border-indigo-200 rounded-full p-1"
                                        >
                                            <div className="w-full bg-gray-200 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{
                                                        duration: 0.5,
                                                        ease: "easeInOut"
                                                    }}
                                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 sm:h-3 rounded-full"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {loading && (
                                    <div className="mt-2 text-center">
                                        <span className="text-xs sm:text-sm font-semibold text-gray-700">
                                            {Math.round(progress)}%
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
