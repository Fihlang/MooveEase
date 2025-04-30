import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRole } from "@shared/schema";

export function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/#services" },
    { name: "How It Works", path: "/#how-it-works" },
    { name: "About", path: "/#about" },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="font-bold text-2xl text-primary">MoveEase</a>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <a
                    className={`${
                      isActive(link.path)
                        ? "border-primary text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full`}
                  >
                    {link.name}
                  </a>
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/booking">
                  <Button variant="outline">Book a Move</Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <User size={16} />
                      {user.fullName.split(" ")[0]}
                      <ChevronDown size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <a className="cursor-pointer w-full">Dashboard</a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link href="/auth">
                  <a className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Log in</a>
                </Link>
                <Link href="/auth">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open main menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="py-4 space-y-4">
                  <div className="flex items-center mb-8">
                    <Link href="/" onClick={() => setIsMenuOpen(false)}>
                      <a className="font-bold text-2xl text-primary">MoveEase</a>
                    </Link>
                  </div>
                  
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <a
                        className={`${
                          isActive(link.path)
                            ? "bg-primary-50 border-primary-500 text-primary-700"
                            : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                        } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                      >
                        {link.name}
                      </a>
                    </Link>
                  ))}
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    {user ? (
                      <>
                        <div className="flex items-center px-4 py-2">
                          <User className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="font-medium">{user.fullName}</span>
                        </div>
                        <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                          <a className="block border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                            Dashboard
                          </a>
                        </Link>
                        <Link href="/booking" onClick={() => setIsMenuOpen(false)}>
                          <a className="block border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                            Book a Move
                          </a>
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-red-600 hover:bg-gray-50 hover:border-red-300"
                        >
                          <LogOut className="h-5 w-5 mr-2" />
                          Log out
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col space-y-2 px-4">
                        <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                          <a className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium">
                            Log in
                          </a>
                        </Link>
                        <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                          <Button className="w-full">Sign up</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
