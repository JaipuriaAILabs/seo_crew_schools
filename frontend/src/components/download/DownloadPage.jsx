import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import KeywordSelection from '../keywords/KeywordSelection';
import { getKeywords, saveKeywords, runSeo, cleanupUserData } from '../../services/api';

/**
 * DownloadPage component handles the display and download of generated content.
 */
export default function DownloadPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('analysis');
    const [activeBlogTab, setActiveBlogTab] = useState(0);
    const [analysisContent, setAnalysisContent] = useState('');
    const [adContent, setAdContent] = useState('');
    const [blogOutlines, setBlogOutlines] = useState([]);
    const [downloadFiles, setDownloadFiles] = useState({});
    const [keywords, setKeywords] = useState({});
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Progress bar refs and state
    const [progress, setProgress] = useState(0);
    const MIN_SIMULATION_TIME = 150000;
    const startTimeRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const processCompleteRef = useRef(false);
    const progressRef = useRef(null);

    /**
     * Manages progress animation during loading
     */
    useEffect(() => {
        if (isLoading) {
            startTimeRef.current = Date.now();
            processCompleteRef.current = false;

            progressIntervalRef.current = setInterval(() => {
                const elapsedTime = Date.now() - startTimeRef.current;

                setProgress((prevProgress) => {
                    // If process is complete, aim to reach 100%
                    if (processCompleteRef.current) {
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
    }, [isLoading]);

    // Add effect to scroll to progress bar when it becomes visible
    useEffect(() => {
        if (isLoading && progressRef.current) {
            progressRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [isLoading]);

    useEffect(() => {
        const state = location.state;

        // Redirect if institution or domain is not provided
        if (!state?.institution || !state?.domain) {
            navigate('/');
            return;
        }

        // Fetch keywords when analysis is complete
        const fetchKeywords = async () => {
            try {
                const result = await getKeywords();

                if (result.status === 'success') {
                    setKeywords(result.keywords);
                    setActiveTab('keywords'); // Switch to keywords tab
                } else {
                    console.error("Failed to fetch keywords:", result.message);
                    setError(result.message);
                }
            } catch (err) {
                console.error("Error fetching keywords:", err);
                setError(err.message);
            }
        };

        // Fetch keywords if analysis result exists
        if (state.analysisResult?.markdown?.analysis) {
            fetchKeywords();
            setAnalysisContent(state.analysisResult.markdown.analysis);
            setDownloadFiles(prev => ({
                ...prev,
                ...(state.analysisResult.docxFiles || {})
            }));
        }

        // Set SEO content if available
        if (state.seoResult?.markdown) {
            if (state.seoResult.markdown.ad) {
                setAdContent(state.seoResult.markdown.ad);
            }

            if (state.seoResult.markdown.outlines) {
                const outlines = state.seoResult.markdown.outlines
                    .split('# Blog Outline')
                    .filter(Boolean)
                    .map(outline => outline.trim());
                setBlogOutlines(outlines);
            }

            setDownloadFiles(prev => ({
                ...prev,
                ...(state.seoResult.docxFiles || {})
            }));
        }
    }, [location.state, navigate]);

    const handleKeywordSubmit = async (selected) => {
        setSelectedKeywords(selected);
        setIsLoading(true);
        setError(null);
        try {
            await saveKeywords(selected);
            const result = await runSeo({
                institution_name: location.state.institution,
                domain_url: location.state.domain
            });

            if (result.status === 'success') {
                // Mark process as complete
                processCompleteRef.current = true;

                // Ensure progress reaches 100%
                setProgress(100);

                if (result.markdown?.ad) {
                    setAdContent(result.markdown.ad);
                }
                if (result.markdown?.outlines) {
                    const outlines = result.markdown.outlines
                        .split('# Blog Outline')
                        .filter(Boolean)
                        .map(outline => outline.trim());
                    setBlogOutlines(outlines);
                }
                setDownloadFiles(prev => ({
                    ...prev,
                    ...(result.docxFiles || {})
                }));
                setActiveTab('ads');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = (filename) => {
        if (filename) {
            window.open(`${import.meta.env.VITE_API_URL}/download/${localStorage.getItem('userId')}/${filename}`, '_blank');
        }
    };

    const handleGenerateBlog = (outlineContent) => {
        if (!outlineContent) {
            console.error('No outline content provided');
            return;
        }

        const userId = localStorage.getItem('userId');
        const blogGenUrl = `/blog?outline=${encodeURIComponent(outlineContent)}&userId=${userId}`;

        // Store the outline in localStorage for access in the new tab
        localStorage.setItem('blogOutline', JSON.stringify({
            content: outlineContent,
            userId: userId
        }));

        // Open in new tab with proper parameters
        window.open(blogGenUrl, '_blank');
    };

    const handleNavigation = async (path) => {
        try {
            const userId = localStorage.getItem('userId');
            if (userId) {
                await cleanupUserData(userId);
                localStorage.removeItem('userId'); // Clear userId after cleanup
            }
            navigate(path);
        } catch (error) {
            console.error('Navigation cleanup error:', error);
            navigate(path); // Navigate anyway if cleanup fails
        }
    };

    const TabButton = ({ id, label, count, onClick, isActive }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 font-medium rounded-lg shadow-md ${isActive
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
        >
            {label}
            {count > 0 && (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${isActive ? 'bg-white text-indigo-600' : 'bg-indigo-100 text-indigo-600'
                    }`}>
                    {count}
                </span>
            )}
        </button>
    );

    const BlogTabButton = ({ index, isActive }) => (
        <button
            onClick={() => setActiveBlogTab(index)}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${isActive
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
        >
            Blog {index + 1}
        </button>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                    <button
                        onClick={() => handleNavigation('/')}
                        className="flex items-center px-4 py-2 text-gray-600 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors text-sm sm:text-base"
                    >
                        <span>← Go Back Home</span>
                    </button>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center">
                        Generated Content
                    </h1>
                    <div className="w-[120px] hidden sm:block"></div> {/* Spacer for centering */}
                </div>

                <p className="text-center mt-2 mb-6 sm:mb-8 text-base sm:text-lg text-gray-600">
                    Content for {location.state?.institution}
                </p>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 rounded-md">
                        <p className="text-sm sm:text-base text-red-700">{error}</p>
                    </div>
                )}

                <div className="top-20 z-10 flex justify-center space-x-2 sm:space-x-4 py-4 bg-gradient-to-br from-indigo-50/80 via-white/80 to-purple-50/80 backdrop-blur-sm rounded-lg shadow-md overflow-x-auto">
                    {analysisContent && (
                        <TabButton
                            id="analysis"
                            label="Analysis"
                            onClick={() => setActiveTab('analysis')}
                            isActive={activeTab === 'analysis'}
                        />
                    )}
                    {Object.keys(keywords).length > 0 && (
                        <TabButton
                            id="keywords"
                            label="Keywords"
                            count={Object.keys(keywords).length}
                            onClick={() => setActiveTab('keywords')}
                            isActive={activeTab === 'keywords'}
                        />
                    )}
                    {adContent && (
                        <TabButton
                            id="ads"
                            label="Ad Copies"
                            onClick={() => setActiveTab('ads')}
                            isActive={activeTab === 'ads'}
                        />
                    )}
                    {blogOutlines.length > 0 && (
                        <TabButton
                            id="outlines"
                            label="Blog Outlines"
                            count={blogOutlines.length}
                            onClick={() => setActiveTab('outlines')}
                            isActive={activeTab === 'outlines'}
                        />
                    )}
                </div>

                <div className="mt-4">
                    <div className="bg-white rounded-lg shadow-xl min-h-[600px] p-4 sm:p-6 lg:p-8">
                        {activeTab === 'analysis' && analysisContent && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="prose prose-sm sm:prose max-w-none"
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {analysisContent}
                                </ReactMarkdown>
                                {downloadFiles.analysis && (
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => handleDownload(downloadFiles.analysis)}
                                            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
                                        >
                                            Download Analysis Report
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'keywords' && Object.keys(keywords).length > 0 && (
                            <div>
                                <KeywordSelection
                                    keywords={keywords}
                                    onSubmit={handleKeywordSubmit}
                                    isLoading={isLoading}
                                    disabled={isLoading || adContent !== ''}
                                    selectedKeywords={selectedKeywords}
                                />
                            </div>
                        )}

                        {activeTab === 'ads' && adContent && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="prose prose-sm sm:prose max-w-none"
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {adContent}
                                </ReactMarkdown>
                                {downloadFiles.ad && (
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => handleDownload(downloadFiles.ad)}
                                            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
                                        >
                                            Download Ad Copies
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'outlines' && blogOutlines.length > 0 && (
                            <div>
                                <div className="sticky top-20 z-10 flex justify-center space-x-2 sm:space-x-4 mb-6 py-4 bg-white bg-opacity-10 overflow-x-auto">
                                    {blogOutlines.map((_, index) => (
                                        <BlogTabButton
                                            key={index}
                                            index={index}
                                            isActive={activeBlogTab === index}
                                        />
                                    ))}
                                </div>
                                <motion.div
                                    key={activeBlogTab}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="prose prose-sm sm:prose max-w-none pt-6"
                                >
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {`# Blog Outline ${blogOutlines[activeBlogTab]}`}
                                    </ReactMarkdown>
                                    <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-6">
                                        <button
                                            onClick={() => handleGenerateBlog(blogOutlines[activeBlogTab])}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base font-medium text-white
                                                     bg-gradient-to-r from-blue-600 to-blue-500
                                                     rounded-md hover:from-blue-700 hover:to-blue-600
                                                     focus:outline-none focus:ring-2 focus:ring-offset-2
                                                     focus:ring-blue-500 transition-all
                                                     shadow-md hover:shadow-lg
                                                     transform hover:-translate-y-0.5"
                                        >
                                            Generate Blog Post
                                            <span className="inline-flex items-center justify-center px-2 py-1
                                                         text-xs font-bold leading-none text-blue-100
                                                         bg-blue-700 bg-opacity-50 rounded-full">
                                                #{activeBlogTab + 1}
                                            </span>
                                        </button>
                                        {downloadFiles.outlines && (
                                            <button
                                                onClick={() => handleDownload(downloadFiles.outlines)}
                                                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md
                                                         hover:bg-green-700 transition-colors text-sm sm:text-base"
                                            >
                                                Download All Blog Outlines
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* Progress bar */}
                        {isLoading && (
                            <div ref={progressRef} className="mt-8 sm:mt-10">
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
