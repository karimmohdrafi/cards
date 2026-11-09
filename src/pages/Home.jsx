
import { ArrowUpRight, Spade } from "lucide-react";
import "../styles/home.css";

function Home({ onPlay }) {
  return (
    <main className="new-home">
      <div className="home-noise" />

      <header className="minimal-brand">
        <div className="brand-icon">
          <Spade size={29} fill="currentColor" />
        </div>
        <div>
          <h2>CALL<span>BREAK</span></h2>
          <p>THE GAME OF STRATEGY</p>
        </div>
      </header>

      <div className="edition-label">
        <span className="edition-dot" />
        THE PRIVATE CARD ROOM
      </div>

      <section className="hero-stage">
        <div className="hero-copy">
          <p className="hero-kicker">FOUR SEATS. ONE LEGEND.</p>

          <h1>
            PLAY
            <br />
            <span className="outline-word">YOUR</span>
            <br />
            <em>HAND.</em>
          </h1>

          <p className="hero-subtitle">
            Every card has a purpose.
            <br />
            Every move changes everything.
          </p>

          <button className="start-game-btn" onClick={onPlay}>
            <span>START PLAYING</span>
            <ArrowUpRight size={22} />
          </button>

          <p className="hero-footnote">
            <span /> NO ACCOUNT. JUST SKILL.
          </p>
        </div>

        <div className="card-stage">
          <div className="card-aura" />

          <div className="floating-suit suit-one">♠</div>
          <div className="floating-suit suit-two">♦</div>

          <div className="showcase-card card-back">
            <div className="card-back-inner">
              <span>♠</span>
              <div className="back-pattern">✦</div>
              <span>♠</span>
            </div>
          </div>

          <div className="showcase-card card-left">
            <div className="showcase-corner">
              <strong>A</strong>
              <span>♠</span>
            </div>
            <div className="showcase-center black-card">♠</div>
            <div className="showcase-bottom">A ♠</div>
          </div>

          <div className="showcase-card card-right">
            <div className="showcase-corner red-card">
              <strong>Q</strong>
              <span>♥</span>
            </div>
            <div className="showcase-center red-card">♥</div>
            <div className="showcase-bottom red-card">Q ♥</div>
          </div>

          <div className="showcase-card card-main">
            <div className="showcase-corner red-card">
              <strong>K</strong>
              <span>♦</span>
            </div>
            <div className="showcase-center red-card">♦</div>
            <div className="showcase-bottom red-card">K ♦</div>
          </div>

          <div className="card-caption">
            <span>01</span>
            THE DECK IS IN YOUR HAND
          </div>
        </div>
      </section>

      <div className="corner-mark">CB / 01</div>
    </main>
  );
}

export default Home;
