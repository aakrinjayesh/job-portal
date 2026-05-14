// import { Card, Button, Typography, Tag, Space, Empty } from "antd";
// import {
//   TrophyOutlined,
//   DownloadOutlined,
//   EyeOutlined,
// } from "@ant-design/icons";
// import dayjs from "dayjs";

// const { Text, Title } = Typography;

// const CertificateCard = ({ certificate }) => {
//   if (!certificate) {
//     return (
//       <Empty
//         image={<TrophyOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />}
//         description="No certificate yet. Pass the assessment with 100% to earn it."
//       />
//     );
//   }

//   const isExpired =
//     certificate.expiresAt && dayjs().isAfter(dayjs(certificate.expiresAt));

//   return (
//     <Card
//       style={{
//         borderRadius: 12,
//         border: "2px solid #faad14",
//         background: "linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%)",
//       }}
//     >
//       <div style={{ textAlign: "center" }}>
//         <TrophyOutlined
//           style={{ fontSize: 48, color: "#faad14", marginBottom: 12 }}
//         />
//         <Title level={4} style={{ margin: 0, color: "#d46b08" }}>
//           Certificate of Completion
//         </Title>
//         <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
//           {certificate.course?.title}
//         </Text>

//         <Space wrap style={{ justifyContent: "center", marginBottom: 16 }}>
//           <Tag color="gold">
//             Issued {dayjs(certificate.issuedAt).format("DD MMM YYYY")}
//           </Tag>
//           {certificate.expiresAt ? (
//             <Tag color={isExpired ? "red" : "green"}>
//               {isExpired
//                 ? `Expired ${dayjs(certificate.expiresAt).format("DD MMM YYYY")}`
//                 : `Valid until ${dayjs(certificate.expiresAt).format("DD MMM YYYY")}`}
//             </Tag>
//           ) : (
//             <Tag color="green">Lifetime Valid</Tag>
//           )}
//         </Space>

//         <Space>
//           {certificate.certificateUrl && (
//             <>
//               <Button
//                 icon={<EyeOutlined />}
//                 onClick={() =>
//                   window.open(certificate.certificateUrl, "_blank")
//                 }
//               >
//                 View
//               </Button>
//               <Button
//                 type="primary"
//                 icon={<DownloadOutlined />}
//                 href={certificate.certificateUrl}
//                 download
//               >
//                 Download
//               </Button>
//             </>
//           )}
//           {!certificate.certificateUrl && (
//             <Text type="secondary">Certificate PDF being generated...</Text>
//           )}
//         </Space>
//       </div>
//     </Card>
//   );
// };

// export default CertificateCard;

import { Button, Empty, Space, Tag } from "antd";
import {
  TrophyOutlined,
  DownloadOutlined,
  EyeOutlined,
  UserOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CertificateCard = ({ certificate, candidateName }) => {
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef(null);

  if (!certificate) {
    return (
      <Empty
        image={<TrophyOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />}
        description="No certificate yet. Pass the assessment with 100% to earn it."
      />
    );
  }

  const isExpired =
    certificate.expiresAt && dayjs().isAfter(dayjs(certificate.expiresAt));

  const creatorName = certificate.course?.creator?.name || "Unknown Creator";
  const courseName = certificate.course?.title || "Unknown Course";
  const candidate = certificate.user?.name || candidateName || "Candidate";

  // ✅ Download certificate as PDF to device
  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${candidate}_${courseName}_Certificate.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const styles = {
    outer: {
      background: "#f5f0e8",
      borderRadius: 16,
      padding: "28px 20px",
      display: "flex",
      justifyContent: "center",
      flexDirection: "column",
      alignItems: "center",
      gap: 16,
    },
    wrap: {
      width: "100%",
      maxWidth: 640,
      background: "#fff",
      border: "2.5px solid #c9a227",
      borderRadius: 12,
      overflow: "hidden",
      position: "relative",
    },
    topBar: {
      background: "#1a3a5c",
      padding: "14px 28px",
      display: "flex",
      alignItems: "center",
      gap: 12,
    },
    orgName: {
      fontSize: 12,
      fontWeight: 500,
      color: "#f0d080",
      letterSpacing: "1.5px",
      textTransform: "uppercase",
    },
    body: {
      padding: "28px 40px 24px",
      textAlign: "center",
    },
    titleLabel: {
      fontSize: 11,
      letterSpacing: "3px",
      color: "#9a7a30",
      textTransform: "uppercase",
      marginBottom: 2,
    },
    candidateName: {
      fontSize: 28,
      fontWeight: 500,
      color: "#c9a227",
      fontFamily: "Georgia, serif",
      margin: "0 0 4px",
    },
    courseName: {
      fontSize: 17,
      fontWeight: 600,
      color: "#1a3a5c",
      margin: "0 0 4px",
    },
    metaRow: {
      display: "flex",
      justifyContent: "center",
      gap: 24,
      margin: "14px 0",
      flexWrap: "wrap",
    },
    metaItem: { textAlign: "center" },
    metaLabel: {
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: "1px",
      color: "#888",
      marginBottom: 2,
    },
    metaValue: { fontSize: 13, fontWeight: 500 },
    sealRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginTop: 18,
      paddingTop: 14,
      borderTop: "0.5px solid #c9a227",
      gap: 12,
    },
    sigBlock: { textAlign: "center", flex: 1 },
    sigName: {
      fontSize: 14,
      fontWeight: 500,
      fontFamily: "Georgia, serif",
      color: "#1a1a1a",
      marginBottom: 2,
    },
    sigLine: {
      width: 100,
      height: 1,
      background: "#ccc",
      margin: "0 auto 4px",
    },
    sigRole: {
      fontSize: 11,
      color: "#888",
      textTransform: "uppercase",
      letterSpacing: "0.8px",
    },
    seal: {
      width: 64,
      height: 64,
      borderRadius: "50%",
      background: "#1a3a5c",
      border: "3px double #c9a227",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    certId: {
      fontSize: 10,
      color: "#aaa",
      marginTop: 10,
      fontFamily: "monospace",
    },
  };

  const corners = [
    { top: 48, left: 10, borderWidth: "2px 0 0 2px" },
    { top: 48, right: 10, borderWidth: "2px 2px 0 0" },
    { bottom: 10, left: 10, borderWidth: "0 0 2px 2px" },
    { bottom: 10, right: 10, borderWidth: "0 2px 2px 0" },
  ].map((pos, i) => (
    <div
      key={i}
      style={{
        position: "absolute",
        width: 28,
        height: 28,
        borderColor: "#c9a227",
        borderStyle: "solid",
        pointerEvents: "none",
        ...pos,
      }}
    />
  ));

  return (
    <div style={styles.outer}>
      {/* ✅ ref wraps only the certificate design (not the buttons) */}
      <div style={styles.wrap} ref={certRef}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <TrophyOutlined style={{ fontSize: 18, color: "#f0d080" }} />
          <span style={styles.orgName}>
            {certificate.organization ?? "Forcehead Academy"} · Certified
            Program
          </span>
        </div>

        {corners}

        <div style={styles.body}>
          <p style={styles.titleLabel}>This certifies that</p>
          <p style={styles.candidateName}>{candidate}</p>

          <p style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>
            has successfully completed the course
          </p>

          <p style={styles.courseName}>{courseName}</p>

          {/* Gold divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "14px 0",
            }}
          >
            <div style={{ flex: 1, height: 0.5, background: "#c9a227" }} />
            <div
              style={{
                width: 7,
                height: 7,
                background: "#c9a227",
                transform: "rotate(45deg)",
              }}
            />
            <div style={{ flex: 1, height: 0.5, background: "#c9a227" }} />
          </div>

          {/* Meta grid */}
          <div style={styles.metaRow}>
            <div style={styles.metaItem}>
              <div style={styles.metaLabel}>
                <UserOutlined style={{ fontSize: 10, marginRight: 2 }} />
                Course Creator
              </div>
              <div style={styles.metaValue}>{creatorName}</div>
            </div>

            <div style={styles.metaItem}>
              <div style={styles.metaLabel}>Issued On</div>
              <div style={styles.metaValue}>
                {dayjs(certificate.issuedAt).format("DD MMM YYYY")}
              </div>
            </div>

            <div style={styles.metaItem}>
              <div style={styles.metaLabel}>Valid Until</div>
              <div style={styles.metaValue}>
                {certificate.expiresAt
                  ? dayjs(certificate.expiresAt).format("DD MMM YYYY")
                  : "Lifetime"}
              </div>
            </div>

            {certificate.score != null && (
              <div style={styles.metaItem}>
                <div style={styles.metaLabel}>Score</div>
                <div style={{ ...styles.metaValue, color: "#c9a227" }}>
                  {certificate.score} / 100
                </div>
              </div>
            )}
          </div>

          {/* Status badges */}
          <Space wrap style={{ justifyContent: "center", margin: "10px 0" }}>
            <Tag color="gold">
              <TrophyOutlined /> Certificate of Completion
            </Tag>
            {certificate.expiresAt ? (
              <Tag color={isExpired ? "red" : "green"}>
                {isExpired ? "Expired" : "Active"}
              </Tag>
            ) : (
              <Tag color="green">Lifetime Valid</Tag>
            )}
          </Space>

          {/* Seal row */}
          <div style={styles.sealRow}>
            <div style={styles.sigBlock}>
              <div style={styles.sigName}>{creatorName}</div>
              <div style={styles.sigLine} />
              <div style={styles.sigRole}>Course Instructor</div>
            </div>

            <div style={styles.seal}>
              <TrophyOutlined style={{ fontSize: 22, color: "#f0d080" }} />
              <span
                style={{
                  fontSize: 7,
                  color: "#f0d080",
                  letterSpacing: 1,
                  marginTop: 2,
                  textTransform: "uppercase",
                }}
              >
                Verified
              </span>
            </div>

            <div style={styles.sigBlock}>
              <div style={styles.sigName}>Forcehead Team</div>
              <div style={styles.sigLine} />
              <div style={styles.sigRole}>Program Director</div>
            </div>
          </div>

          {certificate.id && (
            <p style={styles.certId}>
              Certificate ID: {certificate.id.toUpperCase()}
            </p>
          )}
        </div>
      </div>

      {/* ✅ Buttons OUTSIDE the ref so they don't appear in the PDF */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {certificate.certificateUrl && (
          <Button
            icon={<EyeOutlined />}
            onClick={() => window.open(certificate.certificateUrl, "_blank")}
          >
            View
          </Button>
        )}

        {/* ✅ This downloads the certificate as a real PDF file to your device */}
        <Button
          type="primary"
          icon={downloading ? <LoadingOutlined /> : <DownloadOutlined />}
          onClick={handleDownloadPDF}
          disabled={downloading}
          style={{ background: "#1a3a5c", borderColor: "#1a3a5c" }}
        >
          {downloading ? "Generating PDF..." : "Download Certificate"}
        </Button>
      </div>
    </div>
  );
};

export default CertificateCard;
