import { SITE_INFO } from '../config/siteInfo'

function CookiePolicy() {
  return (
    <main className="main-content">
      <div className="page-container">
        <h2 className="page-title">Cookie Policy</h2>
        <p>This website uses cookies to improve performance, login reliability, and user experience.</p>
        <p>This policy applies to browsing sessions on {SITE_INFO.brandName}.</p>
        <div className="contact-info">
          <div className="contact-item">
            <h3>Essential Cookies</h3>
            <p>Required for login sessions, cart persistence, and secure checkout features.</p>
          </div>
          <div className="contact-item">
            <h3>Analytics Cookies</h3>
            <p>Used to understand page usage trends so we can improve content and performance.</p>
          </div>
          <div className="contact-item">
            <h3>Managing Cookies</h3>
            <p>You can control or delete cookies from your browser settings at any time.</p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default CookiePolicy
