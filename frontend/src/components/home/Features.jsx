import { motion } from 'framer-motion';
import { FaChartBar, FaAd, FaPenNib } from 'react-icons/fa';

// Array of feature objects containing title, description, and icon for each feature
const features = [
    {
        title: "Competitor Analysis",
        description: "Analyze top competitors' keywords and content strategies",
        icon: FaChartBar,
        iconColor: "text-blue-500",
        bgColor: "bg-blue-100"
    },
    {
        title: "Ad Copies",
        description: "Generate ad copies optimized for Google and Meta Ads",
        icon: FaAd,
        iconColor: "text-green-500",
        bgColor: "bg-green-100"
    },
    {
        title: "Blog Post",
        description: "Create high-quality blog posts with AI assistance",
        icon: FaPenNib,
        iconColor: "text-purple-500",
        bgColor: "bg-purple-100"
    }
];

/**
 * Features component displays key features of the application.
 * It maps over the features array and renders each feature in a styled card.
 */
export default function Features() {
    return (
        <section id="features" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 text-gray-800">
                    Key Features
                </h2>
                <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
                    {features.map((feature, index) => {
                        const IconComponent = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                                className="flex flex-col items-center p-6 sm:p-8 bg-white rounded-xl shadow-md hover:shadow-xl
                                         transition-all duration-300 text-center"
                            >
                                <div className={`mb-4 sm:mb-6 flex-shrink-0 w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center ${feature.bgColor} rounded-full shadow-md`}>
                                    <IconComponent
                                        className={`text-3xl sm:text-5xl ${feature.iconColor}`}
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-indigo-800">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-600">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    )
}
