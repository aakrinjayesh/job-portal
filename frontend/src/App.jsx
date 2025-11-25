import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./candidate/layouts/MainLayout";
import UpdateUserProfile from "./candidate/pages/UpdateUserProfile";
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
import ChatPage from "./chat/pages/chat";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import CompanySavedJobs from "./company/pages/CompanySavedJobs";
// import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            triggerBg: "#fff",
            triggerColor: "black",
          },
        },
      }}
    >
      {/* <BrowserRouter> */}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/createpassword" element={<CreatePassword />} />
        <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
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
              <CandidateJobDetails />
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
          path="/company/bench/find"
          element={
            <CompanyLayout>
              <div>bench details</div>
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
      </Routes>
      {/* </BrowserRouter> */}
    </ConfigProvider>
  );
}

export default App;
