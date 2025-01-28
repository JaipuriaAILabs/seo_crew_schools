import { motion } from 'framer-motion';

// Array of steps outlining the process flow with titles, descriptions, and icons
const steps = [
    {
        title: "Competitor Analysis",
        description: "Our AI analyzes top competitors' content and keywords using SpyFu data",
        icon: "🔍"
    },
    {
        title: "Content Strategy",
        description: "Generates strategic blog outlines based on high-performing keywords",
        icon: "📝"
    },
    {
        title: "Content Creation",
        description: "Creates SEO-optimized blog posts using Claude AI",
        icon: "✨"
    }
];

/**
 * ProcessFlow component displays the steps involved in the analysis process.
 * It maps over the steps array and renders each step in a styled format.
 */
export default function ProcessFlow() {
    return (
        <section id="process" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold text-center mb-16">
                    How It Works
                </h2>
                <div className="max-w-4xl mx-auto">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }} // Initial animation state
                            whileInView={{ opacity: 1, x: 0 }} // Final animation state
                            transition={{ delay: index * 0.2 }} // Animation delay based on index
                            className="flex items-start mb-12 last:mb-0"
                        >
                            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-indigo-100 rounded-full mr-6">
                                <span className="text-2xl">{step.icon}</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
