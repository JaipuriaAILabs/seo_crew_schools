import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * Hero component serves as the landing section of the application,
 * providing a brief introduction and a call-to-action button for users.
 */
export default function Hero() {
    const navigate = useNavigate();

    // Function to handle navigation to the form page
    const handleNavigate = () => {
        try {
            navigate('/form'); // Navigate to the form page
        } catch (error) {
            console.error('Navigation error:', error); // Log any navigation errors
        }
    };

    return (
        <div className="text-center py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }} // Initial animation state
                animate={{ opacity: 1, y: 0 }} // Final animation state
                transition={{ duration: 0.5 }} // Animation duration
            >
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    SEO Content Generation Tool
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    Generate SEO-optimized content for your Schools
                </p>
                <div className="space-x-4">
                    <motion.button
                        onClick={handleNavigate} // Use the handler for navigation
                        whileHover={{ scale: 1.05 }} // Scale effect on hover
                        whileTap={{ scale: 0.95 }} // Scale effect on tap
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg
                                hover:bg-indigo-700 transition-colors"
                    >
                        Generate Analysis & Outlines
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
