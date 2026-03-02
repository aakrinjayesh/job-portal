import React from "react";
import { Helmet } from "react-helmet-async";
import { Typography, Button } from "antd";
import { useNavigate, Link } from "react-router-dom";

const { Title, Paragraph } = Typography;

function VendorMarketplacePage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Salesforce Vendor Marketplace | ForceHead</title>
        <meta
          name="description"
          content="ForceHead is a global Salesforce vendor marketplace where consulting partners list bench resources and hire certified Salesforce consultants from trusted vendors."
        />
        <link
          rel="canonical"
          href="https://www.forcehead.com/salesforce-vendor-marketplace"
        />
      </Helmet>

      <div style={{ maxWidth: 1000, margin: "100px auto", padding: "0 20px" }}>
        <Title level={1}>The Salesforce Vendor Marketplace</Title>

        <Paragraph>
          ForceHead is a global Salesforce vendor marketplace built exclusively
          for Salesforce consulting partners to collaborate, hire, and monetize
          bench resources.
        </Paragraph>

        <Paragraph>
          Unlike generic job boards, ForceHead enables structured
          vendor-to-vendor hiring within the Salesforce ecosystem. Vendors can
          list certified consultants, specify availability, and connect directly
          with partners actively hiring.
        </Paragraph>

        <Title level={2}>Why a Dedicated Salesforce Marketplace?</Title>

        <Paragraph>
          The Salesforce ecosystem includes thousands of implementation partners
          worldwide. Yet vendor hiring often happens through informal channels
          like WhatsApp groups, LinkedIn posts, or spreadsheets.
        </Paragraph>

        <Paragraph>
          This creates inefficiencies:
          <ul>
            <li>Idle bench resources</li>
            <li>Slow hiring cycles</li>
            <li>Limited partner visibility</li>
            <li>Lost revenue opportunities</li>
          </ul>
        </Paragraph>

        <Title level={2}>How ForceHead Works</Title>

        <Paragraph>
          Vendors can list Salesforce consultants across clouds including Sales
          Cloud, Service Cloud, CPQ, Marketing Cloud, MuleSoft, and Data Cloud.
        </Paragraph>

        <Paragraph>
          Hiring partners can search by:
          <ul>
            <li>Cloud specialization</li>
            <li>Certifications</li>
            <li>Experience level</li>
            <li>Availability</li>
          </ul>
        </Paragraph>

        <Title level={2}>Built for Growth</Title>

        <Paragraph>
          ForceHead operates on a subscription model designed for serious
          Salesforce partners. As the ecosystem grows, structured collaboration
          becomes essential.
        </Paragraph>

        <Paragraph>
          Learn more about how to monetize{" "}
          <Link to="/salesforce-bench-resources">
            Salesforce bench resources
          </Link>
          .
        </Paragraph>

        <Button
          type="primary"
          size="large"
          onClick={() => navigate("/login")}
          style={{ marginTop: 20 }}
        >
          Join ForceHead
        </Button>
      </div>
    </>
  );
}

export default VendorMarketplacePage;
