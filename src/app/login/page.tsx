import { AuthForm } from "@/components/auth-form"

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-4 shadow-lg rounded-lg">
        <AuthForm />
      </div>
    </div>
  )
}

