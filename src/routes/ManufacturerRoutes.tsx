
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Manufacturer from "@/pages/Manufacturer";
import ManufacturerOnboarding from "@/pages/ManufacturerOnboarding";

const ManufacturerRoutes = () => {
  return (
    <ProtectedRoute>
      <Routes>
        <Route path="/" element={<Manufacturer />} />
        <Route path="/onboarding" element={<ManufacturerOnboarding />} />
      </Routes>
    </ProtectedRoute>
  );
};

export default ManufacturerRoutes;
