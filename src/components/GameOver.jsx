import './GameOver.css'

function GameOver({ score, lastCity, onRestart }) {
  const getMessage = () => {
    if (lastCity === null) {
      return "You got them all!"
    }
    if (score === 0) {
      return "Better luck next time!"
    }
    if (score < 5) {
      return "Not bad!"
    }
    if (score < 10) {
      return "Nice streak!"
    }
    return "Impressive!"
  }

  return (
    <div className="game-over">
      <h2>Game Over</h2>
      <div className="final-score">
        <span className="score-number">{score}</span>
        <span className="score-label">correct in a row</span>
      </div>
      {lastCity && (
        <p className="last-city">
          That was <strong>{lastCity}</strong>
        </p>
      )}
      <p className="message">{getMessage()}</p>
      <button className="restart-button" onClick={onRestart}>
        Play Again
      </button>
    </div>
  )
}

export default GameOver
