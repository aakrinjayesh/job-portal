import { Button } from "antd";
import logo from "../../assets/forceheadlogo.png";

const AppHeader = () => {
  return (
    <div style={styles.header}>
     <div style={styles.logoWrapper}>
        <img
          src={logo}
          alt="ForceHead"
          style={styles.logo}
        />
      </div>

      <div style={styles.menu}>
        {/* <span>Products</span> */}
        {/* <span>Features</span>
        <span>Pricing</span> */}
        {/* <span>Support</span> */}
      </div>

      {/* <Button type="primary" style={{ borderRadius: 8 }}>
        Start free trial
      </Button> */}
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
  logoWrapper: {
    display: "flex",
    alignItems: "center",
  },

  logo: {
     width: 188,     // 🔹 increase width here
    height: "135px",
    cursor: "pointer",
  },
  menu: {
    display: "flex",
    gap: 30,
    color: "#555",
  },
};

export default AppHeader;
