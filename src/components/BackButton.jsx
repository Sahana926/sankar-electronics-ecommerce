import { useNavigate, useLocation } from 'react-router-dom'
import './BackButton.css'

/**
 * BackButton Component
 * 
 * A standalone back button placed below the header on all user pages.
 * Styled with a different color for better visual distinction.
 */
function BackButton() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    navigate(-1)
  }

  // Only show back button on specific pages (not on home/login/signup)
  const hiddenPaths = ['/', '/login', '/signup', '/admin/login']
  if (hiddenPaths.includes(location.pathname)) {
    return null
  }

  return (
    <div className="back-button-wrapper">
      <button className="back-btn" onClick={handleBack} title="Go back to previous page">
        <span className="back-arrow">←</span>
        Back
      </button>
    </div>
  )
}

export default BackButton
