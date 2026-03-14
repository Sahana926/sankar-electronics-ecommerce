import { SITE_INFO } from '../config/siteInfo'

function TermsAndConditions() {
  return (
    <main className="main-content">
      <div className="page-container">
        <h2 className="page-title">Terms and Conditions</h2>
        <p>By using this website, you agree to the following terms for purchases and account usage.</p>
        <p>These terms apply to all users of {SITE_INFO.legalName}.</p>
        <div className="contact-info">
          <div className="contact-item">
            <h3>Account Responsibility</h3>
            <p>You are responsible for maintaining your login credentials and all activity under your account.</p>
          </div>
          <div className="contact-item">
            <h3>Pricing and Availability</h3>
            <p>Prices and stock can change without notice. Orders may be cancelled if products are unavailable.</p>
          </div>
          <div className="contact-item">
            <h3>Order Acceptance</h3>
            <p>Order confirmation does not guarantee dispatch. We reserve the right to verify and reject risky orders.</p>
          </div>
          <div className="contact-item">
            <h3>Limitation of Liability</h3>
            <p>Our liability is limited to the order value paid by the customer for the disputed order.</p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default TermsAndConditions
