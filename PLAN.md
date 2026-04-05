# Crumb & Cheese — Bakery Website Build Plan

> A premium, JSON-driven cake & bakery e-commerce site with cart, GPay checkout, and email notification.

---

## 1. Project Structure

Create the following structure inside `Crumb&Cheese/`:

```
Crumb&Cheese/
├── index.html              ← Main single-page app
├── style.css               ← All styles (animations, layout, theme)
├── script.js               ← Core logic (JSON loader, cart, checkout)
├── products.json           ← Single config file for ALL products
├── emailjs-config.js       ← EmailJS credentials (kept separate)
├── gpay-qr.png             ← Your Google Pay QR code image
├── CNC website/            ← Existing folder (images + branding)
│   ├── logo.png
│   ├── name.svg
│   ├── Banana caramel walnut tart.png
│   ├── Blueberry lemon.png
│   ├── Blueberry lemon 2.png
│   ├── Blueberry lemon 3.png
│   ├── Blueberry lemon 4.png
│   ├── Blueberry.png
│   ├── Brownies with topping.png
│   ├── Chocolate hazelnut cupcake.png
│   ├── Chocolate raspberry cake.PNG
│   ├── Chocolate Raspberry.png
│   ├── Chocolate strawberry cake.png
│   ├── Chocolate strawberry tart.png
│   ├── Chocolate.png
│   ├── Layers chocolate.png
│   ├── Lemon Blueberry.png
│   ├── Lemon meringue tart.png
│   ├── Limoncello.png
│   ├── Mocha Tart.png
│   ├── Pistachio white chocolate tart.png
│   ├── Tiramisu cupcakes.png
│   └── Vanilla custard Cupcake.png
└── PLAN.md
```

---

## 2. `products.json` — The Single Source of Truth

This JSON file controls **everything** displayed on the site. To add/remove/edit items, you only edit this file.

### Schema

```json
{
  "storeName": "Crumb & Cheese",
  "currency": "₹",
  "categories": ["Cakes", "Tarts", "Cupcakes", "Brownies"],
  "products": [
    {
      "id": "banana-caramel-walnut-tart",
      "name": "Banana Caramel Walnut Tart",
      "image": "CNC website/Banana caramel walnut tart.png",
      "category": "Tarts",
      "price": 450,
      "description": "Rich banana caramel filling with crunchy walnuts",
      "available": true,
      "qty": 10,
      "tags": ["bestseller"],
      "variants": [
        { "label": "Regular", "price": 450 },
        { "label": "Large", "price": 750 }
      ],
      "customizationOptions": {
        "eggless": true,
        "messageOnCake": false
      }
    }
  ]
}
```

### Fields Explained

| Field | Type | Purpose |
|---|---|---|
| `id` | string | Unique slug (auto-derive from filename if needed) |
| `name` | string | Display name (derived from image filename) |
| `image` | string | Relative path to image in `CNC website/` folder |
| `category` | string | For filtering (Cakes, Tarts, Cupcakes, Brownies) |
| `price` | number | Base price in ₹ |
| `description` | string | Short description shown on hover/modal |
| `available` | boolean | Toggle item visibility without deleting |
| `qty` | number | Stock count; shows "Sold Out" when 0 |
| `tags` | array | Optional badges: `bestseller`, `new`, `limited` |
| `variants` | array | Size/flavor options with different prices |
| `customizationOptions` | object | Eggless toggle, custom message on cake, etc. |

### Pre-populated Product Entries to Create

Create one entry per image file. Derive the `name` from the filename (minus extension). Assign categories:

- **Cakes**: Chocolate raspberry cake, Chocolate strawberry cake, Layers chocolate, Lemon Blueberry, Blueberry lemon (+ variants 2/3/4), Chocolate Raspberry, Blueberry, Chocolate, Limoncello
- **Tarts**: Banana caramel walnut tart, Chocolate strawberry tart, Lemon meringue tart, Mocha Tart, Pistachio white chocolate tart
- **Cupcakes**: Chocolate hazelnut cupcake, Tiramisu cupcakes, Vanilla custard Cupcake
- **Brownies**: Brownies with topping

> Set placeholder prices (e.g., ₹350–₹900) — you'll update them later.

---

## 3. `index.html` — Page Layout

A single-page application with these sections (all loaded from one HTML file):

### 3.1 Header / Navbar
- **Logo**: `logo.png` on the left
- **Brand name**: `name.svg` rendered as an `<img>` (not text) centered or beside logo
- **Navigation links**: Home, Menu, About, Contact — smooth-scroll anchors
- **Cart icon**: Top-right with floating badge showing item count; clicking opens cart sidebar

### 3.2 Hero Section
- Full-width section with a warm bakery gradient/texture background
- Animated text: tagline like *"Baked with love, crafted with passion"*
- Call-to-action button: "Explore Our Menu" → scrolls to menu
- Subtle parallax or fade-in animation on scroll

### 3.3 Menu / Products Grid
- **Category filter bar** at top (tabs or pill buttons): All | Cakes | Tarts | Cupcakes | Brownies (loaded from `products.json` `categories` array)
- **Product cards** in a responsive CSS Grid (3 cols desktop, 2 tablet, 1 mobile):
  - Product image with lazy loading and soft hover zoom effect
  - Name, price, tag badge (if any)
  - "Quick View" button → opens product detail modal
  - "Add to Cart" button directly on card
- **Search bar** above grid for quick name filtering
- Items with `available: false` are hidden; `qty: 0` shows "Sold Out" overlay

### 3.4 Product Detail Modal
- Triggered on "Quick View" click
- Larger image, full description, variant selector (dropdown), quantity picker
- Customization toggles (eggless, message on cake — from JSON)
- Text input for cake message (if enabled)
- "Add to Cart" button
- Smooth open/close animation (scale + fade)

### 3.5 About Section
- Brief paragraph about Crumb & Cheese (editable text in JSON or hardcoded)
- Warm tone, maybe a decorative divider

### 3.6 Contact Section
- Display email, phone, Instagram/social links (configurable in JSON)
- A simple contact-form or just info display

### 3.7 Footer
- Logo, copyright text, social links
- "Made with ❤️ by Crumb & Cheese"

---

## 4. `style.css` — Visual Design (Not a Usual Website)

### 4.1 Design Direction: "Elegant Patisserie"
- **Color palette**: Deep chocolate brown (`#3E2723`), warm cream (`#FFF8E1`), rose gold accent (`#C9956B`), soft pink (`#F8BBD0`)
- **Typography**: Use Google Fonts — `Playfair Display` for headings (serif, elegant), `Lato` or `Poppins` for body (clean sans-serif)
- **Background**: Subtle texture (CSS noise/grain) or soft linen pattern — NOT a plain white page

### 4.2 Unique Touches (What Makes It "Not Usual")
- **Glassmorphism cards**: Product cards with frosted glass effect (`backdrop-filter: blur`) over a warm-toned background
- **Micro-interactions**: 
  - Cards tilt slightly on hover (CSS `perspective` + `transform`)
  - Add-to-cart button morphs with a checkmark animation on click
  - Cart icon bounces when item is added
- **Scroll animations**: Sections fade/slide in as user scrolls (use `IntersectionObserver` — no library needed)
- **Floating decorative elements**: Small SVG illustrations (croissant, whisk, etc.) that parallax on scroll — purely CSS
- **Custom cursor**: Optional — a small donut/cupcake cursor on desktop
- **Smooth page transitions**: CSS transitions on all interactive elements
- **Elegant modal**: Product detail modal with backdrop blur, smooth scale-in

### 4.3 Responsiveness
- Mobile-first design
- Hamburger menu on mobile (pure CSS toggle, no JS library)
- Cart becomes a full-screen overlay on mobile
- Touch-friendly: large tap targets, swipe-friendly

---

## 5. `script.js` — Core Logic

### 5.1 JSON Loader
```
On page load:
1. fetch('products.json')
2. Parse response
3. Dynamically generate category filter buttons from `categories` array
4. Dynamically render product cards into the grid
5. Attach event listeners for filter, search, quick-view, add-to-cart
```

- If `products.json` fails to load, show a friendly error message
- All product rendering is purely from JSON — zero hardcoded products in HTML

### 5.2 Category Filter & Search
- Clicking a category pill filters the grid (CSS class toggle — show/hide with animation)
- Search input filters by product name in real-time (debounced `keyup` listener)
- Both filters work together (category + search text)

### 5.3 Cart System (LocalStorage-based)
- **Cart data structure** stored in `localStorage`:
  ```json
  [
    {
      "productId": "banana-caramel-walnut-tart",
      "name": "Banana Caramel Walnut Tart",
      "variant": "Large",
      "price": 750,
      "quantity": 2,
      "eggless": true,
      "cakeMessage": "Happy Birthday!"
    }
  ]
  ```
- **Add to cart**: Push item with selected variant, qty, and customizations
- **Cart sidebar**: Slide-in panel from the right showing:
  - Item list with image thumbnail, name, variant, qty, price
  - Quantity +/- buttons per item
  - Remove item button
  - Subtotal and total calculation
  - "Proceed to Checkout" button
- **Badge count**: Update the cart icon badge on every change
- **Persistence**: Cart survives page reload via `localStorage`

### 5.4 Checkout Flow
When user clicks "Proceed to Checkout":

1. **Step 1 — User Details Form** (shown as a modal or new section):
   - Full Name (required)
   - Phone Number (required)
   - Email (optional)
   - Delivery Address (required)
   - Preferred Delivery Date (date picker)
   - Special Instructions (textarea)
   - "Proceed to Payment" button

2. **Step 2 — GPay Scanner Page**:
   - Display the total amount prominently
   - Show the GPay QR code image (`gpay-qr.png`) — user scans to pay
   - Alternatively, display a UPI payment link button (`upi://pay?pa=YOUR_UPI_ID&pn=Crumb%20%26%20Cheese&am=TOTAL&cu=INR`) that opens GPay directly on mobile
   - A "I've Completed Payment" button + transaction ID input field
   - Show order summary alongside the QR code

3. **Step 3 — Confirmation & Email**:
   - On clicking "I've Completed Payment":
     - Collect all data (user details + cart items + transaction ID)
     - Send email to `vineshcool1990@gmail.com` via **EmailJS** (see Step 6)
     - Show a success animation/page: "Order Placed! 🎉"
     - Clear the cart from `localStorage`

---

## 6. Email Integration — EmailJS (Free, No Backend Needed)

### Why EmailJS
- Pure frontend solution — no server, no Node.js, no hosting complexity
- Free tier: 200 emails/month (sufficient for a small bakery)
- Sends directly to `vineshcool1990@gmail.com`

### Setup Steps (One-Time)
1. Go to [emailjs.com](https://www.emailjs.com/) and create a free account
2. Add an **Email Service** → connect your Gmail (`vineshcool1990@gmail.com`)
3. Create an **Email Template** with these variables:
   - `{{customer_name}}`
   - `{{customer_phone}}`
   - `{{customer_email}}`
   - `{{delivery_address}}`
   - `{{delivery_date}}`
   - `{{special_instructions}}`
   - `{{order_items}}` (formatted string of all cart items)
   - `{{total_amount}}`
   - `{{transaction_id}}`
4. Note down: **Service ID**, **Template ID**, **Public Key**

### `emailjs-config.js`
```js
// Replace these with your actual EmailJS credentials
const EMAILJS_SERVICE_ID = 'your_service_id';
const EMAILJS_TEMPLATE_ID = 'your_template_id';
const EMAILJS_PUBLIC_KEY = 'your_public_key';
```

### In `script.js`
- Load EmailJS SDK via CDN `<script>` tag in HTML
- On "I've Completed Payment" click:
  - Build the template parameters object from cart + user form
  - Call `emailjs.send(serviceID, templateID, templateParams)`
  - Handle success → show confirmation
  - Handle failure → show retry option + display a fallback "contact us" message

### Email Content Will Include
```
New Order from Crumb & Cheese Website!

Customer: Vinesh Kumar
Phone: 9876543210
Email: customer@example.com
Address: 123, Baker Street, Chennai

Delivery Date: 25-Mar-2026
Special Instructions: Extra chocolate drizzle please

Order Items:
1. Banana Caramel Walnut Tart (Large) x2 — ₹1500
2. Tiramisu Cupcakes (Regular) x1 — ₹350

Total: ₹1850
Transaction ID: GPAY-ABC123XYZ
```

---

## 7. GPay QR Code Setup

### Option A — Static QR Code
- Generate a UPI QR code from any UPI app (GPay, PhonePe, etc.) for your UPI ID
- Save as `gpay-qr.png` in the project root
- This QR code won't have the amount pre-filled — user enters amount manually

### Option B — Dynamic UPI Link (Recommended)
- In `script.js`, dynamically generate a UPI deep link:
  ```
  upi://pay?pa=YOUR_UPI_ID@okaxis&pn=Crumb%20%26%20Cheese&am={TOTAL}&cu=INR
  ```
- Generate a QR code from this link at runtime using a lightweight JS library (`qrcode.js` — ~33KB, no dependencies)
- This pre-fills the exact amount → better UX
- On mobile: also show a "Pay with GPay" button that opens the UPI link directly

### Action Required
- [ ] Save your GPay/UPI QR image as `gpay-qr.png` in the project root
- [ ] Note down your UPI ID for the dynamic link approach

---

## 8. Implementation Order (Step-by-Step)

### Phase 1 — Foundation
| Step | Task | File(s) |
|------|------|---------|
| 1.1 | Create `products.json` with ALL 21 products populated | `products.json` |
| 1.2 | Create `index.html` with semantic structure (all sections) | `index.html` |
| 1.3 | Add Google Fonts, EmailJS CDN, and QR code library CDN to HTML `<head>` | `index.html` |

### Phase 2 — Styling
| Step | Task | File(s) |
|------|------|---------|
| 2.1 | Set up CSS variables (colors, fonts, spacing) | `style.css` |
| 2.2 | Style header/navbar with logo + name.svg + cart icon | `style.css` |
| 2.3 | Style hero section with gradient/texture and animations | `style.css` |
| 2.4 | Style product cards with glassmorphism and hover effects | `style.css` |
| 2.5 | Style product detail modal | `style.css` |
| 2.6 | Style cart sidebar | `style.css` |
| 2.7 | Style checkout flow (user form → GPay page → confirmation) | `style.css` |
| 2.8 | Style footer and about/contact sections | `style.css` |
| 2.9 | Add responsive breakpoints (mobile, tablet, desktop) | `style.css` |
| 2.10 | Add scroll animations and micro-interactions | `style.css` |

### Phase 3 — Functionality
| Step | Task | File(s) |
|------|------|---------|
| 3.1 | Implement JSON loader → render products dynamically | `script.js` |
| 3.2 | Implement category filter + search bar | `script.js` |
| 3.3 | Implement product detail modal (open/close + variant picker) | `script.js` |
| 3.4 | Implement cart system (add, remove, update qty, localStorage) | `script.js` |
| 3.5 | Implement cart sidebar UI (slide-in, item list, totals) | `script.js` |
| 3.6 | Implement checkout Step 1 — user details form with validation | `script.js` |
| 3.7 | Implement checkout Step 2 — GPay QR display + UPI link + dynamic QR | `script.js` |
| 3.8 | Implement checkout Step 3 — EmailJS integration + confirmation | `script.js`, `emailjs-config.js` |

### Phase 4 — Polish
| Step | Task | File(s) |
|------|------|---------|
| 4.1 | Add loading skeleton/spinner while JSON loads | `style.css`, `script.js` |
| 4.2 | Add smooth scroll behavior | `style.css` |
| 4.3 | Add "Sold Out" overlay for qty=0 items | `style.css`, `script.js` |
| 4.4 | Add tag badges (bestseller, new) on cards | `style.css`, `script.js` |
| 4.5 | Test on mobile, tablet, desktop | — |
| 4.6 | Test full checkout flow (form → GPay → email received) | — |

---

## 9. External Dependencies (CDN Only — No Build Tools)

| Library | Purpose | CDN |
|---------|---------|-----|
| Google Fonts | Playfair Display + Poppins | `fonts.googleapis.com` |
| EmailJS SDK | Send order email from frontend | `cdn.jsdelivr.net/npm/@emailjs/browser` |
| QRCode.js | Generate dynamic UPI QR codes | `cdn.jsdelivr.net/npm/qrcodejs` |

**No npm, no bundler, no framework.** Pure HTML + CSS + vanilla JS. Open `index.html` in a browser and it works.

---

## 10. Verification & Testing

### Functional Tests
- [ ] All 21 products render from `products.json`
- [ ] Adding a new product to JSON → appears on site after refresh
- [ ] Setting `available: false` → item disappears
- [ ] Setting `qty: 0` → shows "Sold Out"
- [ ] Category filter shows only matching products
- [ ] Search filters by name in real-time
- [ ] Product modal opens with correct details and variants
- [ ] Add to cart works (with variant, qty, customizations)
- [ ] Cart persists across page reload (localStorage)
- [ ] Cart sidebar shows correct items and totals
- [ ] Checkout form validates required fields
- [ ] GPay QR page shows correct total amount
- [ ] UPI deep link opens payment app on mobile
- [ ] Email arrives at `vineshcool1990@gmail.com` with full order details
- [ ] Cart clears after successful order
- [ ] Confirmation page shows

### Visual Tests
- [ ] Glassmorphism cards render correctly in Chrome, Firefox, Edge
- [ ] Hover animations are smooth (no jank)
- [ ] Mobile layout is clean and usable
- [ ] Logo and name.svg display correctly
- [ ] All product images load (check console for 404s)
- [ ] Scroll animations trigger at correct positions

### How to Run
1. Open `index.html` in any modern browser (Chrome recommended)
2. For EmailJS to work, you may need to serve via a local server:
   - VS Code: Use "Live Server" extension → right-click `index.html` → "Open with Live Server"
   - Or run: `python -m http.server 8000` in the project folder

---

## 11. Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Tech stack | Vanilla HTML/CSS/JS | No build tools, zero complexity, easy for non-devs to edit |
| Email delivery | EmailJS (free tier) | No backend server needed; 200 emails/month is enough |
| Payment | GPay QR + UPI deep link | No payment gateway fees, no merchant account needed |
| Data source | Single `products.json` | One file to edit = maximum simplicity for owner |
| Cart storage | localStorage | Persists across refresh, no database needed |
| QR generation | QRCode.js | Dynamic QR with pre-filled amount for better UX |
| Design style | Glassmorphism + serif fonts | Elevated, premium patisserie feel (not generic) |
| Image source | Existing `CNC website/` folder | Filenames become product names — no renaming needed |

---

## 12. Future Enhancements (Out of Scope for Now)

- WhatsApp order notification (via WhatsApp API link)
- Instagram feed integration
- Customer reviews section
- Order tracking
- Admin panel for managing products (instead of editing JSON)
- Hosting on GitHub Pages or Netlify (free)
