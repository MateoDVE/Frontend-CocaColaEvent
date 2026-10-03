import { BrandLogo } from "../shared/ui/BrandLogo";
import { uiText } from "../shared/i18n";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ScanLine,
  Activity,
  AudioLines,
  ChartNoAxesCombined,
} from "lucide-react";
import { useSession } from "../shared/session";
import { Button } from "../shared/ui";
import { es } from "../shared/i18n";
import { demoEventId } from "../shared/demo";
export default function LoginPage() {
  const start = useSession((s) => s.startAdmin);
  const navigate = useNavigate();
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
        <span className="demo-chip">{es.demo}</span>
        <div className="login-heading">
          <span className="app-symbol">
            <Activity size={27} />
          </span>
          <h2>{es.login.heading}</h2>
          <p>{es.login.body}</p>
        </div>
        <Button
          className="w-full justify-between"
          onClick={() => {
            start();
            navigate(`/admin/events/${demoEventId}/live`);
          }}
        >
          {es.login.demo}
          <ArrowRight size={19} />
        </Button>
        <Button variant="secondary" className="w-full mt-3" asChild>
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
