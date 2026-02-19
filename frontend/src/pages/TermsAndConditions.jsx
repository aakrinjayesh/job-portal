import React from "react";
import { Typography } from "antd";

const { Title, Paragraph } = Typography;

const TermsAndConditions = () => {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <Title>Terms and Conditions</Title>

      <Paragraph>
        <strong>Effective Date:</strong> [Insert Date]
      </Paragraph>

      <Paragraph>
        <strong>Platform:</strong> FORCEHEAD
      </Paragraph>

      <Title level={4}>1. Acceptance of Terms</Title>
      <Paragraph>
        By accessing or using FORCEHEAD, you agree to be legally bound by these Terms and Conditions.
      </Paragraph>

      <Title level={4}>2. About FORCEHEAD</Title>
      <Paragraph>
        FORCEHEAD is a Salesforce-focused B2B recruitment and vendor portal that enables AI-powered job description generation, job posting, candidate sourcing, bench resource management, vendor collaboration, and AI-based candidate-job fit analysis.
      </Paragraph>

      <Title level={4}>3. User Accounts</Title>
      <Paragraph>
        Users must provide accurate information and maintain confidentiality of login credentials.
      </Paragraph>

      <Title level={4}>4. AI Services Disclaimer</Title>
      <Paragraph>
        AI-generated job descriptions and insights are for assistance only. We do not guarantee hiring outcomes.
      </Paragraph>

      <Title level={4}>5. Bench & Candidate Data</Title>
      <Paragraph>
        Vendors confirm they have authorization and consent before uploading candidate data.
      </Paragraph>

      <Title level={4}>6. Communications & Vendor Connections</Title>
      <Paragraph>
        FORCEHEAD is not an employment agency and is not responsible for disputes between users.
      </Paragraph>

      <Title level={4}>7. Data Security</Title>
      <Paragraph>
        We implement SSL/TLS encryption and controlled access. We do not sell personal data.
      </Paragraph>

      <Title level={4}>8. Prohibited Conduct</Title>
      <Paragraph>
        Users shall not post false information, discriminatory content, or misuse platform data.
      </Paragraph>

      <Title level={4}>9. Intellectual Property</Title>
      <Paragraph>
        All AI systems, software, and branding are protected by law.
      </Paragraph>

      <Title level={4}>10. Limitation of Liability</Title>
      <Paragraph>
        FORCEHEAD shall not be liable for hiring decisions or business losses.
      </Paragraph>

      <Title level={4}>11. Suspension & Termination</Title>
      <Paragraph>
        We reserve the right to suspend accounts violating these terms.
      </Paragraph>

      <Title level={4}>12. Modifications</Title>
      <Paragraph>
        Terms may be updated at any time.
      </Paragraph>

      <Title level={4}>13. Governing Law</Title>
      <Paragraph>
        Governed by the laws of India.
      </Paragraph>

      <Title level={4}>14. Contact</Title>
      <Paragraph>
        Email: support@forcehead.com
      </Paragraph>

      <Title level={4}>15. Pricing & Limit Access Policy</Title>
      
      <ul><li>Subscription & Access Model
Our platform operates on a paid pricing model that provides users with limited access to specific features, services, or usage quotas based on the selected subscription plan. Access to premium features is granted only upon successful payment.</li>

<li>Usage Limits
Each subscription plan includes defined limits (such as number of job posts, candidate views, downloads, AI usage, or vendor connections). Exceeding these limits may require upgrading to a higher plan.</li>

<li>Prohibited Actions
Users are strictly prohibited from:

Attempting to bypass, manipulate, or hack subscription limits

Using unauthorized methods to gain premium access without payment

Sharing login credentials to avoid purchasing additional licenses

Exploiting system vulnerabilities or loopholes</li>

<li> Monitoring & Enforcement
We reserve the right to monitor account activity to ensure compliance with our pricing model and usage policies.</li>

<li>5. Suspension & Legal Action
If any user is found attempting to manipulate, misuse, or fraudulently access paid features:

The account may be immediately suspended or permanently terminated without refund

Access to services may be revoked

We reserve the right to initiate legal action under applicable laws for financial loss, fraud, or unauthorized access</li>

<li>6. Changes to Pricing
We reserve the right to modify pricing plans, access limits, or features at any time with prior notice.</li></ul>
     

      <Title level={4}>16.  Intellectual Property Rights
 </Title>
      
<ul><li>Ownership of Platform Content
All content, features, functionality, software, source code, design, layout, user interface, databases, text, graphics, logos, trademarks, AI-generated systems, and other materials available on the platform are the exclusive property of the Company and are protected under applicable intellectual property laws.</li>

<li>Trademark & Brand Protection
The Company name, logo, brand identity, and related materials may not be copied, reproduced, distributed, modified, or used without prior written permission.</li>

<li>Restrictions on Use
Users shall not:

Copy, reproduce, republish, upload, post, transmit, or distribute any platform content

Reverse engineer, decompile, or attempt to extract source code

Create derivative works based on platform features

Scrape, extract, or misuse platform data or candidate/vendor information

Use the platform content for commercial purposes without authorization</li>

<li>Data & AI Protection
Any AI tools, job description generators, candidate analysis systems, and proprietary algorithms provided within the platform are confidential and protected intellectual property of the Company.</li>

<li> Legal Action for Violation
Any unauthorized use, reproduction, modification, distribution, or violation of the Company’s intellectual property rights will result in:

Immediate suspension or termination of access

Claims for damages and financial losses

Strict legal action under applicable Intellectual Property laws and Information Technology laws

The Company reserves the right to initiate civil and/or criminal proceedings against any individual or entity found violating these rights.
      </li></ul>
    </div>
  );
};

export default TermsAndConditions;
