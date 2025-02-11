import { AuthForm } from "@/components/auth-form"

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-4 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center">Sports Betting Performance Tracker</h1>
        <AuthForm />
      </div>
    </div>
  )
}

