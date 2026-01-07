import { useState, useEffect, useCallback } from 'react'
import './Game.css'

function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function Game({ images, onGameOver }) {
  const [shuffledImages, setShuffledImages] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null) // { correct: bool, city: string }

  useEffect(() => {
    // Balance the images: equal from each coast
    const westImages = images.filter(img => img.coast === 'west')
    const eastImages = images.filter(img => img.coast === 'east')
    const minCount = Math.min(westImages.length, eastImages.length)

    const balanced = [
      ...shuffleArray(westImages).slice(0, minCount),
      ...shuffleArray(eastImages).slice(0, minCount)
    ]

    setShuffledImages(shuffleArray(balanced))
    setCurrentIndex(0)
    setScore(0)
  }, [images])

  const currentImage = shuffledImages[currentIndex]

  const handleGuess = useCallback((guess) => {
    if (!currentImage || feedback) return

    const isCorrect = currentImage.coast === guess

    if (isCorrect) {
      setFeedback({ correct: true, city: currentImage.city })
      setTimeout(() => {
        setScore(s => {
          const newScore = s + 1
          if (currentIndex + 1 >= shuffledImages.length) {
            onGameOver(newScore, null)
          }
          return newScore
        })
        setFeedback(null)

        if (currentIndex + 1 < shuffledImages.length) {
          setCurrentIndex(i => i + 1)
        }
      }, 1000)
    } else {
      setFeedback({ correct: false, city: currentImage.city })
      setTimeout(() => {
        setScore(s => {
          onGameOver(s, currentImage.city)
          return s
        })
      }, 1500)
    }
  }, [currentImage, currentIndex, feedback, onGameOver, score, shuffledImages.length])

  if (!currentImage) {
    return <div className="game-loading">Loading...</div>
  }

  return (
    <div className="game">
      <div className="score-bar">
        <span className="streak">Streak: {score}</span>
        <span className="remaining">{currentIndex + 1} / {shuffledImages.length}</span>
      </div>

      <div className="image-container">
        <img
          src={`/images/${currentImage.file}`}
          alt="Downtown area"
          className="city-image"
        />
        {feedback && (
          <div className={`feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
            <span className="feedback-icon">{feedback.correct ? '✓' : '✗'}</span>
            <span className="feedback-city">{feedback.city}</span>
          </div>
        )}
      </div>

      <div className="guess-buttons">
        <button
          className="guess-button west"
          onClick={() => handleGuess('west')}
          disabled={!!feedback}
        >
          West Coast
        </button>
        <button
          className="guess-button east"
          onClick={() => handleGuess('east')}
          disabled={!!feedback}
        >
          East Coast
        </button>
      </div>
    </div>
  )
}

export default Game
