import React, {useState, useEffect} from 'react';
// Assuming you use a library like react-router-dom for navigation
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

// This hook/function should be replaced with your actual authentication context/hook
// For this example, we'll simulate the user state
const useAuth = () => {
    // Replace with your global state/context check for a logged-in user
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Simulation: check local storage or a token
    useEffect(() => {
        const userToken = localStorage.getItem('userToken');
        if (userToken) {
            setIsAuthenticated(true);
        }
    }, []);

    // Placeholder logout function
    const logout = () => {
        localStorage.removeItem('userToken');
        setIsAuthenticated(false);
        // Add logic to redirect to login/home page after logout
    };

    return { isAuthenticated, logout };
};


const Navbar = () => {
    // Get authentication status and logout function
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        alert('You have been logged out.'); // Simple feedback
        navigate('/login'); // Redirect to login page after logout
    };

    // --- Define Navigation Links ---

    // Links for users who are NOT logged in
    const loggedOutLinks = [
        { path: '/login', label: 'Login' },
        { path: '/signup', label: 'Signup' },
        { path: '/about', label: 'About' }
    ];

    // Links for users who ARE logged in
    const loggedInLinks = [
        { path: '/', label: 'Home (Upload OPM)' }, // Matches your requirement for the homePage
        { path: '/saved', label: 'Saved Images and Codes' },
        { path: '/about', label: 'About' }
    ];

    // Select the appropriate set of links
    const navLinks = isAuthenticated ? loggedInLinks : loggedOutLinks;

    return (
        <nav className="navbar-container">
            <div className="navbar-logo">
                <Link to="/">OPMCodeGenerator</Link>
            </div>

            <ul className="navbar-links">
                {/* Render the appropriate links based on authentication state */}
                {navLinks.map((link) => (
                    <li key={link.path}>
                        <Link to={link.path}>{link.label}</Link>
                    </li>
                ))}

                {/* Always show the Logout button only if authenticated */}
                {isAuthenticated && (
                    <li>
                        <button onClick={handleLogout} className="logout-button">
                            Logout
                        </button>
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;