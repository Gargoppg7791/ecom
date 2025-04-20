import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>Name and contact information</li>
            <li>Account credentials</li>
            <li>Payment information</li>
            <li>Shipping address</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>Process your orders</li>
            <li>Send you order updates</li>
            <li>Provide customer support</li>
            <li>Improve our services</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;