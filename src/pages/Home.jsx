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
  const highlights = [
    { value: '12K+', label: 'Products in stock' },
    { value: '48h', label: 'Fast dispatch in city' },
    { value: '4.8/5', label: 'Customer satisfaction' },
  ]

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
    <main className="main-content home-innovation">
      <div className="container">
        <section className="home-hero-v2">
          <div className="hero-left hero-left-v2">
            <p className="hero-kicker">Built for projects that cannot fail</p>
            <h2 className="main-heading main-heading-v2">
              Smarter Electrical and Hardware Shopping
            </h2>
            <p className="tagline tagline-v2">
              Discover premium tools, electrical essentials, and construction-grade materials with real-time inventory and trusted support.
            </p>

            <div className="hero-action-row">
              <button onClick={handleShopNow} className="shop-now-btn shop-now-btn-v2">
                Start Shopping
              </button>
              <Link to="/products" className="hero-secondary-link">
                Explore Categories
              </Link>
            </div>

            <div className="hero-stat-grid" aria-label="Store highlights">
              {highlights.map((item) => (
                <article key={item.label} className="hero-stat-card">
                  <h3>{item.value}</h3>
                  <p>{item.label}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="hero-right hero-right-v2">
            <div className="hero-swatch hero-swatch-one" aria-hidden="true" />
            <div className="hero-swatch hero-swatch-two" aria-hidden="true" />
            <div className="hero-image-wrapper">
              <img
                src="/hero-hardware.jpg"
                alt="Assortment of hardware components"
                className="hero-image"
                loading="lazy"
              />
            </div>
            <div className="hero-float-card hero-float-card-top" aria-hidden="true">
              <span>Top pick</span>
              <strong>Industrial Wiring Kits</strong>
            </div>
            <div className="hero-float-card hero-float-card-bottom" aria-hidden="true">
              <span>Today only</span>
              <strong>Bulk order savings up to 18%</strong>
            </div>
          </div>
        </section>

        <section className="home-value-band" aria-label="Why customers choose us">
          <article className="value-card">
            <h3>Authentic Brands</h3>
            <p>Sourced from verified distributors with quality checks before dispatch.</p>
          </article>
          <article className="value-card">
            <h3>Instant Assistance</h3>
            <p>Get support for product compatibility, installation, and order tracking.</p>
          </article>
          <article className="value-card">
            <h3>Secure Checkout</h3>
            <p>UPI, cards, and net banking through trusted payment partners.</p>
          </article>
        </section>
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

