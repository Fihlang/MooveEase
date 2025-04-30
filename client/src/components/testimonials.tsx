import { Star } from "lucide-react";

interface TestimonialProps {
  name: string;
  initials: string;
  rating: number;
  comment: string;
}

function Testimonial({ name, initials, rating, comment }: TestimonialProps) {
  const stars = Array(5).fill(0).map((_, index) => (
    <Star
      key={index}
      className={`h-5 w-5 ${index < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
    />
  ));

  return (
    <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 font-medium text-lg">{initials}</span>
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{name}</h3>
          <div className="flex">{stars}</div>
        </div>
      </div>
      <p className="text-gray-600">{comment}</p>
    </div>
  );
}

export function Testimonials() {
  const testimonials = [
    {
      name: "John Doe",
      initials: "JD",
      rating: 5,
      comment:
        "\"The movers arrived on time and were extremely professional. They handled my antique furniture with great care. Would definitely use this service again!\"",
    },
    {
      name: "Sarah Smith",
      initials: "SS",
      rating: 4,
      comment:
        "\"This app saved me so much time! I was able to book a mover for my sofa within minutes, and the price was very reasonable. The tracking feature was really helpful too.\"",
    },
    {
      name: "Robert Johnson",
      initials: "RJ",
      rating: 5,
      comment:
        "\"As someone who moves frequently for work, this app has been a game-changer. The movers are vetted professionals, and I love being able to track my furniture's journey in real-time.\"",
    },
  ];

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">What Our Customers Say</h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Don't just take our word for it. Here's what satisfied customers have to say about our service.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Testimonial
              key={testimonial.name}
              name={testimonial.name}
              initials={testimonial.initials}
              rating={testimonial.rating}
              comment={testimonial.comment}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
