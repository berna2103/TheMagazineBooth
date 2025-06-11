import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { Cta } from './components/Cta';
import { Footer } from './components/Footer';
import { Faq } from './components/FAQ';
import { QuoteForm } from './components/QuoteForm';
import { Gallery } from './components/Gallery';

export default function HomePage() {
  return (
    <main className="bg-white">
      <Hero />
      <Features />
      <Gallery />
      <HowItWorks />
      <Faq/>
      <QuoteForm/>
      <Cta />
      <Footer />
    </main>
  );
}