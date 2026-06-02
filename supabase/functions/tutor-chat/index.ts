import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SYSTEM_PROMPTS: Record<string, string> = {
  pt: "Você é o MedLearn AI Tutor, um tutor especialista em medicina para estudantes brasileiros. Responda SEMPRE em português do Brasil, com clareza didática, citando referências quando útil, usando markdown (títulos, listas, negrito). Seja preciso, evite invenções e indique quando não souber.",
  en: "You are MedLearn AI Tutor, a medical study tutor. Always reply in English. Be clear and didactic, use markdown (headings, lists, bold). Be precise, avoid hallucinations and say when you don't know.",
  es: "Eres MedLearn AI Tutor, un tutor de estudios médicos. Responde SIEMPRE en español. Sé claro y didáctico, usa markdown (títulos, listas, negrita). Sé preciso, evita inventar y di cuando no sepas.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const { threadId, message, language } = body as {
      threadId?: string;
      message?: string;
      language?: string;
    };

    if (!threadId || !message || typeof message !== "string" || !message.trim()) {
      return new Response(JSON.stringify({ error: "Invalid body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lang = (language === "en" || language === "es" ? language : "pt") as "pt" | "en" | "es";

    // Verify thread ownership
    const { data: thread, error: threadErr } = await supabase
      .from("chat_threads")
      .select("id, user_id, title")
      .eq("id", threadId)
      .maybeSingle();
    if (threadErr || !thread || thread.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Thread not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save user message
    const { error: insUserErr } = await supabase.from("chat_messages").insert({
      thread_id: threadId,
      user_id: userId,
      role: "user",
      content: message.trim(),
    });
    if (insUserErr) throw new Error(`Save user message failed: ${insUserErr.message}`);

    // Load history (latest 30)
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true })
      .limit(30);

    const contents = (history ?? []).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const geminiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
      apiKey;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPTS[lang] }] },
        contents,
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(
        JSON.stringify({ error: "Gemini error", status: geminiRes.status, details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const geminiJson = await geminiRes.json();
    const reply: string =
      geminiJson?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ??
      "";

    if (!reply.trim()) {
      return new Response(JSON.stringify({ error: "Empty reply from Gemini" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save assistant message
    await supabase.from("chat_messages").insert({
      thread_id: threadId,
      user_id: userId,
      role: "assistant",
      content: reply,
    });

    // Auto-title thread on first exchange
    if (thread.title === "Nova conversa" || thread.title === "New chat" || thread.title === "Nuevo chat") {
      const newTitle = message.trim().slice(0, 60);
      await supabase.from("chat_threads").update({ title: newTitle, language: lang }).eq("id", threadId);
    } else {
      await supabase.from("chat_threads").update({ language: lang, updated_at: new Date().toISOString() }).eq("id", threadId);
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
