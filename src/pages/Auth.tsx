
import { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { SocialButtons } from '@/components/auth/SocialButtons';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  if (isResetMode) {
    return (
      <MainLayout
        seo={{
          title: "Reset Password | Create2Make",
          description: "Reset your password to access your account"
        }}
      >
        <div className="container flex items-center justify-center min-h-[calc(100vh-160px)] py-10 px-4">
          <Card className="w-full max-w-md shadow-lg glass-card">
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResetPasswordForm
                email={email}
                setEmail={setEmail}
                isLoading={isLoading}
                onBack={() => setIsResetMode(false)}
              />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      seo={{
        title: "Sign In | Create2Make",
        description: "Sign in to your account or create a new one"
      }}
    >
      <div className="container flex items-center justify-center min-h-[calc(100vh-160px)] py-10 px-4">
        <Card className="w-full max-w-md shadow-lg glass-card">
          <CardHeader>
            <CardTitle>Welcome to Create2Make</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to start creating amazing AI-generated designs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SocialButtons onPhoneAuth={() => {}} />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <SignInForm
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    isLoading={isLoading}
                    onForgotPassword={() => setIsResetMode(true)}
                  />
                </TabsContent>

                <TabsContent value="signup">
                  <SignUpForm
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    username={username}
                    setUsername={setUsername}
                    isLoading={isLoading}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Auth;
