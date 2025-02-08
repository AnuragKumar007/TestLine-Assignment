import React from 'react';
import { motion } from 'framer-motion';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 max-w-3xl"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
        
        <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing and using TestLine, you accept and agree to be bound by the terms and
              provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. User Conduct</h2>
            <p className="text-gray-600">
              You agree to use TestLine for lawful purposes only and in a way that does not infringe
              upon the rights of others. During tests:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-2">
              <li>Do not attempt to cheat or manipulate results</li>
              <li>Do not share test content with others</li>
              <li>Do not use unauthorized aids during tests</li>
              <li>Maintain academic integrity at all times</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Account Security</h2>
            <p className="text-gray-600">
              You are responsible for maintaining the confidentiality of your account and password.
              You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Intellectual Property</h2>
            <p className="text-gray-600">
              All content on TestLine, including but not limited to text, graphics, logos, and test
              content, is the property of TestLine and is protected by copyright laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Termination</h2>
            <p className="text-gray-600">
              We reserve the right to terminate or suspend your account at any time without notice if
              you violate these terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Changes to Terms</h2>
            <p className="text-gray-600">
              We reserve the right to modify these terms at any time. Continued use of TestLine after
              any modifications indicates your acceptance of the updated terms.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default Terms;
