import React from 'react';
import { Link } from 'react-router-dom';

export const PublicFooter = (): JSX.Element => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-gray-700">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              About SSGI
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/about" className="hover:text-blue-700">Institute Overview</Link>
              </li>
              <li>
                <Link to="/mission" className="hover:text-blue-700">Mission & Vision</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-700">Contact Us</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/services" className="hover:text-blue-700">Our Services</Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-blue-700">Documentation</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-blue-700">FAQs</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/privacy" className="hover:text-blue-700">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-blue-700">Terms of Use</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Location
            </h3>
            <p className="mt-4 text-sm text-gray-500">
              Space Science and Geospatial Institute (SSGI)<br />
              Addis Ababa, Ethiopia<br />
              <a href="https://ssgi.gov.et" className="text-blue-600 hover:text-blue-800">
                www.ssgi.gov.et
              </a>
            </p>
          </div>
        </div>
        <div className="mt-12 border-t pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Space Science and Geospatial Institute. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
