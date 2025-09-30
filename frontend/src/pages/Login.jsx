// import React, { useState } from "react";
// import { Card, Tabs } from "antd";
// import Candidate from "../components/Candidate";
// import Company from "../components/Company";

// const Login = () => {
//   const [activeTab, setActiveTab] = useState("1");

//   const items = [
//     { key: "1", label: "Candidate", children: <Candidate /> },
//     { key: "2", label: "Company", children: <Company /> },
//   ];

//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         height: "100vh",
//         background: "#f9f9f9",
//       }}
//     >
//       <Card
//         hoverable
//         style={{ width: 500, padding: "40px", background: "#fff" }}
//       >
//         <Tabs
//           activeKey={activeTab}
//           onChange={setActiveTab}
//           centered
//           items={items}
//         />
//       </Card>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from "react";
import { Card, Tabs } from "antd";
import Candidate from "../components/Candidate";
import Company from "../components/Company";

const Login = () => {
  const [activeTab, setActiveTab] = useState("1");

  const items = [
    { key: "1", label: "Candidate", children: <Candidate /> },
    { key: "2", label: "Company", children: <Company /> },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f9f9f9",
      }}
    >
      <Card
        hoverable
        style={{ width: 500, padding: "40px", background: "#fff" }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={items}
        />
      </Card>
    </div>
  );
};

export default Login;
