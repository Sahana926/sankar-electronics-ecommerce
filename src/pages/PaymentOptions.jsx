import { SITE_INFO } from '../config/siteInfo'

function PaymentOptions() {
  return (
    <main className="main-content">
      <div className="page-container">
        <h2 className="page-title">Payment Options</h2>
        <p>We provide multiple secure payment methods for your convenience.</p>
        <p>Payments made on {SITE_INFO.brandName} are processed through trusted partners.</p>
        <div className="contact-info">
          <div className="contact-item">
            <h3>Supported Methods</h3>
            <p>UPI and cash on delivery options.</p>
          </div>
          <div className="contact-item">
            <h3>Payment Security</h3>
            <p>All transactions are processed via trusted, encrypted payment gateways.</p>
          </div>
          <div className="contact-item">
            <h3>Failed Transactions</h3>
            <p>If payment is deducted but order is not placed, amount is usually auto-reversed by the bank.</p>
          </div>
          <div className="contact-item">
            <h3>Invoice and GST</h3>
            <p>Order invoices are shared digitally and include applicable tax details.</p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default PaymentOptions
