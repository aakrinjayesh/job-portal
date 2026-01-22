
export function extractCompanyFromEmail(email, options = {}) {
    // Default options
    const opts = {
        capitalize: true,
        ignoreSubdomains: true,
        ...options
    };

    // Validate input
    if (!email || typeof email !== 'string') {
        return null;
    }

    // Clean the email
    const cleanEmail = email.trim().toLowerCase();

    // Check if it's a valid email format
    if (!cleanEmail.includes('@')) {
        return null;
    }

    // Extract domain part (everything after @)
    const domain = cleanEmail.split('@')[1];

    if (!domain) {
        return null;
    }

    // Common subdomains to ignore (when ignoreSubdomains is true)
    const commonSubdomains = [
        'www', 'mail', 'webmail', 'smtp', 'pop', 'imap',
        'blog', 'news', 'shop', 'store', 'app', 'mobile',
        'support', 'help', 'admin', 'info', 'contact',
        'test', 'dev', 'staging', 'demo', 'api', 'cdn'
    ];

    // Common TLDs and country codes
    const commonTlds = [
        'com', 'org', 'net', 'edu', 'gov', 'mil',
        'co', 'io', 'ai', 'uk', 'us', 'ca', 'au', 'in',
        'biz', 'info', 'me', 'tv', 'xyz', 'app', 'dev'
    ];

    // Split domain into parts
    const domainParts = domain.split('.');

    // Find the company name
    let companyName = null;

    if (opts.ignoreSubdomains && domainParts.length > 2) {
        // Look for the first non-subdomain, non-TLD part
        for (let i = 0; i < domainParts.length - 1; i++) {
            const part = domainParts[i];

            // Skip if it's a common subdomain or TLD
            if (commonSubdomains.includes(part) || commonTlds.includes(part)) {
                continue;
            }

            companyName = part;
            break;
        }
    }

    // If we didn't find a company name or ignoring subdomains is false
    if (!companyName) {
        // For simple domains: example.com -> example
        if (domainParts.length >= 2) {
            companyName = domainParts[domainParts.length - 2];
        }
        // Fallback: first part
        else {
            companyName = domainParts[0];
        }
    }

    // Format the company name
    if (companyName && opts.capitalize) {
        companyName = companyName.charAt(0).toUpperCase() + companyName.slice(1);
    }

    return companyName;
}

/**
 * Simple version for basic email extraction
 * @param {string} email - The email address
 * @returns {string|null} The company name or null
 */
export function getCompanyFromEmail(email) {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return null;
    }

    const domain = email.split('@')[1];
    const company = domain?.split('.')[0];

    if (!company) return null;

    return company.charAt(0).toUpperCase() + company.slice(1);
}

/**
 * One-liner version - no options, no subdomain handling
 * @param {string} email - The email address
 * @returns {string|null} The company name or null
 */
export const extractCompany = (email) => {
    try {
        return email?.split('@')[1]?.split('.')[0] || null;
    } catch {
        return null;
    }
};

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid email format
 */
export function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Get full domain from email
 * @param {string} email - The email address
 * @returns {string|null} The full domain or null
 */
export function getDomainFromEmail(email) {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return null;
    }

    return email.split('@')[1];
}

// Export default as the main function
export default extractCompanyFromEmail;