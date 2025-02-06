import { motion } from 'framer-motion';
import { FaSearch, FaKey, FaFileAlt, FaMagic } from 'react-icons/fa';

// Array of steps outlining the process flow with titles, descriptions, and icons
const steps = [
    {
        title: "1. Competitor Analysis",
        description: "Our AI analyzes top competitors' content and keywords using SpyFu data",
        icon: FaSearch,
        iconColor: "text-blue-500",
        bgColor: "bg-blue-100"
    },
    {
        title: "2. Select Keywords",
        description: "Selects high-performing keywords from the analysis",
        icon: FaKey,
        iconColor: "text-purple-500",
        bgColor: "bg-purple-100"
    },
    {
        title: "3. Generate Ad Copies",
        description: "Generates ad copies optimized for Google and Meta Ads",
        icon: FaFileAlt,
        iconColor: "text-green-500",
        bgColor: "bg-green-100"
    },
    {
        title: "4. Content Creation",
        description: "Creates SEO-optimized blog posts using AI",
        icon: FaMagic,
        iconColor: "text-pink-500",
        bgColor: "bg-pink-100"
    }
];

/**
 * ProcessFlow component displays the steps involved in the analysis process.
 * It maps over the steps array and renders each step in a styled grid format.
 */
export default function ProcessFlow() {
    return (
        <section id="process" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 text-gray-800">
                    How It Works
                </h2>
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                    {steps.map((step, index) => {
                        const IconComponent = step.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.2 }}
                                className="flex flex-col sm:flex-row items-center sm:items-start p-4 sm:p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                            >
                                <div className={`mb-4 sm:mb-0 flex-shrink-0 w-14 sm:w-16 h-14 sm:h-16 flex items-center justify-center ${step.bgColor} rounded-full mr-0 sm:mr-6 shadow-md`}>
                                    <IconComponent
                                        className={`text-2xl sm:text-3xl ${step.iconColor}`}
                                    />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-indigo-800">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-600">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
