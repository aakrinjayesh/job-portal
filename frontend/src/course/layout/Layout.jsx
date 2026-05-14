import { Layout } from "antd";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

const CourseLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Content style={{ padding: "0", minHeight: "100vh" }}>{children}</Content>
    </Layout>
  );
};

export default CourseLayout;
