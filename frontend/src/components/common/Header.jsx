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

    // Logout SVG Icon Component
    const LogoutIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5 mr-0 sm:mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
        </svg>
    );

    return (
        <motion.header
            className="bg-white shadow-lg backdrop-blur-sm bg-white/80 sticky top-0 z-50"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
        >
            <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex justify-between h-12 sm:h-14 lg:h-16 items-center">
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center">
                            <span className="text-sm sm:text-base lg:text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text line-clamp-1">
                                Jaipuria Schools
                            </span>
                        </Link>
                    </div>

                    <div className="hidden sm:ml-4 sm:flex sm:items-center sm:space-x-4 lg:space-x-8">
                        {user && (
                            <>
                                <span className="text-xs sm:text-sm lg:text-base text-gray-800">Welcome, {user.email}</span>
                                <button
                                    onClick={handleLogout}
                                    className="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 text-xs sm:text-sm lg:text-base font-medium text-white
                                             bg-gradient-to-r from-indigo-600 to-purple-600
                                             rounded-md hover:from-indigo-700 hover:to-purple-700
                                             focus:outline-none focus:ring-2 focus:ring-offset-2
                                             focus:ring-indigo-500 transition-all
                                             shadow-md hover:shadow-lg
                                             transform hover:-translate-y-0.5 flex items-center"
                                >
                                    <LogoutIcon />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button for logout */}
                    <div className="sm:hidden">
                        {user && (
                            <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-800 truncate max-w-[100px]">
                                    {user.email}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="p-1.5 text-xs font-medium text-white
                                             bg-gradient-to-r from-indigo-600 to-purple-600
                                             rounded-md hover:from-indigo-700 hover:to-purple-700
                                             flex items-center"
                                    aria-label="Logout"
                                >
                                    <LogoutIcon />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </motion.header>
    );
}
