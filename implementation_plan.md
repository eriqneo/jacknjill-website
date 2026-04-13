# Jack & Jill School: Sanity.io CMS Architecture Plan

Sanity.io is a brilliant, highly cost-effective choice for Jack & Jill School. It provides a real-time, highly customizable Headless CMS with an incredible developer experience and built-in global CDN for media, eliminating the need to pay separately for AWS S3.

Since we are using a **Headless Architecture**, we will create a completely standalone project folder for the CMS backend, keeping it strictly decoupled from our breathtaking frontend.

## 1. Project Architecture & Setup

We will organize the Monorepo (or separate repos) as follows:
```text
/Jack & Jill (Frontend - Our current folder via Vite)
/jack-jill-cms (Backend - The new Sanity.io Studio folder)
```

**Technology Stack:**
*   **CMS Backend:** Sanity Studio (React-based admin portal).
*   **Database & Media Hosting:** Sanity's fully managed real-time datastore and asset CDN.
*   **Query Language:** GROQ (Sanity's native query language, highly optimized for fetching exact JSON shapes) or standard REST API endpoints over HTTP.
*   **Frontend Integration:** We will inject Sanity's lightweight API inside `site.js` to fetch data and dynamically populate our complex DOM layouts.

## 2. Core Sanity Schemas (Collections)

Inside the `jack-jill-cms/schemas` directory, we will construct the following document types. This tells Sanity exactly what fields the school admins are allowed to fill in:

### A. `news.js` (News & Announcements)
Used for the sliding glassmorphic cards on the homepage.
*   `title` (String: e.g., "Term 3 Reopening")
*   `slug` (Slug: auto-generated from title)
*   `excerpt` (Text: short description)
*   `body` (Block Content: rich text editor for full articles)
*   `mainImage` (Image: high-res photo heavily utilizing Sanity's built-in crop/hotspot tools)
*   `publishedAt` (Datetime)

### B. `event.js` (Events Calendar)
Used for the golden timeline and interactive calendar modals.
*   `eventName` (String)
*   `location` (String)
*   `startDate` / `endDate` (Datetime)
*   `description` (Text)
*   `category` (String/Dropdown: Academic, Sports, Cultural)

### C. `testimonial.js` (Parent & Student Perspectives)
Used for the infinite scrolling marquee and the Student Spotlight.
*   `quote` (Text)
*   `authorName` (String: "Dr. Sarah Kimani")
*   `authorRole` (String: "Parent of Class 8")
*   `avatar` (Image)

### D. `partner.js` (Strategic Partners)
Used for the dynamic CMS grid on the Partners page.
*   `partnerName` (String)
*   `description` (Text)
*   `logoPath` (String: FontAwesome class e.g., "fa-leaf") or `logoImage` (Image upload)

### E. `staff.js` (Governance Directory)
*   `fullName` (String)
*   `position` (String: "Headmaster")
*   `bio` (Block Content)
*   `photo` (Image)

## 3. Developer Execution Steps: Initializing Sanity

As the developer, here are the exact steps you will execute to spin up the CMS architecture natively on your machine:

**Step 1: Setup Sanity Account**
1. Open your browser and navigate to [sanity.io](https://sanity.io)
2. Create a free account (I recommend signing in with GitHub or your Google Account).

**Step 2: Terminal Initialization**
1. Stop the current Vite development server (press `Ctrl + C`).
2. Navigate UP one directory so you are alongside the `Jack & Jill` frontend folder:
   ```bash
   cd ..
   ```
3. Run the official Sanity initializer command:
   ```bash
   npm create sanity@latest
   ```
4. The CLI will prompt you to log in (it will open a browser window to authenticate).
5. Follow the CLI wizard with these specific choices:
   - **Project name:** `jack-jill-cms`
   - **Use default dataset configuration?** `Y` (this creates a 'production' environment)
   - **Project output path:** `/jack-jill-cms`
   - **Select project template:** Choose `Clean project with no sample data`.
   - **Append UI framework?** Choose `React`.
   - **Use TypeScript?** `N` (Stick to Javascript for faster schema configuration initially, unless you prefer TS).

**Step 3: Booting the Studio**
1. Navigate into the newly created server:
   ```bash
   cd jack-jill-cms
   ```
2. Start the local CMS Admin dashboard:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3333` in your browser. You will see an empty Sanity Studio!

**Step 4: Wiring the Frontend (CORS)**
1. In your Sanity dashboard (at manage.sanity.io), navigate to your Project -> **API**.
2. Click **Add CORS Origin**.
3. Type `http://localhost:5173` (your Vite frontend URL) and ensure "Allow credentials" is checked. This ensures our local `site.js` is permitted to query the database.

## 4. The Implementation Roadmap (Next Steps)

Once you complete the 4 steps above, I will jump back in to:
1. **Build the Schemas:** I will write the schemas (`news.js`, `event.js`, etc.) and inject them into `jack-jill-cms/schemas/index.js`.
2. **Execute Frontend GROQ Fetching:** I will update the `.html` and `site.js` files in the frontend to rip out the placeholder data and replace it with authentic `fetch()` calls to your new Sanity API endpoint!

## User Review Required

> [!IMPORTANT]
> **Approval Checkpoint**
> This architectural strategy dictates exactly how you will spin up the backend.
> 
> **Are you ready to execute "Step 2: Terminal Initialization" above to create the Sanity folder?** Let me know when the `jack-jill-cms` folder has been successfully generated so I can write the database schemas!
