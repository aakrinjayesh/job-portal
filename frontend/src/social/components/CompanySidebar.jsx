import { useEffect, useState } from "react";
import { Card, Typography, Spin, Empty, Row, Col } from "antd";
import { getSuggestedCompanies } from "../api/api";
import CompanyCard from "../pages/CompanyCard";

const { Title } = Typography;

export default function CompaniesSidebar({ fullPage = false }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      const res = await getSuggestedCompanies();
      setCompanies(res.data);
    } catch (err) {
      console.error("Failed to load companies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const content = loading ? (
    <div style={{ textAlign: "center", padding: 40 }}>
      <Spin size="large" />
    </div>
  ) : companies.length === 0 ? (
    <Empty description="No companies to suggest" style={{ marginTop: 40 }} />
  ) : fullPage ? (
    <Row gutter={[20, 20]}>
      {companies.map((c) => (
       <Col xs={24} sm={12} md={8} lg={6} xl={6} key={c.id}> {/* ← lg=6 = 4 per row */}
          <CompanyCard company={c} onFollowChange={fetchCompanies} />
        </Col>
      ))}
    </Row>
  ) : (
    companies.slice(0, 5).map((c) => (
      <CompanyCard key={c.id} company={c} onFollowChange={fetchCompanies} />
    ))
  );

  if (fullPage) {
    return (
      <div style={{ padding: "4px 0" }}>
        <Title level={4} style={{ marginBottom: 4 }}>
          Companies you may know
        </Title>
        <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
          Follow companies to stay updated with their posts and jobs
        </p>
        {content}
      </div>
    );
  }

  return (
    <Card
      title={<Title level={5} style={{ margin: 0 }}>Companies to follow</Title>}
      style={{ borderRadius: 12, position: "sticky", top: 72 }}
      bodyStyle={{ padding: "8px 12px" }}
    >
      {content}
    </Card>
  );
}