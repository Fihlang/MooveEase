import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function AppPreview() {
  const { user } = useAuth();

  return (
    <div className="bg-primary-50 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">The MoveEase Dashboard</h2>
            <p className="mt-4 text-lg text-gray-500">
              Track your furniture moves in real-time, view your booking history, and manage your account all in one place.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Real-time Tracking</h3>
                  <p className="mt-1 text-gray-500">See exactly where your furniture is during transit with live GPS updates.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Secure Payments</h3>
                  <p className="mt-1 text-gray-500">Pay securely through our platform with multiple payment options.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Booking History</h3>
                  <p className="mt-1 text-gray-500">Access all your past and upcoming bookings in one convenient location.</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              {user ? (
                <Link href="/dashboard">
                  <Button className="inline-flex items-center">
                    Try the Dashboard
                    <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button className="inline-flex items-center">
                    Sign up to get started
                    <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
          <div className="relative shadow-xl rounded-2xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1567789884554-0b844b597180?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
              alt="Mobile app dashboard preview" 
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-primary opacity-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
