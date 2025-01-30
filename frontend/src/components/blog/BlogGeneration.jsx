import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { generateBlog } from '../../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

    useEffect(() => {
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Generating blog post...</p>
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
                    <div className="text-red-600">
                        <h1 className="text-2xl font-bold mb-4">Error</h1>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Render the blog content and download button
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
                {docxFile && (
                    <div className="mb-6 flex justify-end">
                        <button
                            onClick={handleDownload}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md
                                     hover:bg-indigo-700 transition-colors duration-200"
                        >
                            Download Blog Post
                        </button>
                    </div>
                )}
                <div className="prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {blogContent}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
