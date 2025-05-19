"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "./auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Register form state
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerFullName, setRegisterFullName] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")

  const { signIn, signUp } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setAuthError(null)

    try {
      await signIn(loginEmail, loginPassword)
      router.push("/")
      toast({
        title: "Success",
        description: "You have been logged in",
      })
    } catch (error: any) {
      console.error("Login error:", error)
      setAuthError(error.message || "Failed to login")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setAuthError(null)

    // Basic validation
    if (registerPassword !== registerConfirmPassword) {
      setAuthError("Passwords don't match")
      setIsLoading(false)
      return
    }

    if (registerPassword.length < 6) {
      setAuthError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      await signUp(registerEmail, registerPassword, registerFullName)

      // In development/preview, we'll automatically sign in the user
      try {
        await signIn(registerEmail, registerPassword)
        router.push("/")
        toast({
          title: "Success",
          description: "Registration successful! You are now logged in.",
        })
      } catch (signInError) {
        toast({
          title: "Registration Successful",
          description: "Please check your email for verification or try logging in.",
        })
        setIsLogin(true)
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      setAuthError(error.message || "Failed to register")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
    setAuthError(null)
    // Reset form fields
    setLoginEmail("")
    setLoginPassword("")
    setRegisterEmail("")
    setRegisterFullName("")
    setRegisterPassword("")
    setRegisterConfirmPassword("")
  }

  return (
    <div className="mx-auto max-w-md space-y-6 p-6 bg-card rounded-lg border shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{isLogin ? "Login" : "Create an Account"}</h1>
        <p className="text-muted-foreground">
          {isLogin ? "Enter your credentials to access your account" : "Fill in the form below to create your account"}
        </p>
      </div>

      {authError && (
        <Alert variant="destructive">
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}

      {isLogin ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="your@email.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              placeholder="your@email.com"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-fullname">Full Name</Label>
            <Input
              id="register-fullname"
              type="text"
              placeholder="John Doe"
              value={registerFullName}
              onChange={(e) => setRegisterFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              type="password"
              placeholder="••••••••"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-confirm-password">Confirm Password</Label>
            <Input
              id="register-confirm-password"
              type="password"
              placeholder="••••••••"
              value={registerConfirmPassword}
              onChange={(e) => setRegisterConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Register
          </Button>
        </form>
      )}

      <div className="text-center">
        <Button variant="link" className="text-sm" onClick={toggleAuthMode} disabled={isLoading}>
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </Button>
      </div>
    </div>
  )
}
