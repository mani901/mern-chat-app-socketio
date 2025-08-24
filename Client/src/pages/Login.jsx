import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLogin } from "@/hooks/useLogin";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import ErrorDisplay from "@/components/auth/ErrorDisplay";
import LoginForm from "@/components/auth/LoginForm";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [urlError, setUrlError] = useState("");
  const { mutate: loginAPI, isPending, error } = useLogin();
  const { handleGoogleLogin } = useGoogleAuth();

  // Check for error messages in URL params (from Google auth)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setUrlError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const getErrorMessage = () => {
    if (urlError) return urlError;
    if (!error) return null;
    return error.response?.data?.message || error.message || "Login failed";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorDisplay error={getErrorMessage()} />

          <LoginForm onSubmit={loginAPI} isPending={isPending} />

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <GoogleAuthButton onClick={handleGoogleLogin} disabled={isPending} />
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
