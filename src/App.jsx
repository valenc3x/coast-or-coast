import { useState, useEffect } from 'react'
import Game from './components/Game'
import StartScreen from './components/StartScreen'
import GameOver from './components/GameOver'
import './App.css'

function App() {
  const [gameState, setGameState] = useState('start') // 'start' | 'playing' | 'gameover'
  const [images, setImages] = useState([])
  const [score, setScore] = useState(0)
  const [lastCity, setLastCity] = useState(null)

  useEffect(() => {
    fetch('/images.json')
      .then(res => res.json())
      .then(data => setImages(data.images))
      .catch(err => console.error('Failed to load images:', err))
  }, [])

  const startGame = () => {
    setScore(0)
    setLastCity(null)
    setGameState('playing')
  }

  const handleGameOver = (finalScore, city) => {
    setScore(finalScore)
    setLastCity(city)
    setGameState('gameover')
  }

  const hasImages = images.length > 0

  return (
    <div className="app">
      <header className="header">
        <h1>Coast or Coast?</h1>
      </header>
      <main className="main">
        {gameState === 'start' && (
          <StartScreen onStart={startGame} hasImages={hasImages} />
        )}
        {gameState === 'playing' && (
          <Game images={images} onGameOver={handleGameOver} />
        )}
        {gameState === 'gameover' && (
          <GameOver score={score} lastCity={lastCity} onRestart={startGame} />
        )}
      </main>
    </div>
  )
}

export default App
