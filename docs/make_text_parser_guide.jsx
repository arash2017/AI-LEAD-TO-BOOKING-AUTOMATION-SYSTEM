import { useState } from "react";

const steps = [
  {
    id: 1,
    title: "Open your Make.com Scenario",
    subtitle: "Navigate to the scenario that starts with your Gmail trigger",
    instruction: "Go to make.com → click Scenarios in the left sidebar → open your existing Gmail scenario (or create a new one).",
    tip: "If you don't have a scenario yet, click + Create a new scenario first.",
    screen: "scenario_list",
  },
  {
    id: 2,
    title: 'Click the "+" button after Gmail module',
    subtitle: "Add a new module right after the Gmail trigger",
    instruction: 'In the scenario canvas, hover between or after the Gmail trigger bubble. A small "+" circle appears. Click it to add a new module.',
    tip: "The + button only appears when you hover near the edge of an existing module.",
    screen: "add_module",
  },
  {
    id: 3,
    title: "Search for Tools → Text Parser",
    subtitle: "Find the Text Parser in the module search",
    instruction: 'In the module search popup, type "Text Parser" in the search bar. Click on the Tools category result, then select Text Parser.',
    tip: "You can also scroll down to find Tools manually in the list.",
    screen: "search_tools",
  },
  {
    id: 4,
    title: "Select Match Pattern",
    subtitle: "Choose the right action inside Text Parser",
    instruction: 'A list of Text Parser actions appears. Click "Match Pattern" — this lets you use regex to find specific text inside the email body.',
    tip: "Do not choose 'Replace' or 'HTML to Text' — you specifically need Match Pattern.",
    screen: "match_pattern",
  },
  {
    id: 5,
    title: "Set the Text field to the email body",
    subtitle: "Tell it which text to search through",
    instruction: 'In the "Text" field, click inside it and then click the blue variable icon (or type {{ to open the variable picker). Select 1. Text — this is the email body from your Gmail trigger.',
    tip: "The number \"1\" refers to module #1 (Gmail). If Gmail is a different number in your scenario, use that number instead.",
    screen: "set_text",
  },
  {
    id: 6,
    title: "Enter the Phone Number pattern",
    subtitle: "Extract the caller's phone number",
    instruction: 'In the "Pattern" field, paste this regex exactly:\n(?:Phone|Tel|Mobile)[:\\s]+([\\d\\s\\-\\(\\)\\+]{7,15})\n\nThen set "Global Match" toggle to ON.',
    tip: "This pattern finds text like \"Phone: 555-1234\" or \"Mobile: +1 (555) 000-0000\".",
    screen: "phone_pattern",
    isCode: true,
    code: "(?:Phone|Tel|Mobile)[:\\s]+([\\d\\s\\-\\(\\)\\+]{7,15})",
  },
  {
    id: 7,
    title: "Save — then add a second Text Parser for Name",
    subtitle: "Repeat steps 2–5 for each field",
    instruction: 'Click OK to save this module. Then add another Text Parser (Match Pattern) module after it. This time use the Name pattern in the Pattern field.',
    tip: "You need one Text Parser module per field (phone, name, email, service). Each one is separate.",
    screen: "name_pattern",
    isCode: true,
    code: "(?:Name|From)[:\\s]+([A-Za-z ]+)",
  },
  {
    id: 8,
    title: "Add Email pattern",
    subtitle: "Third Text Parser module",
    instruction: "Add another Text Parser → Match Pattern module. Use the email regex pattern below. This will capture any standard email address in the email body.",
    tip: "Email regex is universal — it doesn't depend on a label like \"Email:\" before it.",
    screen: "email_pattern",
    isCode: true,
    code: "([a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,})",
  },
  {
    id: 9,
    title: "Add Service pattern (optional)",
    subtitle: "Fourth Text Parser module",
    instruction: 'Add one more Text Parser → Match Pattern for the service type. Use the pattern below. This captures any text after "Service:" or "Type:" on that line.',
    tip: "Skip this if your leads don't include a service field. You can always add it later.",
    screen: "service_pattern",
    isCode: true,
    code: "(?:Service|Type)[:\\s]+(.+?)(?:\\n|$)",
  },
  {
    id: 10,
    title: "Add a Set Variables module",
    subtitle: "Store all parsed values into named variables",
    instruction: 'Add a Tools → Set Variable module after all your Text Parsers. Create 4 variables:\n• lead_name → map to Name parser output\n• lead_phone → map to Phone parser output\n• lead_email → map to Email parser output\n• lead_service → map to Service parser output',
    tip: "Click \"Add item\" inside the Set Variable module once for each variable. Use the variable picker to map each one.",
    screen: "set_variables",
  },
  {
    id: 11,
    title: "Run a test with a sample email",
    subtitle: "Verify everything is parsing correctly",
    instruction: 'Click "Run once" in the bottom-left corner of Make.com. Then manually apply the Leads-Inbound label to a test email in Gmail. Watch the scenario execute — click each module bubble to see what data was extracted.',
    tip: "If a field shows empty, the email format probably doesn't match the regex. Check the execution log and adjust the pattern label (e.g. \"Phone\" vs \"Tel\" vs \"Cell\").",
    screen: "test_run",
  },
];

const ScreenMock = ({ type, stepId }) => {
  const screens = {
    scenario_list: (
      <div style={{ fontFamily: "monospace" }}>
        <div style={{ background: "#1a1a2e", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, borderRadius: "6px 6px 0 0" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28ca41" }} />
          <span style={{ color: "#888", fontSize: 11, marginLeft: 8 }}>make.com — Scenarios</span>
        </div>
        <div style={{ display: "flex", background: "#f0f4ff", minHeight: 160 }}>
          <div style={{ width: 140, background: "#1e2d5a", padding: "12px 0" }}>
            {["Dashboard","Scenarios","Connections","Webhooks","Keys","Templates"].map(item => (
              <div key={item} style={{ padding: "7px 14px", color: item === "Scenarios" ? "#fff" : "#8899cc", fontSize: 11, background: item === "Scenarios" ? "#2d4a9e" : "transparent", cursor: "pointer" }}>{item}</div>
            ))}
          </div>
          <div style={{ flex: 1, padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: "bold", color: "#1e2d5a", marginBottom: 8 }}>MY SCENARIOS</div>
            {[
              { name: "Gmail Lead → AI Call", active: true, runs: "47 runs" },
              { name: "AI Booking → Sheets", active: true, runs: "44 runs" },
            ].map(s => (
              <div key={s.name} style={{ background: "#fff", border: "1.5px solid " + (s.active ? "#3b5bdb" : "#ddd"), borderRadius: 6, padding: "8px 12px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: "bold", color: "#1e2d5a" }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: "#666" }}>{s.runs}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.active ? "#22c55e" : "#ccc" }} />
              </div>
            ))}
            <div style={{ border: "1.5px dashed #3b5bdb", borderRadius: 6, padding: "8px 12px", textAlign: "center", color: "#3b5bdb", fontSize: 11, cursor: "pointer" }}>+ Create a new scenario</div>
          </div>
        </div>
      </div>
    ),

    add_module: (
      <div style={{ background: "#f0f4ff", padding: 16, borderRadius: 6, minHeight: 160, position: "relative" }}>
        <div style={{ fontSize: 10, color: "#666", marginBottom: 12, fontFamily: "monospace" }}>SCENARIO CANVAS</div>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <div style={{ background: "#fff", border: "2px solid #3b5bdb", borderRadius: "50%", width: 56, height: 56, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(59,91,219,0.15)" }}>
            <div style={{ fontSize: 16 }}>📧</div>
            <div style={{ fontSize: 8, color: "#3b5bdb", fontWeight: "bold" }}>GMAIL</div>
          </div>
          <div style={{ width: 24, height: 2, background: "#3b5bdb" }} />
          <div style={{ position: "relative" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#3b5bdb", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: "bold", cursor: "pointer", boxShadow: "0 0 0 4px rgba(59,91,219,0.2)", animation: "pulse 1.5s infinite" }}>+</div>
            <div style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)", background: "#1e2d5a", color: "#fff", fontSize: 9, padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap" }}>Click here!</div>
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{box-shadow:0 0 0 4px rgba(59,91,219,0.2)} 50%{box-shadow:0 0 0 8px rgba(59,91,219,0.35)} }`}</style>
      </div>
    ),

    search_tools: (
      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 12, minHeight: 160, fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 11, fontWeight: "bold", color: "#333", marginBottom: 8 }}>Add a module</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f5f7ff", border: "2px solid #3b5bdb", borderRadius: 6, padding: "6px 10px", marginBottom: 10 }}>
          <span style={{ fontSize: 12 }}>🔍</span>
          <span style={{ fontSize: 11, color: "#3b5bdb", fontWeight: "bold" }}>Text Parser</span>
          <span style={{ fontSize: 10, color: "#888", marginLeft: "auto" }}>← type this</span>
        </div>
        <div style={{ fontSize: 10, color: "#666", marginBottom: 6 }}>RESULTS</div>
        {[
          { icon: "🛠️", name: "Tools", sub: "Text Parser, Set Variable, Sleep…", highlight: true },
          { icon: "📄", name: "Text", sub: "Parse text, extract data…", highlight: false },
        ].map(r => (
          <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: r.highlight ? "#eff3ff" : "#fafafa", border: "1px solid " + (r.highlight ? "#3b5bdb" : "#eee"), borderRadius: 6, marginBottom: 5, cursor: "pointer" }}>
            <span style={{ fontSize: 18 }}>{r.icon}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: r.highlight ? "bold" : "normal", color: r.highlight ? "#3b5bdb" : "#333" }}>{r.name}</div>
              <div style={{ fontSize: 9, color: "#888" }}>{r.sub}</div>
            </div>
            {r.highlight && <div style={{ marginLeft: "auto", background: "#3b5bdb", color: "#fff", fontSize: 9, padding: "2px 6px", borderRadius: 4 }}>SELECT</div>}
          </div>
        ))}
      </div>
    ),

    match_pattern: (
      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 12, minHeight: 160, fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 11, fontWeight: "bold", color: "#333", marginBottom: 8 }}>Tools — Text Parser — Choose action</div>
        {[
          { name: "Match Pattern", desc: "Find text using regex", highlight: true },
          { name: "Replace", desc: "Find and replace text", highlight: false },
          { name: "HTML to Text", desc: "Strip HTML tags", highlight: false },
          { name: "Markdown to HTML", desc: "Convert markdown", highlight: false },
        ].map(a => (
          <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: a.highlight ? "#eff3ff" : "#fafafa", border: "1.5px solid " + (a.highlight ? "#3b5bdb" : "#eee"), borderRadius: 6, marginBottom: 5, cursor: "pointer" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.highlight ? "#3b5bdb" : "#ccc", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: a.highlight ? "bold" : "normal", color: a.highlight ? "#3b5bdb" : "#333" }}>{a.name}</div>
              <div style={{ fontSize: 9, color: "#888" }}>{a.desc}</div>
            </div>
            {a.highlight && <div style={{ marginLeft: "auto", fontSize: 14 }}>👈</div>}
          </div>
        ))}
      </div>
    ),

    set_text: (
      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 12, minHeight: 160, fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 11, fontWeight: "bold", color: "#333", marginBottom: 10 }}>Text Parser — Match Pattern — Configuration</div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>Text <span style={{ color: "#e53e3e" }}>*</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f5f7ff", border: "2px solid #3b5bdb", borderRadius: 6, padding: "7px 10px" }}>
            <div style={{ background: "#3b5bdb", color: "#fff", fontSize: 9, padding: "2px 6px", borderRadius: 4, fontWeight: "bold" }}>1. Text</div>
            <span style={{ fontSize: 10, color: "#3b5bdb" }}>(email body from Gmail)</span>
            <span style={{ marginLeft: "auto", fontSize: 12 }}>🔵</span>
          </div>
          <div style={{ fontSize: 9, color: "#888", marginTop: 3 }}>Click inside the field → click 🔵 variable icon → select "1. Text"</div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>Pattern <span style={{ color: "#e53e3e" }}>*</span></div>
          <div style={{ background: "#f9fafb", border: "1px solid #ddd", borderRadius: 6, padding: "7px 10px", fontFamily: "monospace", fontSize: 10, color: "#aaa" }}>
            (paste regex here — see next step)
          </div>
        </div>
      </div>
    ),

    phone_pattern: (
      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 12, minHeight: 160, fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 11, fontWeight: "bold", color: "#333", marginBottom: 10 }}>Text Parser — Phone Number</div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>Text</div>
          <div style={{ background: "#eff3ff", border: "1px solid #3b5bdb", borderRadius: 6, padding: "5px 10px", fontSize: 10 }}>
            <span style={{ background: "#3b5bdb", color: "#fff", padding: "1px 6px", borderRadius: 4, fontSize: 9 }}>1. Text</span>
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>Pattern <span style={{ color: "#e53e3e" }}>*</span></div>
          <div style={{ background: "#fffbeb", border: "2px solid #f59e0b", borderRadius: 6, padding: "6px 10px", fontFamily: "monospace", fontSize: 9, color: "#333", wordBreak: "break-all" }}>
            (?:Phone|Tel|Mobile)[:\s]+([\\d\\s\\-\\(\\)\\+]{"{7,15}"})
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 10, color: "#555" }}>Global Match</div>
          <div style={{ width: 32, height: 16, background: "#22c55e", borderRadius: 8, position: "relative" }}>
            <div style={{ width: 12, height: 12, background: "#fff", borderRadius: "50%", position: "absolute", right: 2, top: 2 }} />
          </div>
          <span style={{ fontSize: 9, color: "#22c55e", fontWeight: "bold" }}>ON ✓</span>
        </div>
      </div>
    ),

    name_pattern: (
      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 12, minHeight: 160, fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 11, fontWeight: "bold", color: "#333", marginBottom: 10 }}>Text Parser — Name (2nd module)</div>
        <div style={{ fontSize: 9, color: "#666", marginBottom: 8, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 5, padding: "5px 8px" }}>
          ✓ Phone module already saved — now add a SECOND Text Parser module
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>Pattern</div>
          <div style={{ background: "#fffbeb", border: "2px solid #f59e0b", borderRadius: 6, padding: "6px 10px", fontFamily: "monospace", fontSize: 9, color: "#333" }}>
            (?:Name|From)[:\s]+([A-Za-z ]+)
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          {["Module 1\nGmail", "Module 2\nPhone", "Module 3\nName ←"].map((m, i) => (
            <div key={i} style={{ flex: 1, background: i === 2 ? "#eff3ff" : "#f9fafb", border: "1px solid " + (i === 2 ? "#3b5bdb" : "#ddd"), borderRadius: 5, padding: "5px", textAlign: "center", fontSize: 8, color: i === 2 ? "#3b5bdb" : "#666", fontWeight: i === 2 ? "bold" : "normal", whiteSpace: "pre-line" }}>{m}</div>
          ))}
        </div>
      </div>
    ),

    email_pattern: (
      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 12, minHeight: 160, fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 11, fontWeight: "bold", color: "#333", marginBottom: 10 }}>Text Parser — Email (3rd module)</div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>Pattern</div>
          <div style={{ background: "#fffbeb", border: "2px solid #f59e0b", borderRadius: 6, padding: "6px 10px", fontFamily: "monospace", fontSize: 9, color: "#333", wordBreak: "break-all" }}>
            ([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{"{2,}"})
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
          {["Gmail", "Phone", "Name", "Email ←"].map((m, i) => (
            <div key={i} style={{ flex: 1, background: i === 3 ? "#eff3ff" : "#f9fafb", border: "1px solid " + (i === 3 ? "#3b5bdb" : "#ddd"), borderRadius: 5, padding: "4px", textAlign: "center", fontSize: 8, color: i === 3 ? "#3b5bdb" : "#666", fontWeight: i === 3 ? "bold" : "normal" }}>{m}</div>
          ))}
        </div>
      </div>
    ),

    service_pattern: (
      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 12, minHeight: 160, fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 11, fontWeight: "bold", color: "#333", marginBottom: 10 }}>Text Parser — Service (4th module, optional)</div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>Pattern</div>
          <div style={{ background: "#fffbeb", border: "2px solid #f59e0b", borderRadius: 6, padding: "6px 10px", fontFamily: "monospace", fontSize: 9, color: "#333" }}>
            (?:Service|Type)[:\s]+(.+?)(?:\n|$)
          </div>
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 8 }}>
          {["Gmail", "Phone", "Name", "Email", "Service ←"].map((m, i) => (
            <div key={i} style={{ flex: 1, background: i === 4 ? "#eff3ff" : "#f9fafb", border: "1px solid " + (i === 4 ? "#3b5bdb" : "#ddd"), borderRadius: 4, padding: "4px 2px", textAlign: "center", fontSize: 7.5, color: i === 4 ? "#3b5bdb" : "#666", fontWeight: i === 4 ? "bold" : "normal" }}>{m}</div>
          ))}
        </div>
      </div>
    ),

    set_variables: (
      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 12, minHeight: 160, fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 11, fontWeight: "bold", color: "#333", marginBottom: 8 }}>Tools — Set Variable — Configuration</div>
        {[
          { var: "lead_phone", from: "Phone Parser → $1" },
          { var: "lead_name", from: "Name Parser → $1" },
          { var: "lead_email", from: "Email Parser → $1" },
          { var: "lead_service", from: "Service Parser → $1" },
        ].map((v, i) => (
          <div key={v.var} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, background: "#f9fafb", border: "1px solid #eee", borderRadius: 5, padding: "5px 8px" }}>
            <div style={{ fontSize: 9, background: "#1e2d5a", color: "#fff", padding: "2px 6px", borderRadius: 3, fontFamily: "monospace" }}>{v.var}</div>
            <div style={{ fontSize: 10, color: "#888" }}>→</div>
            <div style={{ fontSize: 9, color: "#3b5bdb", fontFamily: "monospace" }}>{v.from}</div>
          </div>
        ))}
        <div style={{ fontSize: 9, color: "#888", marginTop: 6 }}>Click "+ Add item" to add each variable</div>
      </div>
    ),

    test_run: (
      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 12, minHeight: 160, fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 11, fontWeight: "bold", color: "#333", marginBottom: 8 }}>Execution Log — Test Run</div>
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, padding: "8px 10px", marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "#16a34a", fontWeight: "bold" }}>✓ Scenario completed successfully</div>
          <div style={{ fontSize: 9, color: "#666", marginTop: 2 }}>4 modules ran · 0 errors · 1.2s</div>
        </div>
        {[
          { mod: "1. Gmail", status: "ok", data: "Email received, body extracted" },
          { mod: "2. Text Parser (Phone)", status: "ok", data: '+1 (555) 012-3456' },
          { mod: "3. Text Parser (Name)", status: "ok", data: 'Jane Smith' },
          { mod: "4. Text Parser (Email)", status: "ok", data: 'jane@example.com' },
        ].map(m => (
          <div key={m.mod} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontSize: 9 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
            <div style={{ color: "#333", fontWeight: "bold", minWidth: 140 }}>{m.mod}</div>
            <div style={{ color: "#3b5bdb", fontFamily: "monospace" }}>{m.data}</div>
          </div>
        ))}
      </div>
    ),
  };

  return (
    <div style={{ borderRadius: 8, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.12)", border: "1px solid #e0e7ff" }}>
      {screens[type] || <div style={{ padding: 20, background: "#f9fafb", color: "#999", fontSize: 12 }}>Screen preview</div>}
    </div>
  );
};

export default function App() {
  const [activeStep, setActiveStep] = useState(1);
  const current = steps.find(s => s.id === activeStep);

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "linear-gradient(135deg, #f0f4ff 0%, #fafbff 100%)", minHeight: "100vh", padding: "24px 16px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1e2d5a", color: "#fff", padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: "bold", marginBottom: 10, letterSpacing: 1 }}>
            🛠️ MAKE.COM · TEXT PARSER SETUP
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, color: "#1e2d5a" }}>
            How to Set Up Text Parser (Regex)
          </h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>Step-by-step visual guide · {steps.length} steps total</p>
        </div>

        {/* Progress bar */}
        <div style={{ background: "#e2e8f0", borderRadius: 99, height: 6, marginBottom: 24, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg, #3b5bdb, #60a5fa)", borderRadius: 99, width: `${(activeStep / steps.length) * 100}%`, transition: "width 0.4s ease" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>

          {/* Sidebar steps */}
          <div>
            {steps.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                style={{
                  width: "100%", textAlign: "left", display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "9px 12px", marginBottom: 4, borderRadius: 8, border: "none", cursor: "pointer",
                  background: s.id === activeStep ? "#1e2d5a" : s.id < activeStep ? "#eff3ff" : "#fff",
                  boxShadow: s.id === activeStep ? "0 2px 10px rgba(30,45,90,0.18)" : "none",
                  transition: "all 0.2s"
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  background: s.id === activeStep ? "#3b5bdb" : s.id < activeStep ? "#22c55e" : "#e2e8f0",
                  fontSize: 10, fontWeight: "bold",
                  color: s.id === activeStep || s.id < activeStep ? "#fff" : "#64748b"
                }}>
                  {s.id < activeStep ? "✓" : s.id}
                </div>
                <div style={{ fontSize: 11, fontWeight: s.id === activeStep ? 700 : 500, color: s.id === activeStep ? "#fff" : s.id < activeStep ? "#3b5bdb" : "#475569", lineHeight: 1.3 }}>
                  {s.title}
                </div>
              </button>
            ))}
          </div>

          {/* Main content */}
          <div>
            <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div style={{ background: "#1e2d5a", color: "#fff", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 13 }}>{current.id}</div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#1e2d5a" }}>{current.title}</h2>
              </div>
              <p style={{ margin: "0 0 14px 38px", fontSize: 12, color: "#64748b" }}>{current.subtitle}</p>

              {/* Screen mock */}
              <div style={{ marginBottom: 16 }}>
                <ScreenMock type={current.screen} stepId={current.id} />
              </div>

              {/* Instruction */}
              <div style={{ background: "#f8faff", border: "1.5px solid #c7d7ff", borderRadius: 8, padding: "12px 14px", marginBottom: current.isCode ? 12 : 0 }}>
                <div style={{ fontSize: 11, fontWeight: "bold", color: "#3b5bdb", marginBottom: 5 }}>📋 WHAT TO DO</div>
                <p style={{ margin: 0, fontSize: 12, color: "#1e2d5a", lineHeight: 1.6, whiteSpace: "pre-line" }}>{current.instruction}</p>
              </div>

              {/* Code block */}
              {current.isCode && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: "bold", color: "#92400e", marginBottom: 4 }}>📌 COPY THIS REGEX PATTERN EXACTLY:</div>
                  <div style={{ background: "#1e2d5a", borderRadius: 8, padding: "10px 14px", fontFamily: "monospace", fontSize: 11, color: "#60a5fa", wordBreak: "break-all", userSelect: "all", letterSpacing: 0.3 }}>
                    {current.code}
                  </div>
                  <div style={{ fontSize: 9, color: "#888", marginTop: 4 }}>Click the code above to select all, then copy and paste into the Pattern field in Make.com</div>
                </div>
              )}
            </div>

            {/* Tip box */}
            {current.tip && (
              <div style={{ background: "#fffbeb", border: "1.5px solid #fbbf24", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: "bold", color: "#92400e", marginBottom: 4 }}>💡 TIP</div>
                <p style={{ margin: 0, fontSize: 12, color: "#78350f", lineHeight: 1.5 }}>{current.tip}</p>
              </div>
            )}

            {/* Nav buttons */}
            <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
              <button
                onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                disabled={activeStep === 1}
                style={{ padding: "10px 20px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 13, fontWeight: 600, cursor: activeStep === 1 ? "not-allowed" : "pointer", opacity: activeStep === 1 ? 0.4 : 1 }}
              >
                ← Previous
              </button>
              <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center" }}>
                Step {activeStep} of {steps.length}
              </div>
              {activeStep < steps.length ? (
                <button
                  onClick={() => setActiveStep(Math.min(steps.length, activeStep + 1))}
                  style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#1e2d5a", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(30,45,90,0.2)" }}
                >
                  Next Step →
                </button>
              ) : (
                <div style={{ padding: "10px 20px", borderRadius: 8, background: "#22c55e", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                  ✓ All Done!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
