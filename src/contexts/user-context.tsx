"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User as AuthUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type DatabaseUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type UserContextType = {
  authUser: AuthUser | null;
  dbUser: DatabaseUser | null;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({
  authUser: null,
  dbUser: null,
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setLoading(false);
          return;
        }

        setAuthUser(session.user);

        // Get database user
        const { data: dbUserData, error: dbError } = await supabase
          .from("User")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (dbError) {
          console.error("Error fetching database user:", dbError);
          return;
        }

        setDbUser(dbUserData);
      } catch (error) {
        console.error("Error in auth state change:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setAuthUser(null);
        setDbUser(null);
        router.push("/login");
        return;
      }

      if (session?.user) {
        setAuthUser(session.user);
        const { data } = await supabase
          .from("User")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setDbUser(data);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <UserContext.Provider value={{ authUser, dbUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
