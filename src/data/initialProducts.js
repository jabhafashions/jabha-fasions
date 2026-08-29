// Starting catalogue shown the first time the site runs.
// Everything here can be edited, removed, or added to from /admin —
// changes are saved to this browser's storage.
import { productImage } from '../utils/productImages';

export const CATEGORIES = ['Sarees', 'Madisars', 'Kurtis'];

export const initialProducts = [
  {
    id: 'p1',
    category: 'Sarees',
    name: 'Temple Border Saree',
    price: 4200,
    description:
      'Traditional saree with rich temple motifs, premium finish, and an elegant drape for festive occasions.',
    image: productImage('sarees', 1),
  },
  {
    id: 'p2',
    category: 'Sarees',
    name: 'Designer Cotton Saree',
    price: 2600,
    description:
      'Lightweight cotton saree crafted for comfort, style, and everyday grace with a soft woven finish.',
    image: productImage('sarees', 2),
  },
  {
    id: 'p3',
    category: 'Sarees',
    name: 'Festive Silk Saree',
    price: 5600,
    description:
      'A graceful silk saree with a vibrant border and classic patterns suited for celebrations and functions.',
    image: productImage('sarees', 3),
  },
  {
    id: 'p4',
    category: 'Madisars',
    name: 'Classic Madisar',
    price: 3800,
    description:
      'Traditional madisar drape in a refined style, designed for pooja days and special family occasions.',
    image: productImage('Madisars', 1),
  },
  {
    id: 'p5',
    category: 'Madisars',
    name: 'Festival Madisar Set',
    price: 4500,
    description:
      'Elegant madisar styling with a polished drape and graceful finish that pairs beautifully with festive jewellery.',
    image: productImage('Madisars', 2),
  },
  {
    id: 'p6',
    category: 'Madisars',
    name: 'Premium Pleated Madisar',
    price: 4900,
    description:
      'Contemporary interpretation of the classic madisar, balancing tradition with a neat modern silhouette.',
    image: productImage('Madisars', 3),
  },
  {
    id: 'p7',
    category: 'Madisars',
    name: 'Pearl Finish Madisar',
    price: 5200,
    description:
      'A refined madisar with delicate detailing and a polished drape crafted for festive grace and pooja elegance.',
    image: productImage('Madisars', 4),
  },
  {
    id: 'p8',
    category: 'Madisars',
    name: 'Minimal Classic Madisar',
    price: 4100,
    description:
      'A graceful, understated design that keeps the traditional form intact while feeling light and comfortable.',
    image: productImage('Madisars', 5),
  },
  {
    id: 'p9',
    category: 'Madisars',
    name: 'Temple Occasion Madisar',
    price: 5600,
    description:
      'Elegant styling with a ceremonial finish ideal for temple visits, family functions, and traditional events.',
    image: productImage('Madisars', 6),
  },
  {
    id: 'p10',
    category: 'Kurtis',
    name: 'Printed Cotton Kurti',
    price: 1200,
    description:
      'Everyday cotton kurti with a flattering silhouette and subtle print work for easy styling.',
    image: productImage('Kurtis', 1),
  },
  {
    id: 'p11',
    category: 'Kurtis',
    name: 'Embroidered Kurti',
    price: 1800,
    description:
      'Comfortable and stylish kurti featuring detailed thread work and a semi-formal finish.',
    image: productImage('Kurtis', 2),
  },
  {
    id: 'p12',
    category: 'Kurtis',
    name: 'Festive Kurti',
    price: 2200,
    description:
      'A statement kurti for celebrations with elegant detailing and rich fabric texture.',
    image: productImage('Kurtis', 3),
  },
  {
    id: 'p13',
    category: 'Kurtis',
    name: 'Classic Day Wear Kurti',
    price: 1600,
    description:
      'A versatile kurti designed for everyday elegance with an easy fit and graceful finish.',
    image: productImage('Kurtis', 4),
  },
];