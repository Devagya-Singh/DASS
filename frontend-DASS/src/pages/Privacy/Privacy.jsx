import React from 'react';

const Privacy = () => {
  return (
    <div style={{ padding: '120px 24px 40px', maxWidth: 900, margin: '0 auto' }}>
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <h3>1. Information We Collect</h3>
      <p>Account data (name, email), submission data, and usage data.</p>
      <h3>2. How We Use Information</h3>
      <p>To provide services, manage submissions, improve features, and ensure security.</p>
      <h3>3. Data Sharing</h3>
      <p>We do not sell your data. We share with service providers as needed.</p>
      <h3>4. Security</h3>
      <p>We use reasonable safeguards but cannot guarantee absolute security.</p>
      <h3>5. Your Rights</h3>
      <p>You may access, correct, or delete your data subject to applicable law.</p>
      <h3>6. Data Retention</h3>
      <p>We retain data as long as necessary for the purposes outlined above.</p>
      <h3>7. Contact</h3>
      <p>Contact: devagyarupsingh@gmail.com</p>
    </div>
  );
};

export default Privacy;


