import { createRoot } from "react-dom/client";
import "./index.css";
import LandingPage from "./pages/landing-page";

function TempApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">MoveEase</h1>
        </div>
      </header>
      <main>
        <LandingPage />
      </main>
      <footer className="bg-gray-100 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500">
          © 2025 MoveEase. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<TempApp />);
