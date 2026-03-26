"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [score, setScore] = useState("");
  const [scores, setScores] = useState([]);

  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState("");

  const [draw, setDraw] = useState(null);

  const [winnings, setWinnings] = useState([]);

  // 🔄 Fetch scores
  const fetchScores = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (!error) setScores(data);
  };

  // 🔄 Fetch charities
  const fetchCharities = async () => {
    const { data, error } = await supabase.from("charity").select("*");
    if (!error) setCharities(data);
  };

  // 💾 Save selected charity
  const saveCharity = async () => {
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      alert("Not logged in");
      return;
    }

    const { error } = await supabase
    .from("users")
    .upsert({
      id: user.id,
      email: user.email, // ✅ ADD THIS
      charity_id: selectedCharity,
    });

  if (error) {
    alert(error.message);
  } else {
    alert("Charity selected!");
  }
};

  // 💳 Subscription
  const subscribe = async (plan) => {
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      alert("Not logged in");
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
      plan: plan,
      status: "active",
      renewal_date: renewalDate,
    });

    if (error) {
      alert(error.message);
    } else {
      alert(`Subscribed to ${plan} plan`);
    }
  };

  // ➕ Add score (with 5-score logic)
  const addScore = async () => {
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      alert("Not logged in");
      return;
    }

    if (score < 1 || score > 45) {
  alert("Score must be between 1 and 45");
  return;
     }

    const { data: existingScores } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    if (existingScores.length >= 5) {
      await supabase
        .from("scores")
        .delete()
        .eq("id", existingScores[0].id);
    }

    await supabase.from("scores").insert([
      {
        user_id: user.id,
        score: parseInt(score),
        date: new Date(),
      },
    ]);

    setScore("");
    fetchScores();
  };

  // 🎲 Match logic
  const checkMatches = (drawNumbers, userScores) => {
    const drawSet = drawNumbers.map(Number);
    let matchCount = 0;

    userScores.forEach((s) => {
      if (drawSet.includes(s.score)) {
        matchCount++;
      }
    });

    return matchCount;
  };

  // 🔄 Fetch latest draw
  const fetchDraw = async () => {
    const { data } = await supabase
      .from("draw")
      .select("*")
      .order("id", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setDraw(data[0]);
    }
  };

  //SHOW WINNINGS IN DASHBOARD

  const fetchWinnings = async () => {
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) return;

  const { data } = await supabase
    .from("winners")
    .select("*")
    .eq("user_id", user.id);

  setWinnings(data || []);
};

  // 🔁 Load data
  useEffect(() => {
  fetchScores();
  fetchCharities();
  fetchDraw();
  fetchWinnings();
}, []);

return (
  <div className="flex flex-col items-center mt-10 gap-4">
    <h1 className="text-2xl font-bold">Dashboard</h1>

    {/* Score Input */}
    <input
      type="number"
      placeholder="Enter score (1-45)"
      className="border p-2"
      value={score}
      onChange={(e) => setScore(e.target.value)}
    />

    <button
      onClick={addScore}
      className="px-4 py-2 bg-black text-white"
    >
      Add Score
    </button>

    {/* Score List */}
    <div className="mt-6 w-full max-w-md">
      <h2 className="text-xl font-semibold mb-2">Your Scores</h2>

      {scores.length === 0 ? (
        <p>No scores yet</p>
      ) : (
        <ul className="border p-3 rounded">
          {scores.map((s) => (
            <li key={s.id} className="flex justify-between border-b py-1">
              <span>Score: {s.score}</span>
              <span>{new Date(s.date).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>

    {/* Charity Section */}
    <div className="mt-6 w-full max-w-md">
      <h2 className="text-xl font-semibold mb-2">Select Charity</h2>

      <select
        className="border p-2 w-full"
        value={selectedCharity}
        onChange={(e) => setSelectedCharity(e.target.value)}
      >
        <option value="">Choose charity</option>

        {charities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <button
        onClick={saveCharity}
        className="mt-3 px-4 py-2 bg-black text-white"
      >
        Save Charity
      </button>
    </div>

    {/* Subscription Section */}
    <div className="mt-6 w-full max-w-md">
      <h2 className="text-xl font-semibold mb-2">Subscription</h2>

      <button
        onClick={() => subscribe("monthly")}
        className="px-4 py-2 bg-green-600 text-white mr-2"
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

    {/* Draw Result */}
    {draw && (
      <div className="mt-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Latest Draw</h2>

        <p>Numbers: {draw.numbers}</p>

        <p>
          Matches: {checkMatches(draw.numbers.split(","), scores)}
        </p>
      </div>
    )}

    {/* ✅ FIXED: Winnings INSIDE main div */}
    <div className="mt-6 w-full max-w-md">
      <h2 className="text-xl font-semibold mb-2">
        Your Winnings
      </h2>

      {winnings.length === 0 ? (
        <p>No winnings yet</p>
      ) : (
        winnings.map((w) => (
          <div key={w.id} className="border p-2 mb-2">
            <p>Matches: {w.match_count}</p>
            <p>Prize: ₹{w.prize}</p>
            <p>Status: {w.status}</p>
          </div>
        ))
      )}
    </div>

  </div>
);
}