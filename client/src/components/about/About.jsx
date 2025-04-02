import styles from './About.module.css';

const TEAM_MEMBERS = [
  {
    id: 1,
    name: "John Smith",
    role: "CEO & Founder",
    image: "/images/shipman-northcutt-sgZX15Da8YE-unsplash.jpg",
    bio: "John founded FruVida with a vision to make fresh, organic produce accessible to everyone."
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Head of Operations",
    image: "/images/julia-rekamie-Z72YujnOrlY-unsplash.jpg",
    bio: "Sarah ensures smooth operations and maintains our high quality standards."
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "Lead Nutritionist",
    image: "/images/alireza-heidarpour-0FW20hVjtck-unsplash.jpg",
    bio: "Michael helps curate our product selection for maximum health benefits."
  },
  {
    id: 4,
    name: "Emma Davis",
    role: "Customer Relations",
    image: "/images/jaishree-hotchandani-koFxncdbXnE-unsplash.jpg",
    bio: "Emma leads our customer service team and ensures client satisfaction."
  }
];

export default function About() {
  return (
    <div>
      {/* Hero Section with Background */}
      <div className="relative py-16 bg-[url('/images/background.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Our Mission</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              At FruVida, we're committed to bringing the freshest, highest-quality organic produce 
              directly to your doorstep. Our mission is to make healthy living accessible and enjoyable for everyone.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Story Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Our Story</h2>
            <p className="text-base-content/80">
              Founded in 2020, FruVida began with a simple idea: everyone deserves access to fresh, 
              organic produce without the hassle. What started as a small local delivery service has 
              grown into a community of health-conscious individuals who trust us for their daily 
              nutritional needs.
            </p>
            <p className="text-base-content/80">
              Today, we work directly with organic farmers and producers to ensure the highest 
              quality products reach your table. Our commitment to sustainability and supporting 
              local agriculture remains at the heart of everything we do.
            </p>
          </div>
          <div className={styles.imageContainer}>
            <img 
              src="/images/dylan-gillis-KdeqA3aTnBY-unsplash.jpg" 
              alt="Coffee shop interior" 
              className={styles.image}
            />
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="bg-accent/10 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h3 className="card-title">Sustainability</h3>
                <p>We're committed to eco-friendly practices and reducing our environmental impact.</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="bg-accent/10 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="card-title">Quality</h3>
                <p>We never compromise on the quality of our products or service.</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="bg-accent/10 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="card-title">Community</h3>
                <p>Supporting local farmers and building strong community relationships.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.id} className="card bg-base-100 shadow-xl">
                <figure className="px-4 pt-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="rounded-xl h-48 w-48 object-cover"
                  />
                </figure>
                <div className="card-body items-center text-center">
                  <h3 className="card-title">{member.name}</h3>
                  <p className="text-accent font-medium">{member.role}</p>
                  <p className="text-base-content/80">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="stat place-items-center">
            <div className="stat-title">Happy Customers</div>
            <div className="stat-value">1K+</div>
          </div>
          
          <div className="stat place-items-center">
            <div className="stat-title">Products</div>
            <div className="stat-value">50+</div>
          </div>
          
          <div className="stat place-items-center">
            <div className="stat-title">Local Farmers</div>
            <div className="stat-value">10+</div>
          </div>
          
          <div className="stat place-items-center">
            <div className="stat-title">Cities Served</div>
            <div className="stat-value">1+</div>
          </div>
        </section>
      </div>
    </div>
  );
} 