/**
 * Comprehensive Email Validation Utility
 * 
 * Implements strict RFC 5321/5322 compliant email validation with:
 * - Standard format validation
 * - Character whitelist checking
 * - Consecutive dot prevention
 * - Domain validation
 * - Length limits
 * - Case normalization
 * - Optional disposable domain blocking
 */

// List of allowed email domains (whitelist)
const ALLOWED_DOMAINS = new Set([
  'gmail.com',
  'kongu.edu',
  'sankar.com',
])

// List of common disposable email domains
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'maildrop.cc',
  'temp-mail.org',
  'throwaway.email',
  'mailinator.com',
  'yopmail.com',
  'fake-mail.com',
  'trashmail.com',
  'spam4.me',
  'sharklasers.com',
  'mailnesia.com',
  '33mail.com',
  'grr.la',
  'guerrillamail.info',
  'guerrillamail.net',
  'mintemail.com',
  'temp-mail.io',
  'tempmail.email',
  'mytrashmail.com',
  'throwaway.me',
  'fakeinbox.com',
  'mailfreeonline.com',
  'testmail.com',
  'vapidmail.com',
  'dontreplytome.com',
  'dropmail.me',
  'fakeemail.net',
  'mailnesia.com',
  'mockemail.com',
  'neverbox.com',
  'suremail.info',
  'tempinbox.com',
  'temp-mail.co',
  'trash-mail.com',
  'email.net',
  'alias.edu',
  'ashleybrooker.tk',
  'barrybrooker.tk',
  'basecamphq.com',
  'battlefield.com',
  'bobmail.info',
  'boximail.com',
  'bumpmail.com',
  'cashmail.ru',
  'changeaddress.org',
  'chatszi.com',
  'cheveuxnetwork.tk',
  'clickymail.com',
  'cmail.net',
])

/**
 * Validates email address comprehensively
 * @param {string} email - Email to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.checkDisposable - Check against disposable domain list (default: true)
 * @param {boolean} options.checkAllowedDomains - Check against allowed domain list (default: true)
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validateEmail = (email, options = {}) => {
  const { checkDisposable = true, checkAllowedDomains = true } = options
  const errors = []

  // 1. Check if email is provided
  if (!email) {
    errors.push('Email is required')
    return { isValid: false, errors }
  }

  // 2. Trim whitespace
  const trimmedEmail = email.trim()

  // 3. Check if empty after trim
  if (!trimmedEmail) {
    errors.push('Email cannot be empty or contain only spaces')
    return { isValid: false, errors }
  }

  // 4. Check length (RFC 5321: max 254 characters)
  if (trimmedEmail.length < 5) {
    errors.push('Email must be at least 5 characters')
  }
  if (trimmedEmail.length > 254) {
    errors.push('Email cannot exceed 254 characters')
  }

  // 5. Check for whitespace
  if (/\s/.test(trimmedEmail)) {
    errors.push('Email cannot contain spaces')
  }

  // 6. Split into local and domain parts
  const emailParts = trimmedEmail.split('@')
  if (emailParts.length !== 2) {
    errors.push('Email must contain exactly one @ symbol')
    return { isValid: false, errors }
  }

  const [localPart, domain] = emailParts

  // 7. Validate local part (before @)
  if (!localPart) {
    errors.push('Email local part (before @) cannot be empty')
  } else if (localPart.length > 64) {
    errors.push('Email local part cannot exceed 64 characters')
  } else {
    // Check for valid characters in local part: a-z, 0-9, . _ % + -
    const validLocalChars = /^[a-zA-Z0-9._%-+]+$/
    if (!validLocalChars.test(localPart)) {
      errors.push('Email local part contains invalid characters. Only letters, numbers, . _ % + - are allowed')
    }

    // Check for consecutive dots
    if (/\.\./.test(localPart)) {
      errors.push('Email cannot contain consecutive dots')
    }

    // Check if starts or ends with dot
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      errors.push('Email local part cannot start or end with a dot')
    }
  }

  // 8. Validate domain part (after @)
  if (!domain) {
    errors.push('Email domain (after @) cannot be empty')
  } else {
    // Check if domain has at least one dot
    if (!domain.includes('.')) {
      errors.push('Email domain must contain at least one dot (e.g., example.com)')
    }

    // Check for consecutive dots in domain
    if (/\.\./.test(domain)) {
      errors.push('Email domain cannot contain consecutive dots')
    }

    // Check if domain starts or ends with dot
    if (domain.startsWith('.') || domain.endsWith('.')) {
      errors.push('Email domain cannot start or end with a dot')
    }

    // Check for valid domain characters: a-z, 0-9, . -
    const validDomainChars = /^[a-zA-Z0-9.-]+$/
    if (!validDomainChars.test(domain)) {
      errors.push('Email domain contains invalid characters. Only letters, numbers, dots, and hyphens are allowed')
    }

    // Check domain length (max 255)
    if (domain.length > 255) {
      errors.push('Email domain cannot exceed 255 characters')
    }

    // Check TLD (top-level domain) - must have at least 2 characters and only letters
    const domainParts = domain.split('.')
    const tld = domainParts[domainParts.length - 1]
    if (tld.length < 2) {
      errors.push('Email domain must have a valid top-level domain (TLD) with at least 2 characters')
    }
    if (!/^[a-zA-Z]{2,}$/.test(tld)) {
      errors.push('Email domain top-level domain (TLD) must contain only letters')
    }

    // Check if domain is in allowed list
    if (checkAllowedDomains) {
      const lowerDomain = domain.toLowerCase()
      if (!ALLOWED_DOMAINS.has(lowerDomain)) {
        const allowedList = Array.from(ALLOWED_DOMAINS).join(', ')
        errors.push(`Email domain must be one of: ${allowedList}`)
      }
    }

    // Check if domain is disposable (only if allowed domain check passes or is disabled)
    if (checkDisposable && (!checkAllowedDomains || ALLOWED_DOMAINS.has(domain.toLowerCase()))) {
      const lowerDomain = domain.toLowerCase()
      if (DISPOSABLE_DOMAINS.has(lowerDomain)) {
        errors.push(`"${domain}" is a disposable email domain. Please use a permanent email address.`)
      }
    }
  }

  // 9. Standard regex pattern as final validation
  // RFC 5321/5322 simplified pattern
  const emailRegex = /^[a-zA-Z0-9._%-+]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(trimmedEmail)) {
    if (errors.length === 0) {
      errors.push('Email format is invalid')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalizedEmail: trimmedEmail.toLowerCase(), // Always return lowercase for storage
  }
}

/**
 * Get user-friendly error message for email validation
 * @param {string} email - Email to validate
 * @param {Object} options - Validation options
 * @returns {string} - First error message or empty string if valid
 */
export const getEmailErrorMessage = (email, options = {}) => {
  const result = validateEmail(email, options)
  return result.errors[0] || ''
}

/**
 * Get normalized email (lowercase, trimmed)
 * @param {string} email - Email to normalize
 * @returns {string|null} - Normalized email or null if invalid
 */
export const normalizeEmail = (email) => {
  if (!email) return null
  const trimmed = email.trim()
  if (!trimmed) return null
  // Just normalize format, don't validate against allowed domains
  return trimmed.toLowerCase()
}

/**
 * Check if a domain is disposable
 * @param {string} domain - Domain to check
 * @returns {boolean} - True if domain is disposable
 */
export const isDisposableDomain = (domain) => {
  return DISPOSABLE_DOMAINS.has(domain.toLowerCase())
}

/**
 * Add custom disposable domains to the list
 * @param {string[]} domains - Array of domains to add
 */
export const addDisposableDomains = (domains) => {
  domains.forEach(domain => {
    DISPOSABLE_DOMAINS.add(domain.toLowerCase())
  })
}

/**
 * Add custom allowed domains to the whitelist
 * @param {string[]} domains - Array of domains to add
 */
export const addAllowedDomains = (domains) => {
  domains.forEach(domain => {
    ALLOWED_DOMAINS.add(domain.toLowerCase())
  })
}

/**
 * Remove domain from allowed domains
 * @param {string} domain - Domain to remove
 */
export const removeAllowedDomain = (domain) => {
  ALLOWED_DOMAINS.delete(domain.toLowerCase())
}

/**
 * Get list of allowed domains
 * @returns {string[]} - Array of allowed domains
 */
export const getAllowedDomains = () => {
  return Array.from(ALLOWED_DOMAINS)
}

export default {
  validateEmail,
  getEmailErrorMessage,
  normalizeEmail,
  isDisposableDomain,
  addDisposableDomains,
  addAllowedDomains,
  removeAllowedDomain,
  getAllowedDomains,
}
