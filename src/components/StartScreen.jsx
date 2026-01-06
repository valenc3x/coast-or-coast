import './StartScreen.css'

function StartScreen({ onStart, hasImages }) {
  return (
    <div className="start-screen">
      <div className="start-content">
        <h2>Guess the Coast!</h2>
        <p className="description">
          Can you tell if a downtown photo is from the West Coast or East Coast?
        </p>
        <p className="rules">
          Keep your streak alive! One wrong guess and it's game over.
        </p>
        {hasImages ? (
          <button className="start-button" onClick={onStart}>
            Play
          </button>
        ) : (
          <p className="no-images">
            No images loaded. Add images to <code>public/images/</code> and update <code>images.json</code>
          </p>
        )}
      </div>
    </div>
  )
}

export default StartScreen
