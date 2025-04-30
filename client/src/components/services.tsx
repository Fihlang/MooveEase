import { Link } from "wouter";

interface ServiceCardProps {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
}

function ServiceCard({ title, description, price, imageUrl }: ServiceCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md service-card">
      <img className="h-48 w-full object-cover" src={imageUrl} alt={title} />
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
        <div className="mt-4">
          <span className="text-primary font-medium">{price}</span>
        </div>
      </div>
    </div>
  );
}

export function Services() {
  const services = [
    {
      title: "Small Furniture Move",
      description: "Perfect for moving single items like desks, chairs, or small tables across town.",
      price: "From $29.99",
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      title: "Large Furniture Move",
      description: "Ideal for moving sofas, beds, large tables, and multiple items requiring multiple movers.",
      price: "From $79.99",
      imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      title: "Specialty Item Move",
      description: "For delicate, valuable or extra-large items requiring special care and handling.",
      price: "From $99.99",
      imageUrl: "https://images.unsplash.com/photo-1627394678696-1767d153eec9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
  ];

  return (
    <div id="services" className="bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Services</h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            We offer a range of furniture moving services to meet your needs.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.title}
              title={service.title}
              description={service.description}
              price={service.price}
              imageUrl={service.imageUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
