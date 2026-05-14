import { useEffect, useState } from "react";
import { Card, Typography, Spin, Empty, Row, Col, Pagination } from "antd";
import { getSuggestedUsers } from "../api/api";
import UserProfileCard from "./UserProfileCard";

const { Title } = Typography;

export default function PeopleSidebar({ fullPage = false }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;

  const fetchUsers = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await getSuggestedUsers(currentPage, PAGE_SIZE);
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Failed to load suggestions", err);
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  fetchUsers(page);
}, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchUsers(newPage);
    // scroll to top of list smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const content = loading ? (
    <div style={{ textAlign: "center", padding: 40 }}>
      <Spin size="large" />
    </div>
  ) : users.length === 0 ? (
    <Empty description="No suggestions right now" />
  ) : fullPage ? (
    <>
      <Row gutter={[16, 16]}>
        {users.map((u) => (
          <Col xs={24} sm={12} md={8} lg={6} xl={6} key={u.id}>
            <UserProfileCard user={u} onFollowChange={() => fetchUsers(page)} />
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Pagination
            current={page}
            total={total}
            pageSize={PAGE_SIZE}
            onChange={handlePageChange}
            showSizeChanger={false}
            showTotal={(tot) => `${tot} people`}
          />
        </div>
      )}
    </>
 ) : (
  <>
    {users.map((u) => (
      <UserProfileCard
        key={u.id}
        user={u}
        onFollowChange={() => fetchUsers(page)}
      />
    ))}

    {total > PAGE_SIZE && (
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Pagination
          current={page}
          total={total}
          pageSize={PAGE_SIZE}
          onChange={handlePageChange}
          showSizeChanger={false}
          size="small"
        />
      </div>
    )}
  </>
);

  if (fullPage) {
  return (
    <div>
      <Title level={4} style={{ marginBottom: 4 }}>
        People you may know
      </Title>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
        Candidates on the platform you might want to connect with
      </p>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : users.length === 0 ? (
        <Empty description="No suggestions right now" />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {users.map((u) => (
              <Col xs={24} sm={12} md={8} lg={6} xl={6} key={u.id}>
                <UserProfileCard user={u} onFollowChange={() => fetchUsers(page)} />
              </Col>
            ))}
          </Row>

          {/* Pagination — always render when total > PAGE_SIZE */}
          {total > PAGE_SIZE && (
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Pagination
                current={page}
                total={total}
                pageSize={PAGE_SIZE}
                onChange={handlePageChange}
                showSizeChanger={false}
                showTotal={(tot) => `${tot} people`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

  return (
    <Card
      title={<Title level={5} style={{ margin: 0 }}>People you may know</Title>}
      style={{ borderRadius: 12, position: "sticky", top: 72 }}
      bodyStyle={{ padding: "8px 16px" }}
    >
      {content}
    </Card>
  );
}