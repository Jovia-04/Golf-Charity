"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center mt-20 gap-4">
      <h1 className="text-2xl font-bold">
        Golf Charity Platform
      </h1>

      <p>Play. Win. Give Back.</p>

      <button
        onClick={() => router.push("/signup")}
        className="px-4 py-2 bg-black text-white"
      >
        Subscribe Now
      </button>
    </div>
  );
}