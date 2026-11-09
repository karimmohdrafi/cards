
import { useState } from "react";
import { Spade, X, ArrowRight, Sparkles } from "lucide-react";

import Home from "./pages/Home";
import Game from "./pages/Game";
import "./App.css";
import "./styles/global.css";

function App() {
  const [showNameModal, setShowNameModal] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [activePlayer, setActivePlayer] = useState("");
  const [currentPage, setCurrentPage] = useState("home");

  const openNameModal = () => {
    setPlayerName("");
    setShowNameModal(true);
  };

  const startGame = (event) => {
    event.preventDefault();

    const name = playerName.trim();

    if (!name) return;

    localStorage.setItem("callbreakPlayerName", name);
    setActivePlayer(name);
    setShowNameModal(false);
    setCurrentPage("game");
  };

  const goHome = () => {
    setCurrentPage("home");
  };

  return (
    <>
      {currentPage === "home" ? (
        <Home onPlay={openNameModal} />
      ) : (
        <Game
          onBack={goHome}
          playerName={activePlayer}
        />
      )}

      {showNameModal && (
        <div
          className="card-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowNameModal(false);
            }
          }}
        >
          <div className="player-entry-modal">

            <button
              className="entry-close"
              onClick={() => setShowNameModal(false)}
              aria-label="Close"
            >
              <X size={19} />
            </button>

            <div className="entry-top-label">
              <Sparkles size={13} />
              YOUR SEAT IS WAITING
            </div>

            <div className="entry-card-symbol">
              <div className="entry-card-outline">
                <span className="entry-corner top">A ♠</span>
                <Spade size={48} fill="currentColor" />
                <span className="entry-corner bottom">A ♠</span>
              </div>
            </div>

            <div className="entry-heading">
              <span>WELCOME TO THE TABLE</span>
              <h2>What's your <em>name?</em></h2>
              <p>
                Choose your player name and take your seat.
                Your game begins here.
              </p>
            </div>

            <form onSubmit={startGame}>
              <label htmlFor="player-name">
                PLAYER NAME
              </label>

              <div className="entry-input-wrap">
                <Spade size={16} />
                <input
                  id="player-name"
                  type="text"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(event) =>
                    setPlayerName(event.target.value)
                  }
                  maxLength={18}
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="enter-game-button"
                disabled={!playerName.trim()}
              >
                <span>ENTER GAME</span>
                <ArrowRight size={19} />
              </button>
            </form>

            <div className="entry-bottom-note">
              ♠ &nbsp; FOUR PLAYERS · ONE WINNER &nbsp; ♠
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
