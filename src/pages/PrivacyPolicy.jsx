import { SITE_INFO } from '../config/siteInfo'

function PrivacyPolicy() {
  return (
    <main className="main-content">
      <div className="page-container">
        <h2 className="page-title">Privacy Policy</h2>
        <p>
          We collect only the information required to process your orders, provide support, and improve your shopping
          experience.
        </p>
        <p>{SITE_INFO.legalName} is committed to handling your information responsibly.</p>
        <div className="contact-info">
          <div className="contact-item">
            <h3>Data We Collect</h3>
            <p>Name, phone number, email, delivery address, order details, and payment transaction references.</p>
          </div>
          <div className="contact-item">
            <h3>How We Use Data</h3>
            <p>To fulfill orders, provide customer support, process returns, prevent fraud, and share service updates.</p>
          </div>
          <div className="contact-item">
            <h3>Data Sharing</h3>
            <p>
              We share limited order information with logistics and payment partners only for order fulfillment and
              payment processing.
            </p>
          </div>
          <div className="contact-item">
            <h3>Your Rights</h3>
            <p>You can request correction or deletion of your account data by contacting support.</p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default PrivacyPolicy
