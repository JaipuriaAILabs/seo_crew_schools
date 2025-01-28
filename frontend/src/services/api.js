// Define the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;
import { supabase } from '../lib/supabase';

// Default headers for API requests
const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

/**
 * Runs an analysis with the provided data.
 * @param {Object} data - The data to analyze.
 * @returns {Promise<Object>} - The result of the analysis.
 * @throws Will throw an error if the analysis fails.
 */
export const runAnalysis = async (data) => {
    try {
        const response = await fetch(`${API_URL}/run/analysis`, {
            method: 'POST',
            headers: defaultHeaders,
            credentials: 'include',
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.status === 'success') {
            localStorage.setItem('userId', result.userId); // Store user ID for subsequent requests
            return result;
        } else {
            throw new Error(result.message || 'Analysis failed');
        }
    } catch (error) {
        console.error('API Error in runAnalysis:', error);
        throw error; // Re-throw the error for further handling
    }
};

/**
 * Fetches keywords associated with the current user.
 * @returns {Promise<Object>} - The keywords data.
 * @throws Will throw an error if fetching keywords fails.
 */
export const getKeywords = async () => {
    try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`${API_URL}/keywords?userId=${userId}`, {
            method: 'GET',
            headers: defaultHeaders,
        });

        const data = await response.json();

        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to fetch keywords');
        }

        console.log("API Keywords:", data.keywords);
        return data;
    } catch (error) {
        console.error('Error fetching keywords:', error);
        throw error; // Re-throw the error for further handling
    }
};

/**
 * Saves the provided keywords for the current user.
 * @param {Array} keywords - The keywords to save.
 * @returns {Promise<Object>} - The response data.
 * @throws Will throw an error if saving keywords fails.
 */
export const saveKeywords = async (keywords) => {
    try {
        const response = await fetch(`${API_URL}/keywords/save/${localStorage.getItem('userId')}`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify({ keywords }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to save keywords');
        }

        return data;
    } catch (error) {
        console.error('Error saving keywords:', error);
        throw error; // Re-throw the error for further handling
    }
};

/**
 * Runs SEO analysis with the provided data.
 * @param {Object} data - The data for SEO analysis.
 * @returns {Promise<Object>} - The result of the SEO analysis.
 * @throws Will throw an error if the SEO analysis fails.
 */
export const runSeo = async (data) => {
    try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`${API_URL}/run/seo/${userId}`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify({ ...data, userId })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'error') {
            throw new Error(result.message);
        }

        return result;
    } catch (error) {
        console.error('API Error in runSeo:', error);
        throw error; // Re-throw the error for further handling
    }
};

/**
 * Generates a blog based on the provided outline.
 * @param {Object} blogOutline - The outline for the blog.
 * @returns {Promise<Object>} - The generated blog content and file.
 * @throws Will throw an error if blog generation fails.
 */
export const generateBlog = async (blogOutline) => {
    try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`${API_URL}/generate-blog/${userId}`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify({ outline: blogOutline.outline })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            const markdownResponse = await fetch(`${API_URL}/markdown/blog_post.md/${userId}`, {
                method: 'GET',
                headers: { 'Accept': 'text/markdown' }
            });

            if (!markdownResponse.ok) {
                throw new Error('Failed to fetch blog content');
            }

            const blogContent = await markdownResponse.text();

            return {
                status: 'success',
                blogContent,
                docxFile: result.docxFile
            };
        } else {
            throw new Error(result.message || 'Failed to generate blog post');
        }
    } catch (error) {
        console.error('API Error in generateBlog:', error);
        throw error; // Re-throw the error for further handling
    }
};

/**
 * Cleans up user data for the specified user ID.
 * @param {string} userId - The ID of the user whose data is to be cleaned up.
 * @returns {Promise<Object>} - The response from the cleanup operation.
 * @throws Will throw an error if cleanup fails.
 */
export const cleanupUserData = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/cleanup/${userId}`, {
            method: 'DELETE',
            headers: defaultHeaders,
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to cleanup user data');
        }

        return await response.json();
    } catch (error) {
        console.error('Cleanup error:', error);
        throw error; // Re-throw the error for further handling
    }
};
