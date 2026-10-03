import { es } from "../i18n";

export function BrandLogo({ variant = "red" }: { variant?: "red" | "white" }) {
  const white = variant === "white";
  return (
    <img
      className="brand-logo"
      src={white ? "/CocacolaLogoRojo.png" : "/cocacolaLogoBlanco.png"}
      alt={es.brand}
      width={white ? 1376 : 738}
      height={white ? 532 : 231}
    />
  );
}
