import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * KeywordSelection component allows users to select target keywords for content generation.
 *
 * @param {Object} props - Component properties.
 * @param {Object} props.keywords - An object containing keywords categorized by domain.
 * @param {Function} props.onSubmit - Callback function to handle the submission of selected keywords.
 * @param {boolean} props.isLoading - Indicates if the component is in a loading state.
 * @param {boolean} props.disabled - Indicates if the component is disabled.
 * @param {Array} props.selectedKeywords - Initial selected keywords.
 */
export default function KeywordSelection({ keywords, onSubmit, isLoading, disabled, selectedKeywords = [] }) {
    const [localSelectedKeywords, setLocalSelectedKeywords] = useState(selectedKeywords);

    /**
     * Toggles the selection of a keyword.
     *
     * @param {string} keyword - The keyword to toggle.
     */
    const handleKeywordToggle = (keyword) => {
        if (disabled || isLoading) return; // Prevent toggling if disabled or loading

        setLocalSelectedKeywords(prev =>
            prev.includes(keyword)
                ? prev.filter(k => k !== keyword) // Remove keyword if already selected
                : [...prev, keyword] // Add keyword if not selected
        );
    };

    /**
     * Handles the form submission.
     *
     * @param {Event} e - The form submission event.
     */
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        if (!disabled && !isLoading) {
            try {
                onSubmit(localSelectedKeywords); // Call the onSubmit function with selected keywords
            } catch (error) {
                console.error('Error during submission:', error); // Log any errors during submission
            }
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-xl p-6"
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Select Target Keywords
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {Object.entries(keywords).map(([domain, domainKeywords]) => (
                        <div key={domain} className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                {domain}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {domainKeywords.map((keyword) => (
                                    <div
                                        key={keyword}
                                        className={`flex items-center space-x-2 ${(disabled || isLoading) ? 'opacity-50' : ''
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            id={keyword}
                                            checked={localSelectedKeywords.includes(keyword)}
                                            onChange={() => handleKeywordToggle(keyword)}
                                            disabled={disabled || isLoading}
                                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                        />
                                        <label
                                            htmlFor={keyword}
                                            className="text-sm text-gray-700"
                                        >
                                            {keyword}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={localSelectedKeywords.length === 0 || isLoading || disabled}
                            className={`
                                px-4 py-2 rounded-md text-white font-medium
                                ${(localSelectedKeywords.length === 0 || isLoading || disabled)
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'}
                                transition-colors duration-200
                            `}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                'Generate Content'
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
