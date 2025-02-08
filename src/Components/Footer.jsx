import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-row items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-white">TestLine</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <p className="text-sm">&copy; {new Date().getFullYear()} TestLine. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link
                to="/privacy-policy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="hover:text-white transition-colors"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;