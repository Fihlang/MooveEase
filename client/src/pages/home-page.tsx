import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { HowItWorks } from "@/components/how-it-works";
import { Services } from "@/components/services";
import { BookingForm } from "@/components/booking-form";
import { Testimonials } from "@/components/testimonials";
import { AppPreview } from "@/components/app-preview";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <HowItWorks />
        <Services />
        
        {/* Booking Section */}
        <div id="booking" className="bg-gray-50 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Book Your Move</h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                Get an instant quote and book your furniture move in minutes.
              </p>
            </div>

            <div className="mt-12 bg-white rounded-lg shadow-sm overflow-hidden">
              {user ? (
                <BookingForm />
              ) : (
                <div className="p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sign in to book a move</h3>
                  <p className="text-gray-500 mb-6">
                    You need to be signed in to book a furniture move. Please sign in or create an account to continue.
                  </p>
                  <div className="flex justify-center">
                    <a href="/auth" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      Sign in or Register
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Testimonials />
        <AppPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
