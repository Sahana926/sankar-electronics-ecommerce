import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { SITE_INFO } from '../config/siteInfo'

const PAGE_MARGIN_X = 40
const HEADER_HEIGHT = 64
const FOOTER_HEIGHT = 28
const HEADER_BG = [30, 64, 175]
const HEADER_ACCENT = [16, 185, 129]
const TEXT_DARK = [31, 41, 55]
const TEXT_MUTED = [75, 85, 99]
const BORDER_LIGHT = [226, 232, 240]

const toCellText = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

const drawHeader = ({ doc, title, generatedAt }) => {
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFillColor(...HEADER_BG)
  doc.rect(0, 0, pageWidth, HEADER_HEIGHT, 'F')

  doc.setFillColor(...HEADER_ACCENT)
  doc.rect(0, HEADER_HEIGHT - 5, pageWidth, 5, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(SITE_INFO.brandName, PAGE_MARGIN_X, 28)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Support: ${SITE_INFO.supportPhone} | ${SITE_INFO.supportEmail}`, PAGE_MARGIN_X, 43)

  doc.setTextColor(...TEXT_DARK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(title || 'Report', PAGE_MARGIN_X, HEADER_HEIGHT + 24)

  doc.setTextColor(...TEXT_MUTED)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Generated on: ${generatedAt}`, PAGE_MARGIN_X, HEADER_HEIGHT + 40)
}

const drawFooter = ({ doc, pageNumber, totalPages }) => {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const footerY = pageHeight - FOOTER_HEIGHT

  doc.setDrawColor(...BORDER_LIGHT)
  doc.line(PAGE_MARGIN_X, footerY - 8, pageWidth - PAGE_MARGIN_X, footerY - 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...TEXT_MUTED)
  doc.text(`${SITE_INFO.legalName} | GSTIN: ${SITE_INFO.gstin}`, PAGE_MARGIN_X, footerY + 6)
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - PAGE_MARGIN_X - 65, footerY + 6)
}

export function downloadReportPdf({
  title,
  fileName,
  summaryLines = [],
  headers = [],
  rows = [],
}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const generatedAt = new Date().toLocaleString('en-IN')

  drawHeader({ doc, title, generatedAt })

  let y = HEADER_HEIGHT + 58

  if (summaryLines.length > 0) {
    y += 8
    doc.setFontSize(11)
    doc.setTextColor(...TEXT_DARK)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary', PAGE_MARGIN_X, y)

    y += 14
    doc.setFont('helvetica', 'normal')

    summaryLines.forEach((line) => {
      doc.text(toCellText(line), PAGE_MARGIN_X, y)
      y += 14
    })
  }

  autoTable(doc, {
    startY: y + 10,
    head: [headers.map(toCellText)],
    body: rows.map((row) => row.map(toCellText)),
    styles: {
      fontSize: 9,
      cellPadding: 6,
      textColor: TEXT_DARK,
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: {
      top: HEADER_HEIGHT + 58,
      bottom: FOOTER_HEIGHT + 16,
      left: PAGE_MARGIN_X,
      right: PAGE_MARGIN_X,
    },
    didDrawPage: () => {
      drawHeader({ doc, title, generatedAt })
    },
  })

  const totalPages = doc.getNumberOfPages()
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    doc.setPage(pageNumber)
    drawFooter({ doc, pageNumber, totalPages })
  }

  const safeFileName = (fileName || 'report').replace(/\s+/g, '-').toLowerCase()
  doc.save(`${safeFileName}.pdf`)
}
