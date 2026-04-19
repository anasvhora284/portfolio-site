/**
 * @typedef {Object} SocialLink
 * @property {string} label
 * @property {string} url
 */

/**
 * @typedef {Object} SiteSettings
 * @property {string} siteTitle
 * @property {string} tagline
 * @property {string} statusLine
 * @property {boolean} availableForWork
 * @property {string} [resumeUrl]
 * @property {string} [cvUrl]
 * @property {string} contactEmail
 * @property {string} [defaultMetaDescription]
 * @property {string} [siteUrl] Canonical https URL (no trailing slash) used for SEO + OG.
 * @property {string} [ogImage] Absolute URL to the OG preview image (1200×630).
 * @property {string[]} [keywords] SEO keywords.
 * @property {SocialLink[]} [socialLinks]
 * @property {string[]} [bootMessages]
 */

/**
 * @typedef {Object} Project
 * @property {string} name
 * @property {string} slug
 * @property {string} [tagline]
 * @property {string} description
 * @property {unknown[]} [body] Portable Text blocks
 * @property {string} [image] Optional — constellation falls back to a
 *   grid-patterned monospace-name placeholder when omitted.
 * @property {"screenshot" | "logo"} [imageKind] Controls how the sidebar
 *   preview renders the image. "screenshot" (default) uses cover-fit so
 *   the shot fills the frame edge-to-edge. "logo" contains the asset on a
 *   themed backdrop — use for square app icons / brand marks.
 * @property {string} link
 * @property {string} [repoUrl]
 * @property {string} [articleUrl]
 * @property {{x?: number, y?: number, z?: number}} [starPosition]
 * @property {number} [year]
 * @property {string[]} [roles]
 * @property {string[]} [stack]
 * @property {boolean} [featured]
 * @property {number} [sortOrder]
 */

export {};
