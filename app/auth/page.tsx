import { AuthForm } from "@/components/auth/auth-form"
import { AuthDebug } from "@/components/auth/auth-debug"

export default function AuthPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <AuthForm />

      {/* Only show in development */}
      {process.env.NODE_ENV !== "production" && <AuthDebug />}
    </div>
  )
}
