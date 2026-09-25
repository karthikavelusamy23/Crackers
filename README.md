# Sovereign Pyrotechnics — Premium Festive E-Commerce Platform

This is a multi-page, responsive, and accessible festive e-commerce platform for Sovereign Pyrotechnics (Sivakasi Direct Green Fireworks). Every route preserves the architectural design, Tailwind configuration, typography, imagery, and interactive cart system.

---

## Routes

- `/` — Main Homepage & Festival Mega Combos
- `/home_bright_pastel_festive_edition/` — Home (Bright Pastel Festive Edition)
- `/products_bright_pastel_festive_catalog/` — Full 30-Item Product Catalog with Live Filtering, Sorting, Modal Gallery & Quick Add
- `/product_detail_120_shot_brocade_bright_pastel_edition/` — Product Detail Page (120-Shot Aerial Brocade)
- `/billing_checkout_bright_pastel_edition/` — Express Checkout & Burst Box Review
- `/payment_confirmation_order_status_sovereign_pyrotechnics/` — Order Confirmation & Sivakasi Dispatch Tracker
- `/about_us_heritage_purity_editorial_modern_edition/` — Heritage, Purity & Sivakasi Green Pyrotechnic Artistry
- `/contact_store_locator_bright_pastel_edition/` — Factory Outlets, Express Desk & WhatsApp Direct Inquiries

---

## Product Catalog Expansion (30 Items Total)

The catalog has been expanded with 20 brand new items (IDs 11 to 30) adhering to the exact data structure, category taxonomy, rating schema, and cart integration contracts:

1. **Sparklers:** Ruby Radiance Giant Sparklers (10 Pcs), Silver Cascade Micro Sparklers (20 Pcs), 24-Karat Gold Sparklers, Electric Star Sparklers.
2. **Ground Chakkars:** Tri-Color Spinning Chakkar Wheel (5 Pcs), Golden Giant Jumbo Chakkar (3 Pcs), Dancing Peacock Deluxe Chakkar.
3. **Flower Pots:** Multi-Color Rainbow Fountain (5 Pcs), Golden Willow Jumbo Flower Pot (3 Pcs), Majestic Silver Brocade Fountain Pot.
4. **Sky Rockets:** Thunder King Sound Rocket (5 Pcs), Whistling Tornado Sky Rockets (5 Pcs), Royal Saffron Whistling Rocket Flight, Sovereign Falcon Aerial Sky Rocket.
5. **Garlands (Laris):** 2000 Wala Royal Festival Lari, 5000 Wala Deluxe Celebration Garland, 1000 Wala Traditional Red Garland.
6. **Fancy Items:** Celestial Dragon 100-Shot Aerial Cake, Midnight Diamond Strobe Cake, Blossom Rain 30-Shot Fan Cake, Deluxe Golden Palm 75-Shot Cake, Neon Comet 25-Shot Rapid Sky Repeater, Golden Peacock Imperial Novelty, Electric Sizzle Color Crackling Balls, Emerald Matrix 60-Shot Cake, Sovereign Crown 240-Shot Finale Cake, The Royal Emperor Multi-Color Repeater.
7. **Gift Hampers & Boxes:** Sivakasi Rajah Deluxe Family Gift Box (42 Items), Emperor Heritage VIP Celebration Trunk (60 Items), Maharaja Grand Imperial Festive Hamper (32 Items).

---

## Visual Design & Color Palette

The platform employs a vibrant, sun-drenched festive color palette:

- **Primary Brand Action (`#D92500`):** Core call-to-action buttons, active badges, and discount highlights.
- **Primary Hover (`#B31A00`):** Interactive hover state for buttons.
- **Primary Container (`#FF3B14`):** High-energy highlight bursts.
- **Secondary Saffron Container (`#FF961F`):** Secondary tags, border accents, and active focus boundaries.
- **Rich Sienna (`#A05200`):** Secondary headers and icons.
- **Imperial Antique Gold (`#E5A910` / `#E5BA73`):** Heirloom seals, star ratings, and borders.
- **Warm Canvas Surfaces:** `#FFFDF9` / `#FFFDF8` (Ivory base), `#FFF8EB` (Champagne container), `#FFF1EC` (Blush accent).

Canonical design specifications are maintained in `stitch_premium_fireworks_e_commerce_platform/imperial_festive_luxury/DESIGN.md`.

---

## Animation & Motion Integration

- **Entrance Animations (`cardEntrance`):** Smooth, staggered entrance for product cards (`transform: translateY(16px) scale(0.985)` to normal) with `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Card Hover Effects:** Subtle lift (`translateY(-5px)`) accompanied by warm gold-saffron shadow glows (`0 16px 32px -8px rgba(217, 37, 0, 0.18)`).
- **Image Hover Zoom:** Smooth `scale(1.06)` zoom on card thumbnail hover.
- **Button Micro-interactions:** Tactile feedback on tap/hover (`active:scale-95`).
- **Motion Accessibility:** Full `@media (prefers-reduced-motion: reduce)` support instantly zeroing transition durations for users preferring minimal motion.

---

## Preview & Local Execution

Open `index.html` in any modern web browser or serve the folder using any standard HTTP server (e.g. `npx serve .` or `python -m http.server`).
