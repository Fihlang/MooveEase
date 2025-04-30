import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          <span className="block">MoveEase</span>
          <span className="block text-primary mt-2">Moving Made Easy</span>
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl">
          Connect with professional movers to help transport your furniture safely and efficiently.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/auth">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Easy Booking</h3>
          <p className="text-gray-600">Book your furniture move in minutes with our simple interface.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Professional Movers</h3>
          <p className="text-gray-600">Connect with vetted professional movers who specialize in handling furniture.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Real-time Tracking</h3>
          <p className="text-gray-600">Track your furniture's journey in real-time with our GPS tracking system.</p>
        </div>
      </div>
    </div>
  );
}