import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BookingForm } from "@/components/booking-form";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { UserRole } from "@shared/schema";

export default function BookingPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Handle successful booking
  const handleBookingSuccess = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Book Your Furniture Move</h1>
            <p className="mt-2 text-gray-600">
              Fill out the form below to schedule a furniture move with professional movers
            </p>
          </div>

          {/* Verify the user is a customer before showing booking form */}
          {user ? (
            user.role === UserRole.CUSTOMER ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <BookingForm onSuccess={handleBookingSuccess} />
              </div>
            ) : (
              <div className="text-center bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {user.role === UserRole.MOVER 
                    ? "Movers cannot book furniture moves" 
                    : "Admin users cannot book furniture moves"}
                </h2>
                <p className="text-gray-600 mb-6">
                  {user.role === UserRole.MOVER 
                    ? "As a mover, you can only accept and complete jobs from customers." 
                    : "As an admin, you oversee the platform but cannot book moves directly."}
                </p>
                <div className="flex justify-center">
                  <Link href="/dashboard">
                    <Button variant="default">Go to Dashboard</Button>
                  </Link>
                </div>
              </div>
            )
          ) : (
            <div className="text-center bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Sign in to book a move
              </h2>
              <p className="text-gray-600 mb-6">
                You need to be signed in as a customer to book a furniture move. Please sign in or create an account to continue.
              </p>
              <div className="flex justify-center">
                <Link href="/auth">
                  <Button variant="default">Sign in or Register</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
