// import React from "react";
// import { Col, Row, Card } from "antd";
// import Seetings from "./Settings";

// function Home() {
//   return (
//     <>
//       <Row>
//         <Col span={6} style={{ height: "100%", overflowY: "auto" }}>
//           <Card style={{ width: "95%", height: "100%" }}>content</Card>
//         </Col>
//         <Col span={18} style={{ height: "100%", overflowY: "auto" }}>
//           <Card style={{ height: "100%" }}>
//             <Seetings />
//           </Card>
//         </Col>
//       </Row>
//     </>
//   );
// }

// export default Home;

import React from "react";
import { Col, Row, Card } from "antd";
import Seetings from "./Settings";
import FiltersPanel from "../components/Home/FilterPanel";
import JobList from "../components/Home/JobList";

function Home() {
  const handleFiltersChange = (filters) => {
    console.log("Received in Home.jsx:", filters);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f6fa",
        padding: "16px",
      }}
    >
      <Row
        gutter={[16, 16]}
        style={{
          flex: 1,
          height: "100%",
        }}
      >
        {/* Sidebar (Left Column) */}
        <Col
          span={6}
          style={{
            height: "100%",
            overflowY: "auto",
            scrollbarWidth: "thin",
          }}
        >
          {/* <Card
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 12,
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            Sidebar content
          </Card> */}
          <FiltersPanel onFiltersChange={handleFiltersChange} />
        </Col>

        {/* Main Content (Right Column) */}
        <Col
          span={18}
          style={{
            height: "100%",
            overflowY: "auto",
            scrollbarWidth: "thin",
          }}
        >
          <Card
            style={{
              height: "100%",
              borderRadius: 12,
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              overflowY: "auto",
            }}
            bodyStyle={{
              padding: "16px 24px",
            }}
          >
            <JobList />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Home;
