import { SITE_INFO } from '../config/siteInfo'

function ShippingInformation() {
  return (
    <main className="main-content">
      <div className="page-container">
        <h2 className="page-title">Shipping Information</h2>
        <p>We deliver across serviceable locations with reliable courier partners.</p>
        <div className="contact-info">
          <div className="contact-item">
            <h3>Processing Time</h3>
            <p>Orders are usually packed and dispatched within 1 to 2 business days.</p>
          </div>
          <div className="contact-item">
            <h3>Delivery Timeline</h3>
            <p>Delivery usually takes 2 to 7 business days depending on your location and courier serviceability.</p>
          </div>
          <div className="contact-item">
            <h3>Shipping Charges</h3>
            <p>Shipping charges, if applicable, are shown clearly at checkout before payment.</p>
          </div>
          <div className="contact-item">
            <h3>Delivery Updates</h3>
            <p>You will receive order and shipping status updates through website.</p>
          </div>
          <div className="contact-item">
            <h3>Shipping Support</h3>
            <p>For shipping queries, contact us at {SITE_INFO.supportEmail}.</p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ShippingInformation
