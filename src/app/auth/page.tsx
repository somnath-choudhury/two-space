"use client";
import React, { useState } from "react";
import { auth } from "@/lib/firebase"; // Assuming your firebase config is here
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";

// --- For the Aesthetic ---
// We're re-using the Particles component from your landing page.
// If this component isn't available, the page will still work,
// but the particle background will be missing.
import Particles from "@/components/Particles"; 

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- Privacy Enhancement ---
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const router = useRouter();
  const logo = '/file.svg'; // Using the same logo as your landing page

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setIsLoading(true);

    // --- Security Enhancement: Client-side validation ---
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setIsError(true);
      setIsLoading(false);
      return;
    }

    // --- Privacy Enhancement: Check for terms agreement on sign-up ---
    if (!isLogin && !agreedToTerms) {
      setMessage("You must agree to the Terms and Privacy Policy to sign up.");
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("Logged in successfully! Redirecting...");
        setIsError(false);
        router.push('/discover');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("Account created! Redirecting to onboarding...");
        setIsError(false);
        router.push('/onboarding');
      }
      // Note: Firebase auth state listeners are the best practice
      // for handling redirects, but this direct push works for simplicity.

    } catch (error: any) {
      // --- Security Enhancement: User-friendly error messages ---
      setIsError(true);
      let friendlyMessage = "An unexpected error occurred. Please try again.";
      switch (error.code) {
        case 'auth/invalid-email':
          friendlyMessage = "Please enter a valid email address.";
          break;
        case 'auth/user-not-found':
          friendlyMessage = "No account found with this email. Please sign up.";
          break;
        case 'auth/wrong-password':
          friendlyMessage = "Incorrect password. Please try again.";
          break;
        case 'auth/email-already-in-use':
          friendlyMessage = "An account already exists with this email. Please login.";
          break;
        case 'auth/weak-password':
          friendlyMessage = "Password is too weak. Please use at least 6 characters.";
          break;
        default:
          console.error("Firebase Auth Error:", error.message);
      }
      setMessage(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950 via-gray-900 to-fuchsia-900 text-white p-4 overflow-hidden">
      
      {/* Aesthetic: Re-using the particle background */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Aesthetic: Minimal header for brand consistency */}
      <header className="absolute top-0 left-0 w-full z-10 flex justify-start items-center px-4 sm:px-8 py-5">
        <a href="/" className="flex-shrink-0" aria-label="Home">
          <img src={logo} alt="Stellar Logo" className="h-10 sm:h-12" />
        </a>
      </header>

      {/* Aesthetic: "Glassmorphism" auth card */}
      <div className="relative z-10 bg-black/30 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-full max-w-md border border-white/10">
        <h2 className="text-3xl font-bold text-center mb-6 text-white">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          {/* Privacy Enhancement: Terms & Conditions Checkbox */}
          {!isLogin && (
            <div className="flex items-start space-x-3 pt-2">
              <input
                type="checkbox"
                id="agree"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={isLoading}
                className="mt-1 h-4 w-4 rounded text-pink-500 bg-white/10 border-white/30 focus:ring-fuchsia-500"
              />
              <label htmlFor="agree" className="text-xs text-gray-300">
                I agree to the{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-white">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-white">
                  Privacy Policy
                </a>.
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? "Loading..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-300">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="font-medium text-pink-400 hover:text-pink-300 underline"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
              setIsError(false);
            }}
            disabled={isLoading}
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>

        {message && (
          <p className={`text-center text-sm mt-4 ${
              isError ? 'text-red-400' : 'text-green-400'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
