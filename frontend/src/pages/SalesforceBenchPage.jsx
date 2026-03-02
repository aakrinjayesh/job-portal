import React from "react";
import { Helmet } from "react-helmet-async";
import { Typography, Button } from "antd";
import { useNavigate, Link } from "react-router-dom";

const { Title, Paragraph } = Typography;

function SalesforceBenchPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Salesforce Bench Resources | ForceHead</title>
        <meta
          name="description"
          content="List and hire Salesforce bench resources globally. ForceHead helps vendors monetize idle consultants and scale projects faster."
        />
        <link
          rel="canonical"
          href="https://www.forcehead.com/salesforce-bench-resources"
        />
      </Helmet>

      <div style={{ maxWidth: 1000, margin: "100px auto", padding: "0 20px" }}>
        <Title level={1}>Salesforce Bench Resources</Title>

        <Paragraph>
          Salesforce bench resources are certified Salesforce professionals who
          are currently available for deployment on new projects.
        </Paragraph>

        <Paragraph>
          For consulting firms, unmanaged bench reduces profitability. ForceHead
          transforms bench into revenue opportunities through structured
          visibility and vendor collaboration.
        </Paragraph>

        <Title level={2}>What Is Salesforce Bench?</Title>

        <Paragraph>
          Bench refers to consultants who are between projects but ready for
          deployment. These may include:
          <ul>
            <li>Salesforce Developers</li>
            <li>Administrators</li>
            <li>Technical Architects</li>
            <li>CPQ Consultants</li>
            <li>Marketing Cloud Specialists</li>
            <li>MuleSoft Experts</li>
          </ul>
        </Paragraph>

        <Title level={2}>The Problem with Informal Bench Sharing</Title>

        <Paragraph>
          Many vendors rely on LinkedIn posts or messaging groups to share
          availability. This process lacks structure, discoverability, and
          scalability.
        </Paragraph>

        <Title level={2}>How ForceHead Helps</Title>

        <Paragraph>
          Vendors can list available consultants, specify certifications,
          availability, and engagement type. Hiring partners can search and
          connect directly.
        </Paragraph>

        <Paragraph>
          Explore our{" "}
          <Link to="/salesforce-vendor-marketplace">
            Salesforce Vendor Marketplace
          </Link>{" "}
          to understand how collaboration works.
        </Paragraph>

        <Button
          type="primary"
          size="large"
          onClick={() => navigate("/login")}
          style={{ marginTop: 20 }}
        >
          List Bench Resources
        </Button>
      </div>
    </>
  );
}

export default SalesforceBenchPage;
