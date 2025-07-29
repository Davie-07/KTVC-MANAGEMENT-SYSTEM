import React from 'react';
import { Link } from 'react-router-dom';
import './TermsAndConditionsPage.css';

const TermsAndConditionsPage: React.FC = () => {
  return (
    <div className="terms-page-bg">
      <div className="terms-container">
        <div className="terms-header">
          <h1>Terms and Conditions</h1>
          <p>Kandara Technical and Vocational Training College</p>
        </div>
        
        <div className="terms-content">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using the Kandara Technical and Vocational Training College platform, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>

          <section>
            <h2>2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on Kandara College's website for personal, non-commercial transitory viewing only.</p>
          </section>

          <section>
            <h2>3. Disclaimer</h2>
            <p>The materials on Kandara College's website are provided on an 'as is' basis. Kandara College makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </section>

          <section>
            <h2>4. Limitations</h2>
            <p>In no event shall Kandara College or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Kandara College's website.</p>
          </section>

          <section>
            <h2>5. Accuracy of Materials</h2>
            <p>The materials appearing on Kandara College's website could include technical, typographical, or photographic errors. Kandara College does not warrant that any of the materials on its website are accurate, complete or current.</p>
          </section>

          <section>
            <h2>6. Links</h2>
            <p>Kandara College has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Kandara College of the site.</p>
          </section>

          <section>
            <h2>7. Modifications</h2>
            <p>Kandara College may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these Terms and Conditions of Use.</p>
          </section>

          <section>
            <h2>8. Governing Law</h2>
            <p>These terms and conditions are governed by and construed in accordance with the laws of Kenya and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
          </section>

          <section>
            <h2>9. Privacy Policy</h2>
            <p>Your privacy is important to us. It is Kandara College's policy to respect your privacy regarding any information we may collect while operating our website.</p>
          </section>

          <section>
            <h2>10. Contact Information</h2>
            <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
            <ul>
              <li>Phone: +254 716 819 330</li>
              <li>Email: info@kandara-college.ac.ke</li>
              <li>Address: Near Kiranga market, Kandara, Kenya</li>
            </ul>
          </section>
        </div>

        <div className="terms-footer">
          <p><strong>Last updated:</strong> January 2025</p>
          <Link to="/register" className="back-link">← Back to Registration</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage; 