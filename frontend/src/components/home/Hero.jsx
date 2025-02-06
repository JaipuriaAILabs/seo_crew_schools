import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaRocket } from 'react-icons/fa';

/**
 * Hero component serves as the landing section of the application,
 * providing a full-viewport introduction and a call-to-action button for users.
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
        <div className="relative min-h-[calc(100vh-3rem)] sm:min-h-[calc(100vh-3.5rem)] lg:min-h-[calc(100vh-4rem)]
                        flex items-center justify-center
                        bg-gradient-to-br from-indigo-50 to-purple-50
                        overflow-hidden px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            {/* Decorative background shapes */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-48 sm:w-64 lg:w-96 h-48 sm:h-64 lg:h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-1/2 right-1/4 w-32 sm:w-48 lg:w-72 h-32 sm:h-48 lg:h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            </div>

            <motion.div
                className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, type: "spring", stiffness: 50 }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-4 sm:space-y-6 lg:space-y-8"
                >
                    <h1 className="text-2xl sm:text-4xl lg:text-6xl font-extrabold
                                 bg-gradient-to-r from-indigo-600 to-purple-600
                                 text-transparent bg-clip-text
                                 leading-tight sm:leading-tight lg:leading-tight
                                 px-2 sm:px-4">
                        AI-Powered Content Generation
                    </h1>
                    <p className="text-base sm:text-lg lg:text-2xl text-gray-700
                                max-w-3xl mx-auto leading-relaxed
                                px-2 sm:px-4">
                        Revolutionize your content strategy with AI-driven SEO optimization
                        for educational institutes
                    </p>
                </motion.div>

                <motion.div
                    className="flex justify-center items-center mt-6 sm:mt-8 lg:mt-10"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <motion.button
                        onClick={handleNavigate}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 sm:gap-3
                                 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4
                                 bg-gradient-to-r from-indigo-600 to-purple-600
                                 text-white rounded-xl
                                 shadow-lg hover:shadow-xl
                                 transition-all duration-300
                                 text-sm sm:text-base lg:text-lg font-semibold"
                    >
                        <FaRocket className="text-base sm:text-lg lg:text-xl" />
                        Generate Analysis & Outlines
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    );
}
