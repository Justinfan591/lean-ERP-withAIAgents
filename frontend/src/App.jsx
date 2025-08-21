import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000"; // change to your deployed URL later

export default function App() {
  const [health, setHealth] = useState(null);
  const [db, setDb] = useState(null);

  useEffect(() => {
    fetch(`${API}/health`).then(r => r.json()).then(setHealth).catch(e => setHealth({ error: String(e) }));
    fetch(`${API}/db/ping`).then(r => r.json()).then(setDb).catch(e => setDb({ error: String(e) }));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>Lean ERP — Backend Smoke Test</h1>
      <section>
        <h2>/health</h2>
        <pre>{JSON.stringify(health, null, 2)}</pre>
      </section>
      <section>
        <h2>/db/ping</h2>
        <pre>{JSON.stringify(db, null, 2)}</pre>
      </section>
    </main>
  );
}
