import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Home Component
 * 
 * Homepage with hero section and product showcase.
 * Shop Now button redirects to login if user is not authenticated.
 */
function Home() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // Handle Shop Now button click
  const handleShopNow = () => {
    if (isAuthenticated) {
      // If logged in, go to shop
      navigate('/shop')
    } else {
      // If not logged in, redirect to login page
      navigate('/login')
    }
  }

  return (
    <main className="main-content">
      <div className="container">
        <div className="hero-section">
          {/* Left Content Section */}
          <div className="hero-left">
            <h2 className="main-heading">
              Sankar Electrical<br />and Hardwares
            </h2>
            <p className="tagline">
              Your trusted source for quality electronics and hardware.
            </p>
            <button onClick={handleShopNow} className="shop-now-btn">
              Shop Now
            </button>
          </div>

          {/* Right Image Section */}
          <div className="hero-right">
            <div className="hero-image-wrapper">
              <img
                src="/hero-hardware.jpg"
                alt="Assortment of hardware components"
                className="hero-image"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Home

