-- Run this once after 001_create_products_table.sql, to load your existing
-- catalogue into Supabase. Photos aren't included here — after running this,
-- open each product in /admin and upload its photo(s) through the form.

insert into products (category, name, price, description, variants) values
  ('Sarees', 'Temple Border Saree', 4200,
   'Traditional saree with rich temple motifs, premium finish, and an elegant drape for festive occasions.',
   '[{"id":"v1","color":"","hex":"#7a1f22","images":[]}]'),

  ('Sarees', 'Designer Cotton Saree', 2600,
   'Lightweight cotton saree crafted for comfort, style, and everyday grace with a soft woven finish.',
   '[{"id":"v1","color":"","hex":"#7a1f22","images":[]}]'),

  ('Sarees', 'Festive Silk Saree', 5600,
   'A graceful silk saree with a vibrant border and classic patterns suited for celebrations and functions.',
   '[{"id":"v1","color":"","hex":"#7a1f22","images":[]}]'),

  ('Sarees', 'Royal Woven Saree', 6100,
   'A richly woven saree with a regal finish designed to stand out at weddings, poojas, and evening gatherings.',
   '[{"id":"v1","color":"","hex":"#7a1f22","images":[]}]'),

  ('Madisars', 'Classic Madisar', 3800,
   'Traditional madisar drape in a refined style, designed for pooja days and special family occasions.',
   '[{"id":"v1","color":"","hex":"#7a1f22","images":[]}]'),

  ('Madisars', 'Festival Madisar Set', 4500,
   'Elegant madisar styling with a polished drape and graceful finish that pairs beautifully with festive jewellery.',
   '[{"id":"v1","color":"","hex":"#7a1f22","images":[]}]'),

  ('Madisars', 'Premium Pleated Madisar', 4900,
   'Contemporary interpretation of the classic madisar, balancing tradition with a neat modern silhouette.',
   '[{"id":"v1","color":"","hex":"#7a1f22","images":[]}]'),

  ('Madisars', 'Pearl Finish Madisar', 5200,
   'A refined madisar with delicate detailing and a polished drape crafted for festive grace and pooja elegance.',
   '[{"id":"v1","color":"","hex":"#7a1f22","images":[]}]'),

  ('Madisars', 'Minimal Classic Madisar', 4100,
   'A graceful, understated design that keeps the traditional form intact while feeling light and comfortable.',
   '[{"id":"v1","color":"","hex":"#7a1f22","images":[]}]'),

  ('Madisars', 'Temple Occasion Madisar', 5600,
   'Elegant styling with a ceremonial finish ideal for temple visits, family functions, and traditional events.',
   '[{"id":"v1","color":"","hex":"#7a1f22","images":[]}]'),

  ('Kurtis', 'Printed Cotton Kurti', 1200,
   'Everyday cotton kurti with a flattering silhouette and subtle print work for easy styling.',
   '[{"id":"v1","color":"","hex":"#7a1f22","images":[]}]'),

  ('Kurtis', 'Embroidered Kurti', 1800,
   'Comfortable and stylish kurti featuring detailed thread work and a semi-formal finish.',
   '[{"id":"v1","color":"","hex":"#7a1f22","images":[]}]'),

  ('Kurtis', 'Festive Kurti', 2200,
   'A statement kurti for celebrations with elegant detailing and rich fabric texture.',
   '[{"id":"v1","color":"","hex":"#7a1f22","images":[]}]'),

  ('Kurtis', 'Classic Day Wear Kurti', 1600,
   'A versatile kurti designed for everyday elegance with an easy fit and graceful finish.',
   '[{"id":"v1","color":"","hex":"#7a1f22","images":[]}]');
