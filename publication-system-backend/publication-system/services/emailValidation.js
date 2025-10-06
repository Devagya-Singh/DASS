const emailValidator = require('email-validator');
const dns = require('dns').promises;

class EmailValidationService {
  constructor() {
    this.validDomains = new Set();
    this.invalidDomains = new Set();
  }

  async validateEmail(email) {
    // Basic format validation
    if (!emailValidator.validate(email)) {
      return { valid: false, message: 'Invalid email format' };
    }

    // Extract domain
    const domain = email.split('@')[1];
    
    // Check if we've already validated this domain
    if (this.validDomains.has(domain)) {
      return { valid: true, message: 'Email domain is valid' };
    }
    
    if (this.invalidDomains.has(domain)) {
      return { valid: false, message: 'Email domain does not exist' };
    }

    try {
      // Check if domain has MX record
      const mxRecords = await dns.resolveMx(domain);
      
      if (mxRecords && mxRecords.length > 0) {
        this.validDomains.add(domain);
        return { valid: true, message: 'Email domain is valid' };
      } else {
        this.invalidDomains.add(domain);
        return { valid: false, message: 'Email domain does not exist' };
      }
    } catch (error) {
      // If DNS lookup fails, assume invalid
      this.invalidDomains.add(domain);
      return { valid: false, message: 'Email domain does not exist' };
    }
  }

  // Additional validation for common disposable email domains
  isDisposableEmail(email) {
    const disposableDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com',
      'yopmail.com',
      'temp-mail.org',
      'throwaway.email',
      'getnada.com',
      'maildrop.cc',
      'sharklasers.com'
    ];
    
    const domain = email.split('@')[1].toLowerCase();
    return disposableDomains.includes(domain);
  }

  // Check if email is from a known educational institution
  isEducationalEmail(email) {
    const eduDomains = [
      '.edu',
      '.ac.uk',
      '.ac.in',
      '.edu.in',
      '.university',
      '.college'
    ];
    
    const domain = email.split('@')[1].toLowerCase();
    return eduDomains.some(eduDomain => domain.endsWith(eduDomain));
  }

  // Comprehensive email validation
  async validateEmailComprehensive(email) {
    // Basic format check
    if (!emailValidator.validate(email)) {
      return { valid: false, message: 'Invalid email format' };
    }

    // Check for disposable email
    if (this.isDisposableEmail(email)) {
      return { valid: false, message: 'Disposable email addresses are not allowed' };
    }

    // Check domain existence
    const domainCheck = await this.validateEmail(email);
    if (!domainCheck.valid) {
      return domainCheck;
    }

    // Additional checks for educational emails
    if (this.isEducationalEmail(email)) {
      return { valid: true, message: 'Educational email verified', isEducational: true };
    }

    return { valid: true, message: 'Email is valid', isEducational: false };
  }
}

module.exports = EmailValidationService;

