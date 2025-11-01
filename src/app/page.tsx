"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase"; // Assuming your firebase config is here
import { onAuthStateChanged, signOut, User } from "firebase/auth";

// Import your existing components
import RotatingText from "@/components/RotatingText";
import TextType from "@/components/TextType";
import SplitText from "@/components/SplitText";
import PillNav from "@/components/PillNav";
import Particles from "@/components/Particles";

// A simple User icon for the profile dropdown
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
      clipRule="evenodd"
    />
  </svg>
);

export default function HomePage() {
  const logo = "/file.svg";
  const router = useRouter();

  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // --- Auth Listener Effect ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // --- Close dropdown on outside click ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuRef]);

  // --- Auth Actions ---
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsProfileMenuOpen(false);
      router.push("/auth"); // Redirect to login page after logout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // --- Dynamic Nav Items ---
  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
  ];

  if (user) {
    navItems.push({ label: "Profile", href: "/profile" });
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-indigo-950 via-gray-900 to-fuchsia-900 text-white flex flex-col">
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={["#ffffff", "#ffffff"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      <header className="relative z-10 flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-5 gap-4 sm:gap-0 w-full">
        <div className="flex-shrink-0">
          <img src={logo} alt="Company Logo" className="h-10 sm:h-12" />
        </div>

        {/* Wrapper for Nav and Auth links */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <nav className="flex w-full sm:w-auto justify-center sm:justify-end">
            <PillNav
              items={navItems}
              activeHref="/"
              className="custom-nav"
              ease="power2.easeOut"
              baseColor="transparent"
              pillColor="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500"
              hoveredPillTextColor="#ffffff"
              pillTextColor="#ffffff"
            />
          </nav>

          {/* Optional: Divider for larger screens */}
          <div className="hidden sm:block w-px h-6 bg-white/20 mx-2"></div>

          {/* --- DYNAMIC AUTH SECTION --- */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center h-10">
            {isLoadingAuth ? (
              // Auth Loading Skeleton
              <div className="w-24 h-8 bg-white/10 rounded-full animate-pulse"></div>
            ) : user ? (
              // --- Logged-in Profile Dropdown ---
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                >
                  <UserIcon />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-gray-900 border border-white/10 rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm text-gray-400">Signed in as</p>
                      <p className="text-sm font-medium text-white truncate">
                        {user.email}
                      </p>
                    </div>
                    <nav className="flex flex-col p-2">
                      <a
                        href="/profile"
                        className="px-3 py-2 rounded-md text-sm text-white hover:bg-white/10"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Profile
                      </a>
                      <a
                        href="/upgrade" // <-- Your new "Upgrade" link
                        className="px-3 py-2 rounded-md text-sm text-white hover:bg-white/10"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Upgrade Plan
                      </a>
                      <button
                        onClick={handleLogout}
                        className="px-3 py-2 rounded-md text-sm text-left text-rose-400 hover:bg-rose-500 hover:text-white"
                      >
                        Logout
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            ) : (
              // --- Logged-out Auth Links ---
              <>
                <a
                  href="/auth"
                  className="px-5 py-2 rounded-full text-sm font-medium text-white hover:bg-white/10 transition-colors"
                >
                  Login
                </a>
                <a
                  href="/auth"
                  className="px-5 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 text-white hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
          {/* --- END DYNAMIC AUTH SECTION --- */}
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center flex-grow text-center px-4 py-16 space-y-8">
        <SplitText
          text="Welcome to Two Space !"
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center"
          delay={100}
          duration={0.6}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
        />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-full text-center sm:text-left">
          <p className="text-2xl sm:text-3xl text-rose-100 font-semibold">
            A cozy digital space for couples to share
          </p>
          <TextType
            text={[
              "their daily lives",
              "their schedule",
              "what they are doing",
              "and many more...",
            ]}
            typingSpeed={55}
            pauseDuration={500}
            showCursor={true}
            cursorCharacter="|"
            className="text-2xl sm:text-3xl text-white font-medium"
          />
        </div>

        <div className="flex items-center justify-center bg-black/20 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-lg w-full max-w-md">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-white">
            <span className="text-rose-100">Create</span>
            <span className="bg-gradient-to-r from-pink-700 to-fuchsia-700 text-white px-4 sm:px-5 py-1 sm:py-2 rounded-2xl shadow-md inline-flex items-center justify-center overflow-hidden">
              <RotatingText
                texts={["memories 💕", "plans ✨", "stories 💫", "you & me 💞"]}
                mainClassName="inline-flex overflow-hidden leading-tight"
                staggerFrom="last"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                staggerDuration={0.05}
                splitLevelClassName="overflow-hidden"
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                  mass: 0.5,
                }}
                rotationInterval={2000}
              />
            </span>
          </h3>
        </div>
      </main>
    </div>
  );
} 
