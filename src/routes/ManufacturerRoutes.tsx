
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Manufacturer from "@/pages/Manufacturer";
import ManufacturerOnboarding from "@/pages/ManufacturerOnboarding";
import ManufacturerOrders from "@/pages/ManufacturerOrders";

const ManufacturerRoutes = () => {
  return (
    <ProtectedRoute>
      <Routes>
        <Route path="/" element={<Manufacturer />} />
        <Route path="/onboarding" element={<ManufacturerOnboarding />} />
        <Route path="/orders" element={<ManufacturerOrders />} />
      </Routes>
    </ProtectedRoute>
  );
};

export default ManufacturerRoutes;
