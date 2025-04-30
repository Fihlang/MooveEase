import { Link } from "wouter";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <span className="text-white font-bold text-2xl">MoveEase</span>
            <p className="text-gray-300 text-base">
              Making furniture moving simple, safe, and affordable. Connect with professional movers in your area in minutes.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Services</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="#">
                      <a className="text-base text-gray-300 hover:text-white">Small Moves</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <a className="text-base text-gray-300 hover:text-white">Large Furniture</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <a className="text-base text-gray-300 hover:text-white">Specialty Items</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <a className="text-base text-gray-300 hover:text-white">Pricing</a>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="#">
                      <a className="text-base text-gray-300 hover:text-white">Help Center</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <a className="text-base text-gray-300 hover:text-white">Contact Us</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <a className="text-base text-gray-300 hover:text-white">FAQ</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <a className="text-base text-gray-300 hover:text-white">Safety</a>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="#">
                      <a className="text-base text-gray-300 hover:text-white">About</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <a className="text-base text-gray-300 hover:text-white">Blog</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <a className="text-base text-gray-300 hover:text-white">Careers</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <a className="text-base text-gray-300 hover:text-white">Press</a>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link href="#">
                      <a className="text-base text-gray-300 hover:text-white">Privacy</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <a className="text-base text-gray-300 hover:text-white">Terms</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <a className="text-base text-gray-300 hover:text-white">Cookie Policy</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <a className="text-base text-gray-300 hover:text-white">Licenses</a>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {new Date().getFullYear()} MoveEase, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
