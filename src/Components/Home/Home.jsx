import Navbar from '../Navbar/Navbar';
import Hero from '../Hero/Hero';
import Products from '../Products/Products';
import Services from '../Services/Services';
import About from '../About/About';
import Footer from '../Footer/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Products />
        <Services />
        <About />
      </main>
      <Footer />
    </>
  );
}
