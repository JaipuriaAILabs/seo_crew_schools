import { useState, useEffect } from 'react';
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => handleNavigation('/')}
                        className="flex items-center px-4 py-2 text-gray-600 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                    >
                        <span>← Go Back Home</span>
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900">
                        Generated Content
                    </h1>
                    <div className="w-[120px]"></div> {/* Spacer for centering */}
                </div>

                <p className="text-center mt-2 mb-8 text-lg text-gray-600">
                    Content for {location.state?.institution}
                </p>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 rounded-md">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div className="top-20 z-10 flex justify-center space-x-4 py-4 bg-gradient-to-br from-indigo-50/80 via-white/80 to-purple-50/80 backdrop-blur-sm rounded-lg shadow-md">
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
                    <div className="bg-white rounded-lg shadow-xl min-h-[600px]">
                        {activeTab === 'analysis' && analysisContent && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-6 prose max-w-none"
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {analysisContent}
                                </ReactMarkdown>
                                {downloadFiles.analysis && (
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => handleDownload(downloadFiles.analysis)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                        >
                                            Download Analysis Report
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'keywords' && Object.keys(keywords).length > 0 && (
                            <div className="p-6">
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
                                className="p-6 prose max-w-none"
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {adContent}
                                </ReactMarkdown>
                                {downloadFiles.ad && (
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => handleDownload(downloadFiles.ad)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                        >
                                            Download Ad Copies
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'outlines' && blogOutlines.length > 0 && (
                            <div className="p-6">
                                <div className="flex justify-center space-x-2 mb-6">
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
                                    className="prose max-w-none"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="text-2xl font-bold">
                                            Blog Outline {activeBlogTab + 1}
                                        </h2>
                                        <button
                                            onClick={() => handleGenerateBlog(blogOutlines[activeBlogTab])}
                                            className="px-4 py-2 text-sm font-medium text-white
                                                     bg-gradient-to-r from-green-600 to-green-500
                                                     rounded-md hover:from-green-700 hover:to-green-600
                                                     focus:outline-none focus:ring-2 focus:ring-offset-2
                                                     focus:ring-green-500 transition-all
                                                     shadow-md hover:shadow-lg
                                                     transform hover:-translate-y-0.5"
                                        >
                                            Generate Blog Post
                                        </button>
                                    </div>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {`# Blog Outline ${activeBlogTab + 1}\n\n${blogOutlines[activeBlogTab]}`}
                                    </ReactMarkdown>
                                </motion.div>
                                {downloadFiles.outlines && (
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => handleDownload(downloadFiles.outlines)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                        >
                                            Download All Blog Outlines
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
