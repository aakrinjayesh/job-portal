import { Typography } from "antd";
import presoImg from "../../assets/preso.png";
import ridoriaImg from "../../assets/ridoria.png";
import alterboneImg from "../../assets/alterbone.png";
import logosumImg from "../../assets/logosum.png";

const { Text } = Typography;


const AppFooter = () => {
  return (
 <div style={styles.footerWrapper}>
  <div style={styles.footerCard}>
    <Text style={styles.footerText}>
      We have partnered with over 200+ Companies around the globe
    </Text>

     <div style={styles.footerLogos}>
          <div style={styles.logoBox}>
            <img src={presoImg} alt="Preso" />
          </div>
          <div style={styles.logoBox}>
            <img src={ridoriaImg} alt="Ridoria" />
          </div>
          <div style={styles.logoBox}>
            <img src={alterboneImg} alt="Alterbone" />
          </div>
          <div style={styles.logoBox}>
            <img src={logosumImg} alt="Logosum" />
          </div>
        </div>
  </div>
</div>
  );
};

const styles = {
  footer: {
    height: 60,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#fff",
    borderTop: "1px solid #eee",
  },

footerWrapper: {
  width: "100%",
  display: "flex",
  justifyContent: "center",
  //marginTop: 40,   // ❗ REMOVE negative margin
  paddingBottom: 40,
},


footerCard: {
  background: "#fff",
  padding: "24px 40px",
  borderRadius: 16,
  boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
  textAlign: "center",
  maxWidth: 900,
  width: "90%",
},

footerText: {
  fontSize: 14,
  fontWeight: 500,
  marginBottom: 20,
},

footerLogos: {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 24,
  flexWrap: "wrap",
},

logoBoxImg: {
  height: 24,
}
};

export default AppFooter;
