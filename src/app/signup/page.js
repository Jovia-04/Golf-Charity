"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    // 🔐 Signup user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;

    if (!user) {
      alert("Signup failed");
      return;
    }

    // 🧾 Insert into users table (VERY IMPORTANT)
    const { error: insertError } = await supabase
      .from("users")
      .insert([
        {
          id: user.id,
          email: email,
          role: "user", // default role
        },
      ]);

    if (insertError) {
      alert(insertError.message);
      return;
    }

    alert("Signup successful!");

    // ✅ Redirect to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-3">
      <h1 className="text-2xl font-bold">Signup</h1>

      <input
        type="email"
        placeholder="Enter Email"
        className="border p-2 w-64"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Enter Password"
        className="border p-2 w-64"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSignup}
        className="px-4 py-2 bg-black text-white w-64"
      >
        Sign Up
      </button>

      {/* 👇 Login Redirect */}
      <p className="mt-4">
        Already have an account?{" "}
        <span
          onClick={() => router.push("/login")}
          className="text-blue-500 cursor-pointer"
        >
          Login
        </span>
      </p>
    </div>
  );
}