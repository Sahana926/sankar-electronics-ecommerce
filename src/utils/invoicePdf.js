import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { SITE_INFO } from '../config/siteInfo'

const money = (value) => `INR ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const normalizeAddress = (address = {}, fallbackName = '') => {
  const name = address.name || fallbackName || '-'
  const phone = address.phone || address.alternatePhone || '-'
  const line1 = [address.street, address.locality].filter(Boolean).join(', ')
  const line2 = [address.landmark, address.city, address.state, address.postalCode || address.zipCode || address.pincode]
    .filter(Boolean)
    .join(', ')

  return {
    name,
    phone,
    line1: line1 || '-',
    line2: line2 || '-',
  }
}

export function downloadInvoicePdf(order, customer = {}) {
  if (!order) return

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const generatedAt = new Date().toLocaleString('en-IN')

  const invoiceNumber = `INV-${order.orderNumber || order._id || Date.now()}`
  const issueDate = order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : generatedAt
  const billingAddress = normalizeAddress(order.shippingAddress, customer.fullName || customer.name)

  const items = Array.isArray(order.items) ? order.items : []
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0)
  const orderTotal = Number(order.total || subtotal || 0)
  const shipping = Math.max(orderTotal - subtotal, 0)

  doc.setFillColor(30, 64, 175)
  doc.rect(0, 0, pageWidth, 82, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(SITE_INFO.brandName, 40, 32)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`GSTIN: ${SITE_INFO.gstin}`, 40, 49)
  doc.text(`${SITE_INFO.address}`, 40, 63)

  doc.setTextColor(31, 41, 55)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('TAX INVOICE', 40, 115)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Invoice No: ${invoiceNumber}`, 40, 136)
  doc.text(`Issue Date: ${issueDate}`, 40, 152)
  doc.text(`Generated: ${generatedAt}`, 40, 168)

  doc.setFont('helvetica', 'bold')
  doc.text('Order Details', 340, 136)
  doc.setFont('helvetica', 'normal')
  doc.text(`Order No: ${order.orderNumber || '-'}`, 340, 152)
  doc.text(`Order Status: ${String(order.status || '-').toUpperCase()}`, 340, 168)
  doc.text(`Payment: ${String(order.paymentMethod || '-').toUpperCase()} / ${String(order.paymentStatus || '-').toUpperCase()}`, 340, 184)
  doc.text(`Transaction ID: ${order.transactionId || '-'}`, 340, 200)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Bill To', 40, 206)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(billingAddress.name, 40, 224)
  doc.text(`Phone: ${billingAddress.phone}`, 40, 239)
  doc.text(billingAddress.line1, 40, 254)
  doc.text(billingAddress.line2, 40, 269)

  autoTable(doc, {
    startY: 292,
    head: [['#', 'Item', 'Qty', 'Unit Price', 'Line Total']],
    body: items.map((item, index) => [
      String(index + 1),
      item.name || '-',
      String(item.quantity || 0),
      money(item.price || 0),
      money(Number(item.price || 0) * Number(item.quantity || 0)),
    ]),
    styles: {
      fontSize: 10,
      cellPadding: 6,
      textColor: [31, 41, 55],
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    margin: { left: 40, right: 40 },
  })

  let y = doc.lastAutoTable.finalY + 22
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(`Subtotal: ${money(subtotal)}`, 360, y)
  y += 18
  doc.text(`Shipping/Delivery: ${money(shipping)}`, 360, y)
  y += 18
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(`Grand Total: ${money(orderTotal)}`, 360, y)

  y += 34
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(75, 85, 99)
  doc.text('This is a system-generated invoice and does not require a signature.', 40, y)
  doc.text(`Support: ${SITE_INFO.supportEmail} | ${SITE_INFO.supportPhone}`, 40, y + 14)

  const safeOrderNo = (order.orderNumber || order._id || 'invoice').toString().replace(/[^a-zA-Z0-9-_]/g, '')
  doc.save(`invoice-${safeOrderNo}.pdf`)
}
