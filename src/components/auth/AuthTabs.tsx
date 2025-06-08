
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

interface AuthTabsProps {
  isLoading: boolean;
}

export const AuthTabs = ({ isLoading }: AuthTabsProps) => {
  const [currentView, setCurrentView] = useState<"auth" | "forgot">("auth");
  const [activeTab, setActiveTab] = useState("signin");

  if (currentView === "forgot") {
    return (
      <ForgotPasswordForm 
        onBack={() => setCurrentView("auth")} 
      />
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md mx-auto">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      
      <TabsContent value="signin" className="space-y-4">
        <SignInForm 
          isLoading={isLoading}
          onForgotPassword={() => setCurrentView("forgot")}
        />
      </TabsContent>
      
      <TabsContent value="signup" className="space-y-4">
        <SignUpForm isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  );
};
