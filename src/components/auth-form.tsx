"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}

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
          emailRedirectTo: `https://bet-bettr.vercel.app/auth/callback`,
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
    <Card className="w-full max-w-md mx-auto bg-card relative">
      {loading && <LoadingSpinner />}
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-card-foreground">
          Welcome to Bet Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-muted text-foreground border-input focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-muted text-foreground border-input focus:ring-ring"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              Sign Up
            </Button>
            <Button
              type="submit"
              onClick={handleSignIn}
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sign In
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

