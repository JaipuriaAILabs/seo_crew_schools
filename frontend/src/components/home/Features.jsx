import { motion } from 'framer-motion';

// Array of feature objects containing title, description, and icon for each feature
const features = [
    {
        title: "Competitor Analysis",
        description: "Analyze top competitors' keywords and content strategies",
        icon: "📊"
    },
    {
        title: "SEO Optimization",
        description: "Generate content optimized for search engines",
        icon: "🎯"
    },
    {
        title: "Content Generation",
        description: "Create high-quality blog posts with AI assistance",
        icon: "✍️"
    }
];

/**
 * Features component displays key features of the application.
 * It maps over the features array and renders each feature in a styled card.
 */
export default function Features() {
    return (
        <section id="features" className="py-20">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold text-center mb-12">
                    Key Features
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl
                                     transition-shadow"
                        >
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-semibold mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
