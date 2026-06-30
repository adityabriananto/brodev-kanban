import { useState } from "react";

const API_URL = "http://localhost:3000/api";

export default function AuthForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan Password wajib diisi");
      return;
    }

    setLoading(true);
    setError("");

    fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal login");
      }
      return data;
    })
    .then(user => {
      onLogin(user);
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
  };

  return (
    <div className="profile-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div style={{
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        padding: "2.5rem",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h1 style={{ textAlign: "center", marginTop: 0, color: "#2d3748" }}>Brodev Kanban</h1>
        <p style={{ textAlign: "center", color: "#718096", marginBottom: "2rem" }}>Silakan login untuk melanjutkan</p>
        
        {error && (
          <div style={{ background: "#fed7d7", color: "#c53030", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#4a5568", fontWeight: "bold" }}>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}
              placeholder="nama@rumah.com"
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#4a5568", fontWeight: "bold" }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ marginTop: "1rem", padding: "0.75rem", width: "100%", fontSize: "1rem" }}
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
