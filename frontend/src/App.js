import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Forgot from "./pages/Forgot";
import Reset from "./pages/Reset";
import Verify from "./pages/Verify";
import Dashboard from "./pages/Dashboard";
import EmployeeList from "./pages/EmployeeList";
import EmployeeDetail from "./pages/EmployeeDetail";
import CreateEmployee from "./pages/CreateEmployee";
import Profile from "./pages/Profile";
import Departments from "./pages/Departments";
import Skills from "./pages/Skills";
import CompleteProfile from "./pages/CompleteProfile";
import MySkills from "./pages/MySkills";
import ApplyLeave from "./pages/ApplyLeave";
import MyLeaves from "./pages/MyLeaves";
import LeaveBalance from "./pages/LeaveBalance";
import LeaveApprovals from "./pages/LeaveApprovals";
import LeaveTypes from "./pages/LeaveTypes";
import HRReports from "./pages/HRReports";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/verify/:token" element={<Verify />} />

          <Route path="/dashboard"element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile"element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/employees"element={<ProtectedRoute><EmployeeList /></ProtectedRoute>} />
          <Route path="/employees/create"element={<ProtectedRoute><CreateEmployee /></ProtectedRoute>} />
          <Route path="/employees/:id" element={<ProtectedRoute><EmployeeDetail /></ProtectedRoute>} />
          <Route path="/departments" element={<ProtectedRoute><Departments /></ProtectedRoute>} />
          <Route path="/skills"element={<ProtectedRoute><Skills /></ProtectedRoute>} />
          <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
          <Route path="/my-skills"element={<ProtectedRoute><MySkills /></ProtectedRoute>} />

          <Route path="/apply-leave"element={<ProtectedRoute><ApplyLeave /></ProtectedRoute>} />
          <Route path="/my-leaves"element={<ProtectedRoute><MyLeaves /></ProtectedRoute>} />
          <Route path="/leave-balance"element={<ProtectedRoute><LeaveBalance /></ProtectedRoute>} />
          <Route path="/leave-approvals"element={<ProtectedRoute><LeaveApprovals /></ProtectedRoute>} />
          <Route path="/leave-types"element={<ProtectedRoute><LeaveTypes /></ProtectedRoute>} />
          <Route path="/hr-reports"element={<ProtectedRoute><HRReports /></ProtectedRoute>} />
          <Route path="/notifications"element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;
