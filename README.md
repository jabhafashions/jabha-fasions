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

- Sign in with a Supabase Auth account whose server-managed `app_metadata`
  contains `"role": "admin"`. Set this metadata using a trusted Supabase
  Dashboard or server-side admin workflow; do not set it from the client or
  use user-editable `user_metadata` for authorization. There is no email
  allowlist in the frontend.
- From the dashboard you can **add**, **edit**, and **delete** products —
  name, category, price, description, and image (paste a URL or upload a
  file from your computer).
- The frontend hides the dashboard from non-admin accounts, and Supabase
  row-level security enforces the same role for database and image changes.
  After promoting an account, sign out and back in so its JWT includes the
  updated role.
- On an existing database, run
  [`supabase/005_require_admin_role.sql`](./supabase/005_require_admin_role.sql)
  after the product, category, order, and storage policies have been set up.

## Editing categories

Categories are managed from the Categories panel at the top of the Products
tab in `/admin`. To set up category storage, run
[`supabase/004_create_categories_table.sql`](./supabase/004_create_categories_table.sql)
in the Supabase SQL Editor after the products table has been created. Existing
categories remain visible while their products exist, even if the category
row is removed.

## Editing services

The five services shown on the page are static content in
`src/data/servicesData.js` — edit that file directly to change their names
or descriptions.

## Design

Colors, fonts, and spacing are defined as CSS variables in `src/index.css`
(cream background, maroon + terracotta accents, a script font for the
tagline, Playfair Display for headings, Poppins for body text) — matching
the brand direction from the original design.
