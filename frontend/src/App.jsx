// import Signup from "./pages/Signup";
// import Login from "./pages/Login";
// import Home from "./pages/Home";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// function App() {
//   return (
//     <>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Navigate to="/login" replace />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />
//           <Route path="/home" element={<Home />} />
//         </Routes>
//       </BrowserRouter>
//     </>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./candidate/layouts/MainLayout";
import Login from "./pages/Login";
import Home from "./candidate/pages/Home";
import UpdateUserProfile from "./candidate/pages/UpdateUserProfile";
import Settings from "./candidate/pages/Settings";
import FAQ from "./candidate/pages/FAQ";
import Signup from "./candidate/pages/Signup";
import DashBoard from "./company/pages/DashBoard";

function App() {
  console.log("hi");
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Candidate routes */}
        <Route
          path="/home"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />
        <Route
          path="/updateprofile"
          element={
            <MainLayout>
              <UpdateUserProfile />
            </MainLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <MainLayout>
              <Settings />
            </MainLayout>
          }
        />
        <Route
          path="/faq"
          element={
            <MainLayout>
              <FAQ />
            </MainLayout>
          }
        />

        {/* Company routes */}
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <DashBoard />
            </MainLayout>
          }
        />
        <Route
          path="/manage-jobs"
          element={
            <MainLayout>
              <div>company jobs</div>
            </MainLayout>
          }
        />
        <Route
          path="/candidates"
          element={
            <MainLayout>
              <div>company candidates</div>
            </MainLayout>
          }
        />
        <Route
          path="/company-settings"
          element={
            <MainLayout>
              <div>company seetings</div>
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
