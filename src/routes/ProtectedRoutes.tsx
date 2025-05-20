
import { Route, Fragment } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Create from "@/pages/Create";
import Design from "@/pages/Design";
import Dashboard from "@/pages/Dashboard";
import Designs from "@/pages/Designs";
import Orders from "@/pages/Orders";
import Notifications from "@/pages/Notifications";
import MakerDetail from "@/pages/MakerDetail";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
import Subscription from "@/pages/Subscription";
import SubscriptionSuccess from "@/pages/subscription/Success";
import SubscriptionCancel from "@/pages/subscription/Cancel";
import { NotificationCenterPage } from "@/pages/NotificationCenterPage";

export const ProtectedRoutes = () => {
  return (
    <Fragment>
      <Route path="/create" element={
        <ProtectedRoute>
          <Create />
        </ProtectedRoute>
      } />
      <Route path="/design/:id" element={
        <ProtectedRoute>
          <Design />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/designs" element={
        <ProtectedRoute>
          <Designs />
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      } />
      <Route path="/notifications/center" element={
        <ProtectedRoute>
          <NotificationCenterPage />
        </ProtectedRoute>
      } />
      <Route path="/maker/:id" element={
        <ProtectedRoute>
          <MakerDetail />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/subscription" element={
        <ProtectedRoute>
          <Subscription />
        </ProtectedRoute>
      } />
      <Route path="/subscription/success" element={
        <ProtectedRoute>
          <SubscriptionSuccess />
        </ProtectedRoute>
      } />
      <Route path="/subscription/cancel" element={
        <ProtectedRoute>
          <SubscriptionCancel />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute>
          <Admin />
        </ProtectedRoute>
      } />
    </Fragment>
  );
};
