import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Create an AuthContext to provide authentication state throughout the app
const AuthContext = createContext({});

// AuthProvider component to manage authentication state and provide context
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // State to hold the authenticated user
    const [loading, setLoading] = useState(true); // State to indicate loading status
    const [error, setError] = useState(null); // State to hold any error messages

    useEffect(() => {
        // Fetch the current session and set the user state
        const fetchSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null); // Set user if session exists
            } catch (err) {
                console.error('Error fetching session:', err); // Log any errors
                setError(err.message); // Set error message if fetching session fails
            } finally {
                setLoading(false); // Set loading to false after fetching session
            }
        };

        fetchSession(); // Call the function to fetch session

        // Setup listener for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null); // Update user state on auth state change
            setLoading(false); // Set loading to false when auth state changes
        });

        return () => {
            subscription.unsubscribe(); // Cleanup subscription on component unmount
        };
    }, []);

    // Function to sign out the user
    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut(); // Attempt to sign out
            if (error) throw error; // Throw error if sign out fails
            setUser(null); // Clear user state on successful sign out
        } catch (err) {
            setError(err.message); // Set error message if sign out fails
            console.error('Error during sign out:', err); // Log the error
        }
    };

    // Context value to be provided to consuming components
    const value = {
        user,
        loading,
        error,
        signOut,
        isAuthenticated: !!user // Boolean indicating if user is authenticated
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} {/* Render children only when not loading */}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider'); // Error if used outside of provider
    }
    return context; // Return the context value
};
