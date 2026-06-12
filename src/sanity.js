// ============================================================
// Jack & Jill School — PocketBase CMS Client
// PocketHost: https://jacknjill.pockethost.io
// ============================================================

const POCKETBASE_URL = 'https://jacknjill.pockethost.io';
const PLACEHOLDER_IMAGE = 'https://placehold.co';

async function pocketFetch(collection, params = {}) {
    const url = new URL(`${POCKETBASE_URL}/api/collections/${collection}/records`);

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            url.searchParams.set(key, value);
        }
    });

    try {
        const res = await fetchWithRetry(url);
        if (!res.ok) throw new Error(`PocketBase API error: ${res.status}`);
        const data = await res.json();
        return data.items ?? [];
    } catch (err) {
        console.warn('[PocketBase] Fetch failed:', err.message);
        return [];
    }
}

async function fetchWithRetry(url, attempts = 3) {
    let lastError;

    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await fetch(url);
        } catch (err) {
            lastError = err;
            if (attempt === attempts) break;
            await delay(300 * attempt);
        }
    }

    throw lastError;
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function buildImageUrl(imageRef, w = 800, h = 600) {
    if (!imageRef) {
        return `${PLACEHOLDER_IMAGE}/${w}x${h}/1a1a2e/F9A602?text=Jack+%26+Jill`;
    }

    if (typeof imageRef === 'string') return imageRef;
    if (imageRef.url) return imageRef.url;

    return `${PLACEHOLDER_IMAGE}/${w}x${h}/1a1a2e/F9A602?text=Jack+%26+Jill`;
}

function buildPocketFile(record, fieldName, thumb = '') {
    const fileValue = record[fieldName];
    const filename = Array.isArray(fileValue) ? fileValue[0] : fileValue;

    if (!filename) return null;

    const url = new URL(
        `${POCKETBASE_URL}/api/files/${record.collectionId}/${record.id}/${encodeURIComponent(filename)}`
    );

    if (thumb) url.searchParams.set('thumb', thumb);

    return {
        filename,
        url: url.toString(),
    };
}

function dateFilterFromToday(fieldName) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return `${fieldName} >= "${today.toISOString().replace('T', ' ')}"`;
}

function portableTextToPlainText(value) {
    if (!Array.isArray(value)) return '';

    return value
        .map((block) => {
            if (!Array.isArray(block.children)) return '';
            return block.children.map((child) => child.text || '').join('');
        })
        .filter(Boolean)
        .join('\n\n');
}

function mapNews(record) {
    return {
        _id: record.id,
        title: record.title,
        slug: {current: record.slug},
        excerpt: record.excerpt,
        category: record.category,
        publishedAt: record.published_at,
        mainImage: buildPocketFile(record, 'main_image', '800x600'),
        body: record.body,
    };
}

function mapEvent(record) {
    return {
        _id: record.id,
        eventName: record.event_name,
        slug: {current: record.slug},
        category: record.category,
        location: record.location,
        startDate: record.start_date,
        endDate: record.end_date,
        description: record.description,
        isHighlighted: record.is_highlighted,
        image: buildPocketFile(record, 'image', '800x600'),
    };
}

function mapTestimonial(record) {
    return {
        _id: record.id,
        quote: record.quote,
        authorName: record.author_name,
        authorRole: record.author_role,
        type: record.type,
        rating: record.rating,
        avatar: buildPocketFile(record, 'avatar', '300x300'),
    };
}

function mapPartner(record) {
    return {
        _id: record.id,
        partnerName: record.partner_name,
        slug: {current: record.slug},
        partnerType: record.partner_type,
        description: record.description,
        logoImage: buildPocketFile(record, 'logo_image', '300x200'),
        logoIcon: record.logo_icon,
        website: record.website,
    };
}

function mapStaff(record) {
    const biography = portableTextToPlainText(record.bio);

    return {
        _id: record.id,
        fullName: record.full_name,
        slug: {current: record.slug},
        position: record.position,
        department: record.department,
        photo: buildPocketFile(record, 'photo', '300x300'),
        bio: record.bio,
        biography,
        qualifications: record.qualifications ?? [],
        email: record.email,
    };
}

function mapSitePage(record) {
    return {
        _id: record.id,
        slug: record.slug,
        title: record.title,
        summary: record.summary,
        heroImagePath: record.hero_image_path,
        heroImage: buildPocketFile(record, 'hero_image', '1600x0'),
        navItems: record.nav_items ?? [],
        sections: record.sections ?? [],
    };
}

// ============================================================
// QUERY FUNCTIONS
// ============================================================

export async function fetchNews() {
    const records = await pocketFetch('news', {
        perPage: 8,
        sort: '-published_at',
    });

    return records.map(mapNews);
}

export async function fetchUpcomingEvents() {
    const records = await pocketFetch('events', {
        perPage: 6,
        sort: 'start_date',
        filter: dateFilterFromToday('start_date'),
    });

    return records.map(mapEvent);
}

export async function fetchTestimonials() {
    const records = await pocketFetch('testimonials', {
        perPage: 50,
        filter: 'is_featured = true',
    });

    return records.map(mapTestimonial);
}

export async function fetchPartners() {
    const records = await pocketFetch('partners', {
        perPage: 50,
        sort: 'display_order',
        filter: 'is_featured = true',
    });

    return records.map(mapPartner);
}

export async function fetchStaff(department = null) {
    const filter = department ? `department = "${department}"` : '';
    const records = await pocketFetch('staff', {
        perPage: 100,
        sort: 'display_order',
        filter,
    });

    return records.map(mapStaff);
}

export async function fetchSitePage(slug) {
    const records = await pocketFetch('site_pages', {
        perPage: 1,
        filter: `slug = "${slug}"`,
    });

    return records[0] ? mapSitePage(records[0]) : null;
}
