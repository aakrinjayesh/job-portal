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
import { useState } from "react";
import Login from "./pages/Login";
import Home from "./candidate/pages/Home";
import UpdateUserProfile from "./candidate/pages/UpdateUserProfile";
import Settings from "./candidate/pages/Settings";
import FAQ from "./candidate/pages/FAQ";
import Signup from "./candidate/pages/Signup";

function App() {
  const [role, setRole] = useState(localStorage.getItem("role"));

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Candidate routes */}
        {role === "candidate" && (
          <>
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
          </>
        )}

        {/* Company routes */}
        {role === "company" && (
          <>
            <Route
              path="/dashboard"
              element={
                <MainLayout>
                  <div>company dashboard</div>
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
          </>
        )}

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
