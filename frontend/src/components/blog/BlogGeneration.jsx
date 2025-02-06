import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { generateBlog } from '../../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

/**
 * BlogGeneration component fetches and displays a generated blog post
 * based on the provided outline and user ID from the URL search parameters.
 */
export default function BlogGeneration() {
    const [searchParams] = useSearchParams();
    const [blogContent, setBlogContent] = useState(''); // State to hold the blog content
    const [docxFile, setDocxFile] = useState(null); // State to hold the generated DOCX file name
    const [loading, setLoading] = useState(true); // State to manage loading status
    const [error, setError] = useState(null); // State to manage error messages
    const mountedRef = useRef(false);

    // Progress bar state and refs
    const [progress, setProgress] = useState(0);
    const MIN_SIMULATION_TIME = 60000; // 1 minute
    const startTimeRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const blogGenerationCompleteRef = useRef(false);


    /**
     * Manages progress animation during loading
     */
    useEffect(() => {
        if (loading) {
            startTimeRef.current = Date.now();
            blogGenerationCompleteRef.current = false;

            progressIntervalRef.current = setInterval(() => {
                const elapsedTime = Date.now() - startTimeRef.current;

                setProgress((prevProgress) => {
                    // If blog generation is complete, aim to reach 100%
                    if (blogGenerationCompleteRef.current) {
                        if (prevProgress >= 100) {
                            clearInterval(progressIntervalRef.current);
                            return 100;
                        }
                        return prevProgress + Math.random() * 10;
                    }

                    // Ensure at least 1 minute of progress
                    if (elapsedTime < MIN_SIMULATION_TIME) {
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

    useEffect(() => {
        // Prevent duplicate calls in development
        if (mountedRef.current) return;
        mountedRef.current = true;

        // Function to generate blog content
        const generateBlogContent = async () => {
            try {
                const outline = searchParams.get('outline'); // Get outline from search params
                const userId = searchParams.get('userId'); // Get user ID from search params

                // Validate required parameters
                if (!outline || !userId) {
                    throw new Error('Missing required parameters');
                }

                // Encode the outline properly
                const encodedOutline = encodeURIComponent(outline);

                // Call the API to generate the blog
                const result = await generateBlog({
                    outline: encodedOutline,
                    userId: userId // Use the userId from searchParams instead of localStorage
                });

                // Update state with the blog content and DOCX file name
                if (result.status === 'success') {
                    // Mark blog generation as complete
                    blogGenerationCompleteRef.current = true;

                    // Ensure progress reaches 100%
                    setProgress(100);

                    setBlogContent(result.markdown); // Update to use the correct property for blog content
                    setDocxFile(result.docxFile);
                } else {
                    throw new Error(result.message || 'Failed to generate blog');
                }
            } catch (err) {
                // Set error message if an error occurs
                setError(err.message);
            } finally {
                // Set loading to false regardless of success or failure
                setLoading(false);
            }
        };

        generateBlogContent(); // Invoke the function to generate blog content

        // Cleanup function
        return () => {
            mountedRef.current = false;
        };
    }, [searchParams]);

    // Function to handle downloading the generated DOCX file
    const handleDownload = () => {
        if (docxFile) {
            const userId = searchParams.get('userId');
            window.open(`${import.meta.env.VITE_API_URL}/download/${userId}/${docxFile}`, '_blank');
        }
    };

    // Render loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col px-4 sm:px-6 lg:px-8">
                <div className="text-center w-full max-w-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Generating blog post...</p>
                </div>
                <div className="w-full max-w-2xl mt-8 px-4">
                    <div className="w-full bg-transparent border-2 border-indigo-200 rounded-full p-1">
                        <div className="w-full bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{
                                    duration: 0.5,
                                    ease: "easeInOut"
                                }}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full"
                            />
                        </div>
                    </div>
                    <div className="text-center mt-2">
                        <span className="text-xs font-semibold text-gray-700">
                            {Math.round(progress)}%
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
                    <div className="text-red-600">
                        <h1 className="text-xl sm:text-2xl font-bold mb-4">Error</h1>
                        <p className="text-sm sm:text-base">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Render the blog content and download button
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-xl p-4 sm:p-6 lg:p-8">
                <div className="prose prose-sm sm:prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {blogContent}
                    </ReactMarkdown>
                </div>
                {docxFile && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleDownload}
                            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md
                                     hover:bg-green-700 transition-colors text-sm sm:text-base"
                        >
                            Download Blog Post
                        </button>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            {loading && (
                <div className="fixed bottom-0 left-0 w-full p-4 bg-white shadow-lg z-50">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="w-full bg-transparent border-2 border-indigo-200 rounded-full p-1">
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
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-xs sm:text-sm font-semibold text-gray-700">
                                {Math.round(progress)}%
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
