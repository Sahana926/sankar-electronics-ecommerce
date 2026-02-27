import express from 'express'
import Contact from '../models/Contact.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Create contact message
router.post('/', async (req, res) => {
  try {
    console.log('📧 Contact form submission received:', req.body)
    const { name, email, phone, message } = req.body

    // Validation
    if (!name || !email || !phone || !message) {
      console.log('❌ Validation failed - missing fields')
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Create contact message
    const contact = new Contact({
      name,
      email,
      phone,
      message,
    })

    await contact.save()
    console.log('✅ Contact message saved successfully:', contact._id)

    res.status(201).json({
      message: 'Contact message sent successfully',
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        message: contact.message,
      },
    })
  } catch (error) {
    console.error('❌ Contact error:', error)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

// Get all contact messages (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 })
    res.json(contacts)
  } catch (error) {
    console.error('Get contacts error:', error)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

export default router

