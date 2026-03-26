"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Subscribe() {
  const router = useRouter();

  const subscribe = async (plan) => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      alert("Please login first");
      router.push("/login");
      return;
    }

    const renewalDate = new Date();

    if (plan === "monthly") {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }

    const { error } = await supabase.from("subscriptions").upsert({
      user_id: user.id,
      plan,
      status: "active",
      renewal_date: renewalDate,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Subscribed successfully!");
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex flex-col items-center mt-20 gap-4">
      <h1 className="text-2xl font-bold">
        Choose Your Plan
      </h1>

      <button
        onClick={() => subscribe("monthly")}
        className="px-4 py-2 bg-green-600 text-white"
      >
        Monthly Plan
      </button>

      <button
        onClick={() => subscribe("yearly")}
        className="px-4 py-2 bg-blue-600 text-white"
      >
        Yearly Plan
      </button>
    </div>
  );
}
