import { Button } from "antd";

const AppHeader = () => {
  return (
    <div style={styles.header}>
      <div style={styles.logo}>QuickHire SF</div>

      {/* <div style={styles.menu}>
        <span>Products</span>
        <span>Features</span>
        <span>Pricing</span>
        <span>Support</span>
      </div> */}

      <Button type="primary" style={{ borderRadius: 8 }}>
        Start free trial
      </Button>
    </div>
  );
};

const styles = {
  header: {
    height: 70,
    padding: "0 60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #f0f0f0",
    background: "#fff",
  },
  logo: {
    fontSize: 18,
    fontWeight: 600,
  },
  menu: {
    display: "flex",
    gap: 30,
    color: "#555",
  },
};

export default AppHeader;
