import { SITE_INFO } from '../config/siteInfo'

function RefundCancellation() {
  return (
    <main className="main-content">
      <div className="page-container">
        <h2 className="page-title">Refund and Cancellation Policy</h2>
        <p>We aim to provide fair cancellation and refund support for all eligible orders.</p>
        <div className="contact-info">
          <div className="contact-item">
            <h3>Order Cancellation</h3>
            <p>Orders can be cancelled before dispatch. Once shipped, cancellation is not guaranteed.</p>
          </div>
          <div className="contact-item">
            <h3>Refund Eligibility</h3>
            <p>Refunds are accepted for damaged, defective, or incorrect items reported within 48 hours of delivery.</p>
          </div>
          <div className="contact-item">
            <h3>Refund Timeline</h3>
            <p>Approved refunds are processed to the original payment method within 5 to 10 business days.</p>
          </div>
          <div className="contact-item">
            <h3>Non-Returnable Items</h3>
            <p>Items damaged due to misuse or products without original packaging may not qualify for refunds.</p>
          </div>
          <div className="contact-item">
            <h3>Refund Support</h3>
            <p>
              Contact {SITE_INFO.supportEmail} or {SITE_INFO.supportPhone} with your order ID for refund help.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default RefundCancellation
