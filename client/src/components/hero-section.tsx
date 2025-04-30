import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";

export function HeroSection() {
  const { user } = useAuth();

  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Move your furniture</span>{" "}
                <span className="block text-primary xl:inline">with ease</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Book professional movers for your furniture in minutes. Safe, reliable, and affordable service at your fingertips.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  {user?.role === UserRole.CUSTOMER ? (
                    <Link href="/booking">
                      <Button size="lg" className="w-full">Book Now</Button>
                    </Link>
                  ) : user?.role === UserRole.MOVER ? (
                    <Link href="/dashboard">
                      <Button size="lg" className="w-full">View Jobs</Button>
                    </Link>
                  ) : user?.role === UserRole.ADMIN ? (
                    <Link href="/dashboard">
                      <Button size="lg" className="w-full">Admin Dashboard</Button>
                    </Link>
                  ) : (
                    <Link href="/auth">
                      <Button size="lg" className="w-full">Book Now</Button>
                    </Link>
                  )}
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  {!user ? (
                    <Link href="/auth">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full bg-primary-100 text-primary-700 hover:bg-primary-200"
                      >
                        Become a Mover
                      </Button>
                    </Link>
                  ) : user.role === UserRole.CUSTOMER ? (
                    <Link href="#how-it-works">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full bg-primary-100 text-primary-700 hover:bg-primary-200"
                      >
                        How It Works
                      </Button>
                    </Link>
                  ) : (
                    <Link href="#services">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full bg-primary-100 text-primary-700 hover:bg-primary-200"
                      >
                        Our Services
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1591269469224-d60c910057ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
          alt="Movers carrying a sofa"
        />
      </div>
    </div>
  );
}
