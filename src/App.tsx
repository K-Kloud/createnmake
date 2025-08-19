
import "./App.css";
import { AppProviders } from "@/providers/AppProviders";
import { AppRoutes } from "@/routes/AppRoutes";

function App() {
  console.log('🎯 [APP] App component rendering...');
  
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;
