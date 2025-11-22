// AppWrapper.js
import React, { useState, useEffect } from "react";
import { Modal, Button, Spin } from "antd";
import { useNavigate,Outlet } from "react-router-dom";
import { GetUserProfile } from "./company/api/api";

const AppWrapper = () => {
  const [isProfileVerified, setIsProfileVerified] = useState(null); // null = loading
  // eslint-disable-next-line no-unused-vars
  const [userProfile, setUserProfile] = useState(null);
  const [skipProfileCheck, setSkipProfileCheck] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchUserProfile = async () => {
      try {
        const res = await GetUserProfile();

        const ok =
          res &&
          (res?.success === true ||
            res?.success === "true" ||
            !!res.user ||
            !res?.success);

        if (ok) {
          const profile = res?.user ?? res;
          if (mounted) {
            setUserProfile(profile);
            const firstName = profile?.firstName;
            setIsProfileVerified(firstName ? true : false);
          }
        } else {
          if (mounted) setIsProfileVerified(true);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (mounted) setIsProfileVerified(true);
      }
    };

    fetchUserProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const handleVerify = () => {
    setSkipProfileCheck(true);
    navigate("/myProfile/edit", { state: { openInEditMode: true } });
  };

 /*  const handleCancel = () => {
    setSkipProfileCheck(true);

    const role = userProfile?.role;
    if (role === "candidate") {
      navigate("/candidate/dashboard");
    } else if (role === "company") {
      navigate("/company/dashboard");
    } else {
      navigate("/");
    }
  }; */
  const handleCancel = () => {
  // Dismiss modal for this session only and allow access to the app
  setSkipProfileCheck(true);
  // no navigation here
};

  if (isProfileVerified === null && !skipProfileCheck) {
    return (
      <div style={{ height: "100vh", display: "grid", placeItems: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  const shouldShowModal =
    !skipProfileCheck && isProfileVerified === false;

  return (
    <>
      {shouldShowModal && (
        <Modal
          open={true}
          title="Profile Verification"
          closable={false}
          maskClosable={false}
          keyboard={false}
          centered
          footer={null}
        >
          <p>Your profile is not yet verified. Please verify.</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Button type="primary" onClick={handleVerify}>
              Verify
            </Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </div>
        </Modal>
      )}
   <Outlet />
    </>
  );
};

export default AppWrapper;
