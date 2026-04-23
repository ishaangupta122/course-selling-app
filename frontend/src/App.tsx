import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/platform/Home";
import Signup from "./pages/platform/Signup";
import Signin from "./pages/platform/Signin";
import { RecoilRoot } from "recoil";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/instructor/Dashboard";
import StudentSignup from "./pages/instructor/StudentSignup";
import InstructorHome from "./pages/instructor/InstructorHome";
import StudentSignin from "./pages/instructor/StudentSignin";
import { getSubdomain } from "./utils/subdomainHelper";
import { TenantLayout } from "./components/TenantLayout";
import { MainLayout } from "./components/MainLayout";
import CourseDetail from "./components/instructor/CourseDetail";
import EnrolledCourses from "./components/instructor/EnrolledCourses";
import ManageCourse from "./pages/platform/ManageCourse";
import Profile from "./pages/platform/Profile";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AddVideo from "./pages/platform/AddVideo";
import StudentCourseViewer from "./pages/instructor/StudentCourseViewer";
import StudentProfile from "./pages/instructor/StudentProfile";
import AdminSignin from "./pages/admin/AdminSignin";
import AdminSignup from "./pages/admin/AdminSignup";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";

const queryClient = new QueryClient();

const MainRoutes = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/instructor/signup" element={<Signup />} />
        <Route path="/instructor/signin" element={<Signin />} />
        <Route
          path="/instructor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["instructor"]} redirectTo="/instructor/signin">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/dashboard/course/:courseId"
          element={
            <ProtectedRoute allowedRoles={["instructor"]} redirectTo="/instructor/signin">
              <ManageCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/profile"
          element={
            <ProtectedRoute allowedRoles={["instructor"]} redirectTo="/instructor/signin">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/dashboard/course/:courseId/add"
          element={
            <ProtectedRoute allowedRoles={["instructor"]} redirectTo="/instructor/signin">
              <AddVideo />
            </ProtectedRoute>
          }
        />

        {/* Admin routes — outside of any layout, full-page */}
        <Route path="/admin/signin" element={<AdminSignin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/signin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/signin">
              <AdminProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MainLayout>
  );
};

const TenantRoutes = () => {
  return (
    <TenantLayout>
      <Routes>
        <Route path="/" element={<InstructorHome />} />
        <Route path="/signup" element={<StudentSignup />} />
        <Route path="/signin" element={<StudentSignin />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
        <Route
          path="/enrolled-courses"
          element={
            <ProtectedRoute allowedRoles={["student"]} redirectTo="/signin">
              <EnrolledCourses />
            </ProtectedRoute>
          }
        />
        {/* Student course viewer — post-enrollment content page */}
        <Route
          path="/enrolled-courses/:courseId"
          element={
            <ProtectedRoute allowedRoles={["student"]} redirectTo="/signin">
              <StudentCourseViewer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["student"]} redirectTo="/signin">
              <StudentProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </TenantLayout>
  );
};

const App = () => {
  const subdomain = getSubdomain();

  return (
    <>
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            {subdomain ? <TenantRoutes /> : <MainRoutes />}
          </BrowserRouter>
        </QueryClientProvider>
      </RecoilRoot>
    </>
  );
};

export default App;
