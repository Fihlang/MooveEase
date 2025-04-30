import { Clipboard, MessageSquare, CheckCircle } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "Book Your Move",
      description: "Enter your pickup and dropoff locations, describe your furniture, and select a time that works for you.",
      icon: <Clipboard className="h-6 w-6 text-primary" />,
    },
    {
      id: 2,
      title: "Connect with Movers",
      description: "Professional movers will accept your job. Track their arrival in real-time and communicate directly.",
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
    },
    {
      id: 3,
      title: "Relax and Rate",
      description: "Your furniture gets moved safely to its destination. After delivery, rate your experience and provide feedback.",
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
    },
  ];

  return (
    <div id="how-it-works" className="bg-gray-50 py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">How It Works</h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Moving furniture has never been easier. Just follow these simple steps.
          </p>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.id} className="bg-white rounded-lg shadow-sm p-6 relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                  {step.id}
                </div>
                <div className="h-12 w-12 rounded-md bg-primary-50 flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                <p className="mt-2 text-base text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
