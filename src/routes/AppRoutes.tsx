
import { Routes, Route, Navigate } from "react-router-dom";
import { PublicRoutes } from "./PublicRoutes";
import { ProtectedRoutes } from "./ProtectedRoutes";
import { CRMRoutes, CreatorRoutes, ArtisanRoutes, ManufacturerRoutes } from "./FeatureRoutes";
import NotFound from "@/pages/NotFound";
import { NotificationCenterPage } from "@/pages/NotificationCenterPage";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <PublicRoutes />
      
      {/* Protected Routes */}
      <ProtectedRoutes />
      
      {/* Feature-specific Routes */}
      <CRMRoutes />
      <CreatorRoutes />
      <ArtisanRoutes />
      <ManufacturerRoutes />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
