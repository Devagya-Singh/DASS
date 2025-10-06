import React from 'react';

const Terms = () => {
  return (
    <div style={{ padding: '120px 24px 40px', maxWidth: 900, margin: '0 auto' }}>
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing or using DASS, you agree to be bound by these Terms.</p>
      <h3>2. User Accounts</h3>
      <p>You must provide accurate information. You are responsible for safeguarding credentials.</p>
      <h3>3. Submissions and Content</h3>
      <p>You retain rights to your submissions. You grant us a license to host and display them.</p>
      <h3>4. Prohibited Activities</h3>
      <p>No misuse, infringement, malware, or unauthorized access.</p>
      <h3>5. Privacy</h3>
      <p>See our Privacy Policy for details on data handling.</p>
      <h3>6. Disclaimer</h3>
      <p>Service provided "as is" without warranties. Availability is not guaranteed.</p>
      <h3>7. Limitation of Liability</h3>
      <p>We are not liable for indirect or consequential damages to the extent permitted by law.</p>
      <h3>8. Changes</h3>
      <p>We may update these Terms. Continued use means acceptance.</p>
      <h3>9. Contact</h3>
      <p>Contact: devagyarupsingh@gmail.com</p>
    </div>
  );
};

export default Terms;


