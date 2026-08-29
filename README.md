# Jabha Fashions — Website

A React + Vite site for Jabha Fashions: a landing page that displays products
and services (no cart, no checkout — just a catalogue), plus a simple admin
page to manage products.

## Getting started

```bash
npm install
npm run dev       # local development, http://localhost:5173
npm run build     # production build, output in dist/
```

## Project structure

```
src/
  Components/
    Navbar/     — top nav with responsive hamburger menu
    Hero/       — "Beauty lies within…" intro section
    Products/   — product grid, filterable by category
    Services/   — customization services list
    About/      — about section
    Footer/     — site footer
    Home/       — assembles all of the above into the landing page
    Admin/      — admin login + dashboard (see below)
  context/
    ProductsContext.jsx  — holds product data, saved to the browser's storage
  data/
    initialProducts.js   — starting products + category list
    servicesData.js       — the 5 services shown on the page
  App.jsx        — routes: "/" (site) and "/admin" (admin page)
```

## Managing products

Go to `/admin` (e.g. `http://localhost:5173/admin`).

- **Password:** `jabha2026` — change this in
  `src/Components/Admin/AdminLogin.jsx` (the `ADMIN_PASSWORD` constant)
  before this site goes live.
- From the dashboard you can **add**, **edit**, and **delete** products —
  name, category, price, description, and image (paste a URL or upload a
  file from your computer).
- Product changes are saved in the browser's local storage, so they persist
  between visits on the same device/browser. There is no shared database —
  if you need the same catalogue to show up for every visitor from a single
  source of truth, this project would need a small backend added later.

### A note on the admin password

This is a front-end-only password gate — good enough to keep casual
visitors out, but anyone who inspects the site's code could find the
password in it. If you need real access control (e.g. multiple staff
logins), that requires a backend to check credentials server-side rather
than in the browser.

## Editing categories

The five product categories (Sarees, Madisars, Kurtis, Amman Vastras, Mens
Collections) live in `src/data/initialProducts.js` as `CATEGORIES`. Add or
rename entries there and they'll show up in the admin category dropdown and
the product filter on the site.

## Editing services

The five services shown on the page are static content in
`src/data/servicesData.js` — edit that file directly to change their names
or descriptions.

## Design

Colors, fonts, and spacing are defined as CSS variables in `src/index.css`
(cream background, maroon + terracotta accents, a script font for the
tagline, Playfair Display for headings, Poppins for body text) — matching
the brand direction from the original design.
