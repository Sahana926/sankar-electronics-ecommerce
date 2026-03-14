import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SITE_INFO } from '../config/siteInfo'

/**
 * Home Component
 * 
 * Homepage with hero section and product showcase.
 * Shop Now button redirects to login if user is not authenticated.
 */
function Home() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const currentYear = new Date().getFullYear()

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

      <footer className="home-footer" aria-label="Footer">
        <div className="container home-footer-grid">
          <section className="home-footer-column">
            <h3>{SITE_INFO.brandName}</h3>
            <p>
              Trusted electrical and hardware products for homes, shops, and projects.
            </p>
            <p>Need help? Call us at {SITE_INFO.supportPhone}</p>
            <p>Email: {SITE_INFO.supportEmail}</p>
            <p>Address: {SITE_INFO.address}</p>
            <p>GSTIN: {SITE_INFO.gstin}</p>
          </section>

          <section className="home-footer-column">
            <h4>Quick Links</h4>
            <ul className="home-footer-links">
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </section>

          <section className="home-footer-column">
            <h4>Customer Service</h4>
            <ul className="home-footer-links">
              <li><Link to="/shipping-information">Shipping Information</Link></li>
              <li><Link to="/returns-replacements">Returns and Replacements</Link></li>
              <li><Link to="/payment-options">Payment Options</Link></li>
              <li><Link to="/track-order">Track Your Order</Link></li>
              <li><Link to="/faqs">FAQs</Link></li>
            </ul>
          </section>

          <section className="home-footer-column">
            <h4>Legal and Policies</h4>
            <ul className="home-footer-links">
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions">Terms and Conditions</Link></li>
              <li><Link to="/refund-cancellation">Refund and Cancellation</Link></li>
              <li><Link to="/cookie-policy">Cookie Policy</Link></li>
            </ul>
            <p className="home-footer-security">Secure checkout with trusted payment gateways.</p>
            <p className="home-footer-payments">Accepted: UPI, Cards, Net Banking, Wallets</p>
          </section>
        </div>

        <div className="home-footer-bottom">
          <div className="container home-footer-bottom-content">
            <p>
              Copyright © {currentYear} {SITE_INFO.legalName}. {SITE_INFO.copyrightNotice}
            </p>
            <p>Prices and availability are subject to change without prior notice.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default Home

