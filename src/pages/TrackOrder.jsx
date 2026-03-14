import { SITE_INFO } from '../config/siteInfo'

function TrackOrder() {
  return (
    <main className="main-content">
      <div className="page-container">
        <h2 className="page-title">Track Your Order</h2>
        <p>Track your latest order updates from your account and notifications.</p>
        <div className="contact-info">
          <div className="contact-item">
            <h3>From Orders Page</h3>
            <p>Login and open the Orders page to view processing, shipped, and delivered statuses.</p>
          </div>
          <div className="contact-item">
            <h3>Shipment Tracking</h3>
            <p>When available, courier tracking references are shared after dispatch.</p>
          </div>
          <div className="contact-item">
            <h3>Need Assistance</h3>
            <p>
              If you need help tracking an order, contact {SITE_INFO.supportEmail} with your order ID.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default TrackOrder
