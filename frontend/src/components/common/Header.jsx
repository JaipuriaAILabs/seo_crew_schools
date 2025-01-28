import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

/**
 * Header component displays the navigation bar with user authentication options.
 */
export default function Header() {
    const { user, signOut } = useAuth(); // Extract user and signOut function from Auth context
    const location = useLocation(); // Get the current location

    /**
     * Handles user logout by signing out and clearing user-specific data.
     */
    const handleLogout = async () => {
        try {
            await signOut(); // Attempt to sign out the user
            // Clear user-specific data from localStorage
            localStorage.removeItem('userId');
            localStorage.removeItem('blogOutline');
        } catch (error) {
            console.error('Error signing out:', error); // Log any errors encountered during sign out
        }
    };

    return (
        <motion.header
            className="bg-white shadow-lg backdrop-blur-sm bg-white/80 sticky top-0 z-50"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
        >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center">
                            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                                Jaipuria Schools
                            </span>
                        </Link>
                    </div>

                    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
                        {user && (
                            <>
                                <span className="text-gray-800">Welcome, {user.email}</span>
                                <button
                                    onClick={handleLogout}
                                    className="ml-4 px-4 py-2 text-sm font-medium text-white
                                             bg-gradient-to-r from-indigo-600 to-purple-600
                                             rounded-md hover:from-indigo-700 hover:to-purple-700
                                             focus:outline-none focus:ring-2 focus:ring-offset-2
                                             focus:ring-indigo-500 transition-all
                                             shadow-md hover:shadow-lg
                                             transform hover:-translate-y-0.5"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button for logout */}
                    <div className="sm:hidden">
                        {user && (
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-white
                                         bg-gradient-to-r from-indigo-600 to-purple-600
                                         rounded-md hover:from-indigo-700 hover:to-purple-700"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </nav>
        </motion.header>
    );
}
