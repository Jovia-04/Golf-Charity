"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState([]);

  // 🔄 Fetch Winners
  const fetchWinners = async () => {
    const { data, error } = await supabase
      .from("winners")
      .select("*")
      .order("id", { ascending: false });

    if (!error) setWinners(data);
  };

  // 🔐 Check Admin Role
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (data?.role === "admin") {
        setIsAdmin(true);
        fetchWinners(); // ✅ load winners only for admin
      }

      setLoading(false);
    };

    checkAdmin();
  }, []);

  // 🎲 Generate Draw
  const generateDraw = async () => {
    const numbers = Array.from({ length: 5 }, () =>
      Math.floor(Math.random() * 45) + 1
    );

    const month = new Date().toLocaleString("default", {
      month: "long",
    });

    const { error } = await supabase.from("draw").insert([
      {
        month,
        numbers: numbers.join(","),
        status: "published",
      },
    ]);

    if (error) alert(error.message);
    else alert("Draw generated!");
  };

  // 🏆 Calculate Winners
  const calculateWinners = async () => {
    const { data: drawData } = await supabase
      .from("draw")
      .select("*")
      .order("id", { ascending: false })
      .limit(1);

    if (!drawData || drawData.length === 0) {
      alert("No draw found");
      return;
    }

    const draw = drawData[0];
    const drawNumbers = draw.numbers.split(",").map(Number);

    const { data: scores } = await supabase.from("scores").select("*");

    const userScoresMap = {};

    scores.forEach((s) => {
      if (!userScoresMap[s.user_id]) {
        userScoresMap[s.user_id] = [];
      }
      userScoresMap[s.user_id].push(s.score);
    });

    for (const userId in userScoresMap) {
      const userScores = userScoresMap[userId];

      let matchCount = 0;

      userScores.forEach((score) => {
        if (drawNumbers.includes(score)) {
          matchCount++;
        }
      });

      if (matchCount >= 3) {
        // 🚫 Prevent duplicate winners
        const { data: existing } = await supabase
          .from("winners")
          .select("*")
          .eq("user_id", userId)
          .eq("draw_id", draw.id);

        if (existing && existing.length > 0) continue;

        let prize = 0;

        if (matchCount === 5) prize = 1000;
        else if (matchCount === 4) prize = 500;
        else if (matchCount === 3) prize = 200;

        await supabase.from("winners").insert([
          {
            user_id: userId,
            draw_id: draw.id,
            match_count: matchCount,
            prize,
            status: "pending",
          },
        ]);
      }
    }

    alert("Winners calculated!");
    fetchWinners(); // 🔄 refresh UI
  };

  // 💰 Mark as Paid
  const markAsPaid = async (id) => {
    const { error } = await supabase
      .from("winners")
      .update({ status: "paid" })
      .eq("id", id);

    if (!error) {
      alert("Marked as paid");
      fetchWinners();
    }
  };

  // 🔄 UI States
  if (loading) return <p>Loading...</p>;

  if (!isAdmin) {
    return <p className="text-red-500">Access denied</p>;
  }

  // ✅ Admin UI
  return (
    <div className="flex flex-col items-center mt-10 gap-4">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      <button
        onClick={generateDraw}
        className="px-4 py-2 bg-purple-600 text-white"
      >
        Generate Monthly Draw
      </button>

      <button
        onClick={calculateWinners}
        className="px-4 py-2 bg-red-600 text-white"
      >
        Calculate Winners
      </button>

      {/* Winners List */}
      <div className="mt-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Winners List</h2>

        {winners.length === 0 ? (
          <p>No winners yet</p>
        ) : (
          winners.map((w) => (
            <div key={w.id} className="border p-3 mb-2 rounded">
              <p>User ID: {w.user_id}</p>
              <p>Matches: {w.match_count}</p>
              <p>Prize: ₹{w.prize}</p>
              <p>Status: {w.status}</p>

              {w.status !== "paid" && (
                <button
                  onClick={() => markAsPaid(w.id)}
                  className="mt-2 px-3 py-1 bg-green-600 text-white"
                >
                  Mark as Paid
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}