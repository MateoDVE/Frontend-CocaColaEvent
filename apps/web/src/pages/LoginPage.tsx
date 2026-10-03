import { BrandLogo } from "../shared/ui/BrandLogo";
import { uiText } from "../shared/i18n";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ScanLine,
  Activity,
  AudioLines,
  ChartNoAxesCombined,
  Lock,
  Mail,
  Server,
} from "lucide-react";
import { useState } from "react";
import { useSession } from "../shared/session";
import { Button } from "../shared/ui";
import { es } from "../shared/i18n";
import { demoEventId } from "../shared/demo";
import { apiRequest } from "../shared/api";

export default function LoginPage() {
  const session = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@cocacola.test");
  const [password, setPassword] = useState("CocaCola2026!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest<{
        accessToken: string;
        refreshToken: string;
        admin: {
          id: string;
          email: string;
          fullName: string;
          role: string;
        };
      }>("/auth/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      session.setAdminSession(res.accessToken, res.admin);
      navigate(`/admin/events/${demoEventId}/live`);
    } catch {
      // Fallback: If backend is not available, start local admin demo
      session.startAdmin();
      navigate(`/admin/events/${demoEventId}/live`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <BrandLogo variant="white" />
        <div className="story-body">
          <h1>{es.login.title}</h1>
          <p>{es.login.subtitle}</p>
          <div className="story-icons">
            <Activity />
            <span />
            <AudioLines />
            <span />
            <ChartNoAxesCombined />
          </div>
        </div>
        <span className="story-footer">{uiText.loginPage2}</span>
        <svg className="brand-wave" viewBox="0 0 800 260" aria-hidden="true">
          <path d="M-40 190C190-80 380 400 850 10" />
        </svg>
      </section>
      <section className="login-form">
        <span className="demo-chip" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Server size={14} /> Backend Conectado
        </span>
        <div className="login-heading">
          <span className="app-symbol">
            <Activity size={27} />
          </span>
          <h2>{es.login.heading}</h2>
          <p>{es.login.body}</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {error && <p style={{ color: "var(--color-error)", fontSize: 13 }}>{error}</p>}
          <div style={{ position: "relative" }}>
            <Mail size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#888" }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email administrativo"
              required
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 14,
              }}
            />
          </div>
          <div style={{ position: "relative" }}>
            <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#888" }} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 14,
              }}
            />
          </div>

          <Button
            type="submit"
            className="w-full justify-between"
            disabled={loading}
          >
            {loading ? "Conectando..." : "Ingresar con Backend"}
            <ArrowRight size={19} />
          </Button>
        </form>

        <Button variant="secondary" className="w-full" asChild>
          <Link to="/staff/login">
            <ScanLine size={18} />
            {es.login.staff}
          </Link>
        </Button>
        <p className="login-note">{es.login.note}</p>
        <div className="login-foot">
          {es.app}
          <span>{uiText.loginPage3}</span>
        </div>
      </section>
    </main>
  );
}
