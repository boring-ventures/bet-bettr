"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient();

  const createOrGetUser = async (supabaseUserId: string, userEmail: string) => {
    try {
      // First try to get the existing user
      const response = await fetch('/api/users/get-or-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: supabaseUserId,
          email: userEmail,
          name: userEmail.split('@')[0], // Using email prefix as default name
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create/get user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in createOrGetUser:', error);
      throw error;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user record in the database
        const { error: dbError } = await supabase.from("User").insert({
          id: authData.user.id,
          email: authData.user.email,
          name: email.split("@")[0], // Using email prefix as name
          role: "user",
          organizationId: process.env.NEXT_PUBLIC_DEFAULT_ORG_ID!, // Make sure to set this in your .env
          active: true,
        });

        if (dbError) throw dbError;
      }

      toast({
        title: "Success",
        description: "Check your email for the confirmation link",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unknown error occurred",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Create or get Prisma user record after successful authentication
      if (data.user) {
        await createOrGetUser(data.user.id, data.user.email!);
      }

      router.refresh(); // Refresh the current route
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <div className="space-x-2">
        <Button type="button" onClick={handleSignUp} disabled={loading}>
          Sign Up
        </Button>
        <Button type="submit" onClick={handleSignIn} disabled={loading}>
          Sign In
        </Button>
      </div>
    </form>
  );
}

