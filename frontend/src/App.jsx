import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./candidate/layouts/MainLayout";
import UpdateUserProfile from "./candidate/pages/UpdateUserProfile";
import CompanySettings from "./company/pages/Settings";
import CompanySettingsPage from "./company/pages/CompanySettings";
import Settings from "./candidate/pages/Settings";
import FAQ from "./candidate/pages/FAQ";
import DashBoard from "./company/pages/DashBoard";
import CompanyLayout from "./company/layout/CompanyLayout";
import { ConfigProvider, theme } from "antd";
import CandidateJobDetails from "./candidate/components/Job/CandidateJobDetails";
import JobDetails from "./company/components/Job/JobDetails";
import Jobs from "./candidate/pages/Jobs";
import AppliedJobs from "./candidate/pages/AppliedJobs";
import Job from "./company/pages/Job";
import CandidateDetails from "./company/components/Job/CandidateDetails";
import CandidateList from "./company/components/Job/CandidateList";
import Bench from "./company/pages/Bench";
import FindJob from "./company/pages/FindJob";
import SavedJobs from "./candidate/pages/SavedJobs";
import LoginPage from "./pages/LoginPage";
import Signup from "./pages/Signup";
import CreatePassword from "./pages/CreatePassword";
import ContactSupport from "./pages/ContactSupport";
import ChatPage from "./chat/pages/chat";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import CompanySavedJobs from "./company/pages/CompanySavedJobs";
import FindBench from "./company/pages/FindBench";
import SavedCandidates from "./company/components/Job/SavedCandidates";
import BenchCandidateDetails from "./company/components/Bench/BenchCandidateDetails";
// import ResetPassword from "./pages/ResetPassword";
import MyActivity from "./company/pages/MyActivity";
import MyProfile from "./company/pages/MyProfile";
import { useEffect } from "react";
import LandingRedirect from "./pages/LandingRedirect";
import { useLocation } from "react-router-dom";
import axiosInstance from "./candidate/api/axiosInstance";
import PricingPage from "./pages/PricingPage";
import RenewalPage from "./company/pages/RenewalPage";
import TermsAndConditions from "./pages/TermsAndConditions";
import PublicJobRedirect from "./pages/PublicJobRedirect";
import LimitExceededAlert from "./components/alert/LimitExceededAlert";
import { subscribeToLimit, unsubscribeFromLimit } from "./utils/limitEventBus";
import { useState, useRef } from "react";
import HomePage from "./pages/HomePage";
import VendorMarketplacePage from "./pages/VendorMarketplacePage";
import LicenseExpiredAlert from "./components/alert/LicenseExpiredAlert";
import SalesforceBenchPage from "./pages/SalesforceBenchPage";
import CompanyProfilePopup from "./components/alert/CompanyProfilePopup";
import PublicCompanyProfile from "./pages/PublicCompanyProfile";

// import AppliedCandidatesByJob from "./company/pages/AppliedCandidatesByJob";

function App() {
  const location = useLocation();
  const [limitOpen, setLimitOpen] = useState(false);
  const [licenseOpen, setLicenseOpen] = useState(false);
  const [limitData, setLimitData] = useState(null);
  const [showCompanyPopup, setShowCompanyPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    if (location.pathname === "/login") return;

    const initAuth = async () => {
      try {
        const res = await axiosInstance.get("/auth/refresh-token");
        localStorage.setItem("token", res.data.token);
      } catch (err) {
        console.log("err refresh-token", err.message);
        // localStorage.clear();
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const handler = (data) => {
      if (data.type === "LIMIT_EXCEEDED") {
        setLimitData(data);
        setLimitOpen(true);
      }

      if (data.type === "LICENSE_EXPIRED") {
        setLicenseOpen(true);
      }
    };

    subscribeToLimit(handler);

    return () => {
      unsubscribeFromLimit(handler);
    };
  }, []);

  useEffect(() => {
    const checkPopup = () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      if (location.pathname !== "/company/jobs") return;

      const popupClosed = sessionStorage.getItem("companyPopupClosed");
      if (popupClosed) return;

      if (user.role === "company") {
        if (!user.companyName && !user.phoneNumber) {
          setPopupMessage("Complete the Company and  Personal Profile");
          setShowCompanyPopup(true);
        } else if (!user.companyName) {
          setPopupMessage("Complete the Company Profile");
          setShowCompanyPopup(true);
        } else if (!user.phoneNumber) {
          setPopupMessage("Complete the Personal Profile");
          setShowCompanyPopup(true);
        }
      }
    };

    checkPopup();
  }, [location.pathname]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            // triggerBg: "#1677FF",
            triggerBg: "#011026",
            triggerColor: "white",
          },
        },
      }}
    >
      <Routes>
        {/* Public routes */}
        {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/createpassword" element={<CreatePassword />} />
        <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/contact" element={<ContactSupport />} />
        <Route
          path="/salesforce-vendor-marketplace"
          element={<VendorMarketplacePage />}
        />
        <Route
          path="/salesforce-bench-resources"
          element={<SalesforceBenchPage />}
        />
        <Route
          path="/job/:id"
          element={
            <>
              <PublicJobRedirect />
              <JobDetails mode="candidate" isPublic={true} />
            </>
          }
        />
        {/* <Route path="/resetpassword" element={<ResetPassword />} /> */}

        {/* Candidate routes */}
        <Route
          path="/candidate/dashboard"
          element={
            <MainLayout>
              <div>dashboard</div>
            </MainLayout>
          }
        />
        <Route
          path="/candidate/jobs"
          element={
            <MainLayout>
              <Jobs />
            </MainLayout>
          }
        />
        <Route
          path="/candidate/jobs/saved"
          element={
            <MainLayout>
              <SavedJobs />
            </MainLayout>
          }
        />
        <Route
          path="/candidate/jobs/applied"
          element={
            <MainLayout>
              <AppliedJobs />
            </MainLayout>
          }
        />
        <Route
          path="/candidate/profile"
          element={
            <MainLayout>
              <UpdateUserProfile />
            </MainLayout>
          }
        />
        <Route
          path="/candidate/chat"
          element={
            <MainLayout>
              <ChatPage />
            </MainLayout>
          }
        />
        <Route
          path="/candidate/settings"
          element={
            <MainLayout>
              <Settings />
            </MainLayout>
          }
        />
        <Route
          path="/candidate/faq"
          element={
            <MainLayout>
              <FAQ />
            </MainLayout>
          }
        />
        <Route
          path="/candidate/job/:id"
          element={
            <MainLayout>
              {/* <CandidateJobDetails /> */}
              <JobDetails mode="candidate" />
            </MainLayout>
          }
        />

        {/* Company routes */}
        <Route
          path="/company/dashboard"
          element={
            <CompanyLayout>
              <DashBoard />
            </CompanyLayout>
          }
        />

        <Route
          path="/company/candidates"
          element={
            <CompanyLayout>
              <CandidateList />
            </CompanyLayout>
          }
        />

        {/* <Route
          path="/company/appliedcandidatesbyjob"
          element={
            <CompanyLayout>
              <AppliedCandidatesByJob />
            </CompanyLayout>
          }
        /> */}

        <Route
          path="/company/my-activity"
          element={
            <CompanyLayout>
              <MyActivity />
            </CompanyLayout>
          }
        />

        <Route
          path="/company/candidate/:id"
          element={
            <CompanyLayout>
              <CandidateDetails />
            </CompanyLayout>
          }
        />

        <Route
          path="/company/jobs"
          element={
            <CompanyLayout>
              <Job />
            </CompanyLayout>
          }
        />

        <Route
          path="/company/job/:id"
          element={
            <CompanyLayout>
              {/* <JobDetails /> */}
              <JobDetails mode="company" />
            </CompanyLayout>
          }
        />

        <Route
          path="/company/profile"
          element={
            <CompanyLayout>
              <MyProfile />
            </CompanyLayout>
          }
        />
        <Route
          path="/company/job/find"
          element={
            <CompanyLayout>
              <FindJob />
            </CompanyLayout>
          }
        />

        <Route
          path="/company/jobs/saved"
          element={
            <CompanyLayout>
              <CompanySavedJobs />
            </CompanyLayout>
          }
        />

        <Route
          path="/company/job/:id"
          element={
            <CompanyLayout>
              <JobDetails />
            </CompanyLayout>
          }
        />

        <Route
          path="/company/bench"
          element={
            <CompanyLayout>
              <Bench />
            </CompanyLayout>
          }
        />

        <Route
          path="/company/candidate/find"
          element={
            <CompanyLayout>
              <FindBench />
            </CompanyLayout>
          }
        />

        {/* <Route
          // path="/company/bench/candidates"
          path="/company/candidate/:id"
          element={
            <CompanyLayout>
              <BenchCandidateDetails />
            </CompanyLayout>
          }
        /> */}

        <Route
          path="/company/bench/saved"
          element={
            <CompanyLayout>
              <SavedCandidates />
            </CompanyLayout>
          }
        />

        <Route
          path="/company/chat"
          element={
            <CompanyLayout>
              <ChatPage />
            </CompanyLayout>
          }
        />

        <Route
          path="/company/pricing"
          element={
            <CompanyLayout>
              <PricingPage />
            </CompanyLayout>
          }
        />

        <Route
          path="/company/renew"
          element={
            <CompanyLayout>
              <RenewalPage />
            </CompanyLayout>
          }
        />

        <Route
          path="/company/settings"
          element={
            <CompanyLayout>
              <CompanySettingsPage />
            </CompanyLayout>
          }
        />

        <Route
          path="/company/public/:slug"
          element={
            <CompanyLayout>
              <PublicCompanyProfile />
            </CompanyLayout>
          }
        />
      </Routes>
      <LimitExceededAlert
        open={limitOpen}
        onClose={() => setLimitOpen(false)}
        message={limitData?.message}
      />
      <LicenseExpiredAlert
        open={licenseOpen}
        onClose={() => setLicenseOpen(false)}
      />
      <CompanyProfilePopup
        open={showCompanyPopup}
        message={popupMessage}
        onClose={() => {
          sessionStorage.setItem("companyPopupClosed", "true");
          setShowCompanyPopup(false);
        }}
      />
    </ConfigProvider>
  );
}

export default App;
