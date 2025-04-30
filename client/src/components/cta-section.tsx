import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export function CTASection() {
  const { user } = useAuth();

  return (
    <div className="bg-primary-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <span className="block">Ready to move your furniture?</span>
          <span className="block text-primary-300">Get started with MoveEase today.</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="inline-flex rounded-md shadow">
            {user ? (
              <Link href="/booking">
                <Button className="w-full bg-white text-primary hover:bg-gray-50">
                  Book Now
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button className="w-full bg-white text-primary hover:bg-gray-50">
                  Book Now
                </Button>
              </Link>
            )}
          </div>
          <div className="ml-3 inline-flex rounded-md shadow">
            <Link href="#how-it-works">
              <Button variant="secondary" className="w-full bg-primary-600 bg-opacity-70 hover:bg-opacity-80 text-white">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
