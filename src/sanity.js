// ============================================================
// Jack & Jill School — Sanity CMS Client
// Project ID : zrijfacv
// Dataset    : jj
// API Version: 2024-01-01
// ============================================================

const PROJECT_ID = 'zrijfacv';
const DATASET    = 'jj';
const API_VER    = '2024-01-01';

/**
 * Build a Sanity CDN fetch URL from a raw GROQ query string.
 * Uses the read-only CDN endpoint (no auth token needed for public data).
 */
function buildSanityUrl(groq) {
    const encoded = encodeURIComponent(groq);
    return `https://${PROJECT_ID}.apicdn.sanity.io/v${API_VER}/data/query/${DATASET}?query=${encoded}`;
}

/**
 * Core fetch helper. Returns the `result` array from Sanity or [] on error.
 */
async function sanityFetch(groq) {
    try {
        const res = await fetch(buildSanityUrl(groq));
        if (!res.ok) throw new Error(`Sanity API error: ${res.status}`);
        const data = await res.json();
        return data.result ?? [];
    } catch (err) {
        console.warn('[Sanity] Fetch failed:', err.message);
        return [];
    }
}

/**
 * Build a Sanity image URL from an image asset reference object.
 * Falls back to a placeholder if the reference is missing.
 * @param {object|null} imageRef  - The Sanity image field value
 * @param {number} w              - Desired width
 * @param {number} h              - Desired height
 */
export function buildImageUrl(imageRef, w = 800, h = 600) {
    if (!imageRef?.asset?._ref) {
        return `https://placehold.co/${w}x${h}/1a1a2e/F9A602?text=Jack+%26+Jill`;
    }
    // Sanity ref format: image-{id}-{dims}-{ext}
    const ref = imageRef.asset._ref;
    const [, id, dims, ext] = ref.split('-');
    return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}-${dims}.${ext}?w=${w}&h=${h}&fit=crop&auto=format`;
}

// ==============================================================
// QUERY FUNCTIONS
// ==============================================================

/**
 * Fetch the latest news articles. Returns max 8, newest first.
 */
export async function fetchNews() {
    const groq = `*[_type == "news"] | order(publishedAt desc)[0...8] {
        _id,
        title,
        slug,
        excerpt,
        category,
        publishedAt,
        mainImage,
        body
    }`;
    return sanityFetch(groq);
}

/**
 * Fetch upcoming events (from today onward), sorted soonest first.
 */
export async function fetchUpcomingEvents() {
    // Extract just the YYYY-MM-DD part so events today still show.
    const today = new Date().toISOString().split('T')[0];
    const groq = `*[_type == "event" && startDate >= "${today}"] | order(startDate asc)[0...6] {
        _id,
        eventName,
        category,
        location,
        startDate,
        endDate,
        description,
        isHighlighted,
        image
    }`;
    return sanityFetch(groq);
}

/**
 * Fetch all featured testimonials.
 */
export async function fetchTestimonials() {
    const groq = `*[_type == "testimonial" && isFeatured == true] | order(_createdAt desc) {
        _id,
        quote,
        authorName,
        authorRole,
        type,
        rating,
        avatar
    }`;
    return sanityFetch(groq);
}

/**
 * Fetch featured partners, sorted by display order.
 */
export async function fetchPartners() {
    const groq = `*[_type == "partner" && isFeatured == true] | order(order asc) {
        _id,
        partnerName,
        partnerType,
        description,
        logoImage,
        logoIcon,
        website
    }`;
    return sanityFetch(groq);
}

/**
 * Fetch active staff members, sorted by display order.
 * Optionally filter by department.
 * @param {string|null} department
 */
export async function fetchStaff(department = null) {
    const filter = department
        ? `*[_type == "staff" && isActive == true && department == "${department}"]`
        : `*[_type == "staff" && isActive == true]`;
    const groq = `${filter} | order(order asc) {
        _id,
        fullName,
        position,
        department,
        photo,
        qualifications,
        email,
        biography
    }`;
    return sanityFetch(groq);
}
