import { SITE_INFO } from '../config/siteInfo'

function FAQs() {
  return (
    <main className="main-content">
      <div className="page-container">
        <h2 className="page-title">Frequently Asked Questions</h2>
        <div className="contact-info">
          <div className="contact-item">
            <h3>Do I need an account to order?</h3>
            <p>Yes, please login to place orders and track purchase history.</p>
          </div>
          <div className="contact-item">
            <h3>How quickly will my order be delivered?</h3>
            <p>Most orders are delivered within 2 to 7 business days after dispatch.</p>
          </div>
          <div className="contact-item">
            <h3>Can I return a wrong or damaged item?</h3>
            <p>Yes, report within 48 hours with photos for quick replacement or refund verification.</p>
          </div>
          <div className="contact-item">
            <h3>Which payments are accepted?</h3>
            <p>UPI, cards, net banking, and wallets are supported for checkout.</p>
          </div>
          <div className="contact-item">
            <h3>How can I contact support?</h3>
            <p>Use the Contact page or email {SITE_INFO.supportEmail} with your order details.</p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default FAQs
