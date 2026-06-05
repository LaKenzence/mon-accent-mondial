import { useState, useEffect } from "react";

const TEAMS = [
  { code: "FR", name: "France", flag: "🇫🇷", color: "#002395", accent: "#ED2939", players: ["Mbappé", "Griezmann", "Camavinga"] },
  { code: "BR", name: "Brésil", flag: "🇧🇷", color: "#009C3B", accent: "#FFDF00", players: ["Vinicius Jr", "Rodrygo", "Endrick"] },
  { code: "AR", name: "Argentine", flag: "🇦🇷", color: "#74ACDF", accent: "#F6B40E", players: ["Messi", "Di María", "Álvarez"] },
  { code: "ES", name: "Espagne", flag: "🇪🇸", color: "#AA151B", accent: "#F1BF00", players: ["Yamal", "Pedri", "Morata"] },
  { code: "DE", name: "Allemagne", flag: "🇩🇪", color: "#000000", accent: "#DD0000", players: ["Musiala", "Wirtz", "Havertz"] },
  { code: "PT", name: "Portugal", flag: "🇵🇹", color: "#006600", accent: "#FF0000", players: ["Ronaldo", "B. Fernandes", "Rafael Leão"] },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", color: "#008751", accent: "#FFFFFF", players: ["Osimhen", "Lookman", "Iheanacho"] },
  { code: "JP", name: "Japon", flag: "🇯🇵", color: "#BC002D", accent: "#FFFFFF", players: ["Minamino", "Doan", "Mitoma"] },
  { code: "MX", name: "Mexique", flag: "🇲🇽", color: "#006847", accent: "#CE1126", players: ["Raúl Jiménez", "Antuna", "Lozano"] },
  { code: "MA", name: "Maroc", flag: "🇲🇦", color: "#C1272D", accent: "#006233", players: ["Hakimi", "En-Nesyri", "Ounahi"] },
  { code: "SN", name: "Sénégal", flag: "🇸🇳", color: "#00853F", accent: "#FDEF42", players: ["Mané", "Diatta", "Dia"] },
  { code: "US", name: "États-Unis", flag: "🇺🇸", color: "#002868", accent: "#BF0A30", players: ["Pulisic", "Reyna", "McKennie"] },
];

const MATCH_MOMENTS = [
  "un but en fin de match",
  "un penalty raté",
  "une remontée spectaculaire",
  "un arrêt impossible du gardien",
  "une erreur d'arbitrage",
  "un but contre son camp",
  "une frappe de 30 mètres",
  "une sortie de blessure dramatique",
];

const getRandomMoment = () => MATCH_MOMENTS[Math.floor(Math.random() * MATCH_MOMENTS.length)];

const TeamCard = ({ team, selected, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: selected
        ? `linear-gradient(135deg, ${team.color}, ${team.accent})`
        : "rgba(255,255,255,0.06)",
      border: selected ? `2px solid ${team.accent}` : "2px solid rgba(255,255,255,0.1)",
      borderRadius: "12px",
      padding: "12px 10px",
      cursor: "pointer",
      transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
      transform: selected ? "scale(1.08)" : "scale(1)",
      color: selected ? "#fff" : "rgba(255,255,255,0.7)",
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: "13px",
      fontWeight: 700,
      letterSpacing: "0.04em",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
      boxShadow: selected ? `0 8px 24px ${team.color}66` : "none",
      textTransform: "uppercase",
    }}
  >
    <span style={{ fontSize: "26px" }}>{team.flag}</span>
    <span>{team.name}</span>
  </button>
);

const TypewriterText = ({ text, speed = 18 }) => {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setDisplayed("");
    setIdx(0);
  }, [text]);

  useEffect(() => {
    if (idx < text.length) {
      const t = setTimeout(() => {
        setDisplayed((p) => p + text[idx]);
        setIdx((i) => i + 1);
      }, speed);
      return () => clearTimeout(t);
    }
  }, [idx, text, speed]);

  return (
    <span>
      {displayed}
      {idx < text.length && (
        <span style={{ opacity: Math.sin(Date.now() / 200) > 0 ? 1 : 0, transition: "opacity 0.1s" }}>▌</span>
      )}
    </span>
  );
};

export default function App() {
  const [team1, setTeam1] = useState(null);
  const [team2, setTeam2] = useState(null);
  const [step, setStep] = useState("pick1"); // pick1 | pick2 | result
  const [anecdote, setAnecdote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [moment, setMoment] = useState("");
  const [activeTab, setActiveTab] = useState("team1");

  const handlePick1 = (team) => {
    setTeam1(team);
    setTeam2(null);
    setStep("pick2");
    setAnecdote("");
  };

  const handlePick2 = async (team) => {
    if (team.code === team1.code) return;
    setTeam2(team);
    setStep("result");
    setLoading(true);
    setError(null);
    setAnecdote("");
    const m = getRandomMoment();
    setMoment(m);

    const prompt = `Tu es un commentateur de football passionné qui parle avec l'accent et le style argotique du pays "${team1.name}". 
    
Raconte en 3-4 phrases courtes et vivantes une anecdote imaginaire sur le moment suivant dans un match fictif entre ${team1.name} et ${team2.name} à la Coupe du Monde 2026 : "${m}".

Implique un des joueurs vedettes de ${team1.name} (${team1.players.join(", ")}) ou de ${team2.name} (${team2.players.join(", ")}).

Utilise :
- Des expressions typiques du pays ${team1.name} (argot local, interjections, tournures de phrase spécifiques)
- Beaucoup d'émotion et d'exagération dramatique
- Des références culturelles locales si pertinent
- Écris en français mais avec le style et l'accent local fortement marqué

Ne mets pas de titre ni d'introduction. Commence directement par l'anecdote.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map((b) => b.text || "").join("") || "";
      setAnecdote(text.trim());
    } catch (e) {
      setError("Connexion perdue… le commentateur est parti fêter un but 😅");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("pick1");
    setTeam1(null);
    setTeam2(null);
    setAnecdote("");
    setError(null);
  };

  const regenerate = async () => {
    if (!team1 || !team2) return;
    setLoading(true);
    setAnecdote("");
    setError(null);
    const m = getRandomMoment();
    setMoment(m);

    const prompt = `Tu es un commentateur de football passionné qui parle avec l'accent et le style argotique du pays "${team1.name}". 
    
Raconte en 3-4 phrases courtes et vivantes une anecdote imaginaire sur le moment suivant dans un match fictif entre ${team1.name} et ${team2.name} à la Coupe du Monde 2026 : "${m}".

Implique un des joueurs vedettes de ${team1.name} (${team1.players.join(", ")}) ou de ${team2.name} (${team2.players.join(", ")}).

Utilise :
- Des expressions typiques du pays ${team1.name} (argot local, interjections, tournures de phrase spécifiques)
- Beaucoup d'émotion et d'exagération dramatique
- Des références culturelles locales si pertinent
- Écris en français mais avec le style et l'accent local fortement marqué

Ne mets pas de titre ni d'introduction. Commence directement par l'anecdote.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map((b) => b.text || "").join("") || "";
      setAnecdote(text.trim());
    } catch (e) {
      setError("Connexion perdue… le commentateur est parti fêter un but 😅");
    } finally {
      setLoading(false);
    }
  };

  const switchAccent = async () => {
    if (!team1 || !team2) return;
    const newTeam1 = team2;
    const newTeam2 = team1;
    setTeam1(newTeam1);
    setTeam2(newTeam2);
    setLoading(true);
    setAnecdote("");
    setError(null);
    const m = getRandomMoment();
    setMoment(m);

    const prompt = `Tu es un commentateur de football passionné qui parle avec l'accent et le style argotique du pays "${newTeam1.name}". 
    
Raconte en 3-4 phrases courtes et vivantes une anecdote imaginaire sur le moment suivant dans un match fictif entre ${newTeam1.name} et ${newTeam2.name} à la Coupe du Monde 2026 : "${m}".

Implique un des joueurs vedettes de ${newTeam1.name} (${newTeam1.players.join(", ")}) ou de ${newTeam2.name} (${newTeam2.players.join(", ")}).

Utilise :
- Des expressions typiques du pays ${newTeam1.name} (argot local, interjections, tournures de phrase spécifiques)
- Beaucoup d'émotion et d'exagération dramatique
- Des références culturelles locales si pertinent
- Écris en français mais avec le style et l'accent local fortement marqué

Ne mets pas de titre ni d'introduction. Commence directement par l'anecdote.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map((b) => b.text || "").join("") || "";
      setAnecdote(text.trim());
    } catch (e) {
      setError("Connexion perdue…");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:ital,wght@0,400;0,500;1,400;1,600&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
          background: #0a0a0f;
          min-height: 100vh;
        }

        .grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.5;
        }

        .app {
          position: relative; z-index: 1;
          min-height: 100vh;
          display: flex; flex-direction: column; align-items: center;
          padding: 24px 16px 48px;
          font-family: 'Barlow', sans-serif;
        }

        .header {
          text-align: center;
          margin-bottom: 32px;
        }

        .header-eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 8px;
        }

        .header-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(36px, 8vw, 58px);
          font-weight: 900;
          line-height: 0.95;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          color: #fff;
        }

        .header-title span {
          display: block;
          background: linear-gradient(90deg, #FFD700, #FF6B35);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-sub {
          margin-top: 10px;
          font-size: 14px;
          color: rgba(255,255,255,0.45);
          font-style: italic;
        }

        .step-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 14px;
          text-align: center;
        }

        .step-label em {
          color: #FFD700;
          font-style: normal;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          width: 100%;
          max-width: 460px;
          margin-bottom: 24px;
        }

        @media (max-width: 380px) {
          .grid { grid-template-columns: repeat(3, 1fr); }
        }

        .vs-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          width: 100%;
          max-width: 460px;
        }

        .vs-team {
          flex: 1;
          background: rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 12px;
          text-align: center;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 2px solid transparent;
          transition: all 0.3s;
        }

        .vs-team.active {
          border-color: rgba(255,215,0,0.4);
          background: rgba(255,215,0,0.07);
          color: #fff;
        }

        .vs-team .flag { font-size: 22px; display: block; margin-bottom: 4px; }

        .vs-sep {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: 22px;
          color: rgba(255,255,255,0.2);
          flex-shrink: 0;
        }

        .result-card {
          width: 100%;
          max-width: 460px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 16px;
        }

        .moment-badge {
          display: inline-block;
          background: linear-gradient(90deg, #FFD700, #FF6B35);
          color: #000;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 20px;
          margin-bottom: 16px;
        }

        .commentator-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .commentator-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }

        .anecdote-text {
          font-size: 16px;
          line-height: 1.65;
          color: rgba(255,255,255,0.88);
          font-style: italic;
          min-height: 80px;
        }

        .loading-dots {
          display: flex; gap: 6px; align-items: center; padding: 8px 0;
        }

        .dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #FFD700;
          animation: bounce 1.2s infinite ease-in-out;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; background: #FF6B35; }
        .dot:nth-child(3) { animation-delay: 0.4s; background: #FF3B6B; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }

        .actions {
          display: flex; gap: 8px; flex-wrap: wrap;
          width: 100%; max-width: 460px;
        }

        .btn {
          flex: 1;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: none;
          border-radius: 10px;
          padding: 12px 8px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn:active { transform: scale(0.97); }

        .btn-primary {
          background: linear-gradient(135deg, #FFD700, #FF6B35);
          color: #000;
        }

        .btn-secondary {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.12);
        }

        .btn-accent {
          background: rgba(255,107,53,0.15);
          color: #FF6B35;
          border: 1px solid rgba(255,107,53,0.25);
        }

        .pill-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,215,0,0.08);
          border: 1px solid rgba(255,215,0,0.2);
          color: #FFD700;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 20px;
          margin-bottom: 8px;
        }

        .world-cup-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .wc-line {
          height: 1px;
          flex: 1;
          max-width: 60px;
          background: linear-gradient(90deg, transparent, rgba(255,215,0,0.3));
        }

        .wc-line.right {
          background: linear-gradient(90deg, rgba(255,215,0,0.3), transparent);
        }

        .wc-text {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(255,215,0,0.5);
        }

        .fade-in {
          animation: fadeIn 0.4s ease forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="grain" />

      <div className="app">
        <div className="header">
          <div className="header-eyebrow">⚽ FIFA World Cup 2026</div>
          <h1 className="header-title">
            Mon<br /><span>Accent</span><br />Mondial
          </h1>
          <p className="header-sub">Le même match, 12 accents différents</p>
        </div>

        {/* VS Bar always shown when team1 picked */}
        {team1 && (
          <div className="vs-bar fade-in">
            <div className={`vs-team ${team1 ? "active" : ""}`}>
              <span className="flag">{team1.flag}</span>
              {team1.name}
            </div>
            <div className="vs-sep">VS</div>
            <div className={`vs-team ${team2 ? "active" : ""}`}>
              {team2 ? (
                <>
                  <span className="flag">{team2.flag}</span>
                  {team2.name}
                </>
              ) : (
                <>
                  <span className="flag">🏟️</span>
                  Adversaire
                </>
              )}
            </div>
          </div>
        )}

        {/* Step labels */}
        {step === "pick1" && (
          <p className="step-label">Choisis l'équipe <em>dont tu veux l'accent</em></p>
        )}
        {step === "pick2" && (
          <p className="step-label">Choisis <em>l'adversaire</em></p>
        )}

        {/* Team grid */}
        {(step === "pick1" || step === "pick2") && (
          <div className="grid fade-in">
            {TEAMS.map((team) => (
              <TeamCard
                key={team.code}
                team={team}
                selected={
                  (step === "pick1" && team1?.code === team.code) ||
                  (step === "pick2" && team2?.code === team.code)
                }
                onClick={() => {
                  if (step === "pick1") handlePick1(team);
                  else handlePick2(team);
                }}
              />
            ))}
          </div>
        )}

        {/* Result */}
        {step === "result" && (
          <d
