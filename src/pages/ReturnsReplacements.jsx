import { SITE_INFO } from '../config/siteInfo'

function ReturnsReplacements() {
  return (
    <main className="main-content">
      <div className="page-container">
        <h2 className="page-title">Returns and Replacements</h2>
        <p>We support replacements for eligible damaged, defective, or incorrect products.</p>
        <div className="contact-info">
          <div className="contact-item">
            <h3>Return Window</h3>
            <p>Report issues within 48 hours of delivery with clear photos and order details.</p>
          </div>
          <div className="contact-item">
            <h3>Replacement Process</h3>
            <p>After verification, we arrange reverse pickup or provide shipping instructions for replacement.</p>
          </div>
          <div className="contact-item">
            <h3>Condition Requirements</h3>
            <p>Items should include original accessories, manuals, and packaging for quick approval.</p>
          </div>
          <div className="contact-item">
            <h3>Support Contact</h3>
            <p>Contact {SITE_INFO.supportEmail} with your order ID for return or replacement requests.</p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ReturnsReplacements
