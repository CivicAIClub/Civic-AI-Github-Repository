import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { ResourceHub } from "./pages/ResourceHub";
import { StudentDirectory } from "./pages/StudentDirectory";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="students" element={<StudentDirectory />} />
        <Route path="resources" element={<ResourceHub />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
