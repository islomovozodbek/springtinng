"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    let isMounted = true;
    let fetchPromise = null;
    let lastFetchedUserId = null;

    // Fetch profile from Supabase and merge with session user
    const fetchProfile = async (sessionUser) => {
      // Prevent redundant fetches for the same user in quick succession
      if (lastFetchedUserId === sessionUser.id) return;
      
      console.log("🔥 fetchProfile starting for user:", sessionUser.id, sessionUser.email);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionUser.id)
          .single();

        if (!isMounted) return;

        if (error && error.code !== "PGRST116") {
          console.error("🔥 Error fetching profile:", error.message || error, JSON.stringify(error));
        } else {
          console.log("🔥 fetchProfile found data:", !!data, "error code:", error?.code);
        }

        if (data) {
          lastFetchedUserId = sessionUser.id;
          setUser({
            uid: sessionUser.id,
            email: sessionUser.email,
            username: data.username,
            displayName: data.display_name,
            bio: data.bio,
            needsOnboarding: data.bio === "PENDING_ONBOARDING",
            photoURL: data.photo_url,
            tier: data.tier || "basic",
            totalStories: data.total_stories || 0,
            totalWords: data.total_words || 0,
            totalUpvotesReceived: data.total_upvotes_received || 0,
            sprintsToday: data.sprints_today || 0,
            currentStreak: data.current_streak || 0,
            longestStreak: data.longest_streak || 0,
            aura: data.aura || 0,
            level: data.level || 1,
            isOG: data.is_og || false,
            followersCount: data.followers_count || 0,
            followingCount: data.following_count || 0,
            referralCode: data.referral_code,
            referralCount: data.referral_count || 0,

            profileColor: data.profile_color || "derby",
            netScore: data.net_score || 0,
            earnedAchievements: data.earned_achievements || [],
            lastDailyDate: data.last_daily_date,
            createdAt: data.created_at,
          });
        } else if (error && error.code === "PGRST116") {
          // If no profile exists (e.g., first time Google Login), create one automatically
          const baseName = sessionUser.user_metadata?.full_name?.replace(/\s+/g, "").toLowerCase() || sessionUser.email.split("@")[0];
          const newUsername = baseName + Math.floor(Math.random() * 1000);
          
          const newProfile = {
            id: sessionUser.id,
            username: newUsername,
            display_name: sessionUser.user_metadata?.full_name || sessionUser.email.split("@")[0],
            photo_url: sessionUser.user_metadata?.avatar_url || null,
            bio: "PENDING_ONBOARDING",
            tier: "basic",
            total_stories: 0,
            total_words: 0,
            total_upvotes_received: 0,
            sprints_today: 0,
            current_streak: 0,
            longest_streak: 0,
            aura: 0,
            level: 1,
            is_og: false,
            followers_count: 0,
            following_count: 0,
            referral_code: newUsername.toUpperCase().slice(0, 6) + Math.floor(Math.random() * 100),
            referral_count: 0,

            profile_color: "derby",
            net_score: 0,
            earned_achievements: [],
            last_daily_date: null,
          };
          
          console.log("🔥 No profile found. Creating new profile for:", newUsername);
          
          const { error: insertError } = await supabase.from("profiles").insert(newProfile);
          if (insertError) {
             if (insertError.code === "23505") {
               console.log("🔥 Profile insert raced against another thread. Yielding.");
               return; // The other thread already created it, let it set the user state!
             }
             console.error("🔥 Profile insert failed:", insertError.message || insertError);
             throw insertError;
          }
          console.log("🔥 Profile created successfully.");
          
          if (!isMounted) return;
          lastFetchedUserId = sessionUser.id;
          
          // Set user after creation
          setUser({
            uid: sessionUser.id,
            email: sessionUser.email,
            username: newProfile.username,
            displayName: newProfile.display_name,
            bio: newProfile.bio,
            needsOnboarding: true,
            photoURL: newProfile.photo_url,
            tier: "basic",
            totalStories: 0,
            totalWords: 0,
            totalUpvotesReceived: 0,
            sprintsToday: 0,
            currentStreak: 0,
            longestStreak: 0,
            aura: 0,
            level: 1,
            isOG: false,
            followersCount: 0,
            followingCount: 0,
            referralCode: newProfile.referral_code,
            referralCount: 0,

            profileColor: "derby",
            netScore: 0,
            earnedAchievements: [],
            lastDailyDate: null,
          });
        }
      } catch (err) {
        console.error("🔥 Error in fetchProfile overall:", err.message || err);
        if (isMounted) {
          setUser({
            uid: sessionUser.id,
            email: sessionUser.email,
            tier: "basic",
          });
        }
      }
    };

    // Check current session on mount
    const initSession = async () => {
      console.log("🔥 initSession started...");
      try {
        const {
          data: { session },
          error
        } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        console.log("🔥 initSession got session:", !!session, "error:", error?.message);

        if (session?.user) {
          if (!fetchPromise) fetchPromise = fetchProfile(session.user);
          await fetchPromise;
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("🔥 Error getting initial session:", err.message || err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initSession();

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      console.log("🔥 onAuthStateChange event firing:", event, "session present:", !!session);
      
      // Specifically avoid refetching on INITIAL_SESSION if we already handled it
      if (event === 'INITIAL_SESSION' && fetchPromise) {
        return;
      }
      
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        lastFetchedUserId = null;
        setUser(null);
      }
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (emailOrUsername, password) => {
    let emailToUse = emailOrUsername;

    // If it's not an email, assume it's a username and try to resolve it
    if (!emailOrUsername.includes("@")) {
      console.log("Resolving username to email:", emailOrUsername);
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", emailOrUsername)
        .single();
      
      if (error || !data) {
        throw new Error("Invalid username or password");
      }
      
      // Now fetch the actual user email using an admin function, or we can just try to see if auth exposes it.
      // Wait, public users don't have access to other users' emails for security.
      // Since we don't have a secure edge function to resolve username -> email,
      // and we can't expose emails in profiles, Supabase only allows login via email natively.
      // Let's inform the user properly, or better yet, if we can't do username resolution securely here, 
      // we must enforce email login unless we expose email in `profiles` (which is bad practice).
      throw new Error("Please log in with your email address. Username login requires additional backend setup.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const register = async ({ username, email, password }) => {
    // 1. Create auth user (which fires the DB trigger to create the profile)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          full_name: username,
        }
      }
    });
    if (authError) throw authError;

    const supabaseUser = authData.user;
    
    // Check for duplicate email (Supabase returns empty identities array if email exists and enumeration protection is on)
    if (supabaseUser?.identities?.length === 0) {
      throw new Error("already registered");
    }
    
    if (!authData.session) {
      // Supabase is configured with "Confirm Email" ON.
      throw new Error("CONFIRMATION_REQUIRED");
    }

    // 2. Fetch the newly created profile (race condition safe: fallback to defaults if DB trigger hasn't finished yet)
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", supabaseUser.id)
      .single();

    setUser({
      uid: supabaseUser.id,
      email: supabaseUser.email,
      username: profileData?.username || username.toLowerCase(),
      displayName: profileData?.display_name || username,
      bio: profileData?.bio || null,
      needsOnboarding: false, // Standard registration handles username
      photoURL: profileData?.photo_url || null,
      tier: profileData?.tier || "basic",
      totalStories: profileData?.total_stories || 0,
      totalWords: profileData?.total_words || 0,
      totalUpvotesReceived: profileData?.total_upvotes_received || 0,
      sprintsToday: profileData?.sprints_today || 0,
      currentStreak: profileData?.current_streak || 0,
      longestStreak: profileData?.longest_streak || 0,
      aura: profileData?.aura || 0,
      level: profileData?.level || 1,
      isOG: profileData?.is_og || false,
      followersCount: profileData?.followers_count || 0,
      followingCount: profileData?.following_count || 0,
      referralCode: profileData?.referral_code || "",
      referralCount: profileData?.referral_count || 0,

      profileColor: profileData?.profile_color || "derby",
      netScore: profileData?.net_score || 0,
      earnedAchievements: profileData?.earned_achievements || [],
      lastDailyDate: profileData?.last_daily_date || null,
    });

    return supabaseUser;
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : "",
      },
    });
    if (error) throw error;
  };

  const updateLocalUser = (updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, loginWithGoogle, updateLocalUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
