import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, MapPin, Users, Heart, Send, Star, Sparkles, ChevronRight, Mail, Phone, User, Hash } from 'lucide-react';

const SummerSoireeWebsite = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    attendance: 'yes',
    guests: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);
  const videoRef = useRef(null); // Ref for the video element

  useEffect(() => {
    setIsLoaded(true);

    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5
      });
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    // Advanced animations CSS (Consider moving this to a separate CSS file for better organization)
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        33% { transform: translateY(-20px) rotate(2deg); }
        66% { transform: translateY(10px) rotate(-1deg); }
      }
      @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes glow {
        0%, 100% { opacity: 0.5; filter: blur(20px); }
        50% { opacity: 1; filter: blur(30px); }
      }
      @keyframes slideInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes morphing {
        0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
      }
      .gradient-text {
        background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 50%, #1a1a1a 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: shimmer 3s linear infinite;
      }
      .glass-morphism {
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.18);
      }
      .premium-shadow {
        box-shadow:
          0 0 40px rgba(0, 0, 0, 0.08),
          0 0 80px rgba(0, 0, 0, 0.04),
          inset 0 0 20px rgba(255, 255, 255, 0.5);
      }
      .text-shadow-luxury {
        text-shadow: 0 0 40px rgba(0, 0, 0, 0.1);
      }
      .hover-lift {
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .hover-lift:hover {
        transform: translateY(-5px) scale(1.02);
      }
      /* Added styles for the video background */
      .hero-video {
        position: absolute;
        top: 50%;
        left: 50%;
        min-width: 100%;
        min-height: 100%;
        width: auto;
        height: auto;
        z-index: -100;
        transform: translateX(-50%) translateY(-50%);
        background-size: cover;
        transition: 1s opacity;
      }
      .video-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.3); /* Adjust opacity as needed */
        z-index: -50;
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      document.head.removeChild(style);
    };
  }, []);

  // Attempt to play the video when it's ready (useful for some browsers)
  useEffect(() => {
    if (currentPage === 'home' && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.warn("Video autoplay was prevented:", error);
        // You might want to show a play button here if autoplay fails
      });
    }
  }, [currentPage]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate submission (Replace with actual API call if needed)
    setTimeout(() => {
      alert('Thank you for your RSVP! You will receive a confirmation email shortly with exclusive event details.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        attendance: 'yes',
        guests: 1
      });
      setIsSubmitting(false);
    }, 2000);
  };

  const navigationItems = [
    { id: 'home', label: 'Experience', icon: Star },
    { id: 'details', label: 'The Evening', icon: Calendar },
    { id: 'dress', label: 'Attire', icon: Sparkles },
    { id: 'rsvp', label: 'Reserve', icon: Users }
  ];

  const renderContent = () => {
    switch(currentPage) {
      case 'home':
        return (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Hero Video Background */}
            <video
              ref={videoRef}
              className="hero-video"
              src="images/summer.mp4" // Ensure this path is correct relative to your public/build folder
              autoPlay
              loop
              muted
              playsInline // Important for mobile devices
            >
              Your browser does not support the video tag.
            </video>
            {/* Overlay for better text readability */}
            <div className="video-overlay"></div>

            {/* Hero Content */}
            <div className="relative z-10 text-center space-y-12 max-w-6xl mx-auto px-8">
              <div className="flex justify-center mb-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-gray-400 rounded-full filter blur-xl opacity-20 animate-pulse"></div>
                  <Sparkles className="w-24 h-24 text-gray-800 relative z-10" style={{
                    filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.1))',
                    animation: 'float 4s ease-in-out infinite'
                  }} />
                </div>
              </div>
              <div className="space-y-8" style={{ animation: 'slideInUp 1s ease-out' }}>
                <h1 className="relative">
                  <span className="block text-8xl md:text-9xl font-extralight tracking-[0.2em] leading-none gradient-text text-shadow-luxury">
                    WHITE THEME
                  </span>
                  <span className="absolute inset-0 text-8xl md:text-9xl font-extralight tracking-[0.2em] leading-none text-gray-200 blur-sm -z-10">
                    WHITE THEME
                  </span>
                </h1>
                <h2 className="text-6xl md:text-8xl font-thin text-gray-700 tracking-[0.15em] opacity-90">
                  Summer Soirée
                </h2>
                <div className="relative w-64 h-px mx-auto my-12">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent animate-pulse"></div>
                </div>
                <p className="text-2xl md:text-3xl text-gray-600 font-light tracking-wider opacity-80">
                  An Exclusive Evening of Elegance
                </p>
                <div className="flex items-center justify-center space-x-4 text-gray-500">
                  <div className="w-8 h-px bg-gray-400"></div>
                  <p className="text-lg font-light tracking-widest uppercase">
                    Fundraising Goal: $200,000
                  </p>
                  <div className="w-8 h-px bg-gray-400"></div>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-6 mt-16">
                {[
                  { icon: Calendar, text: 'July 26th, 2024' },
                  { icon: Clock, text: '8:00 PM - 11:00 PM' },
                  { icon: MapPin, text: 'Maestro\'s, Westfield' }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="glass-morphism rounded-3xl px-10 py-6 premium-shadow hover-lift cursor-pointer"
                    style={{
                      animation: `slideInUp 1s ease-out ${0.2 + index * 0.1}s both`
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <item.icon className="w-6 h-6 text-gray-700" />
                      <span className="font-light text-lg text-gray-700 tracking-wide">{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="mt-16 inline-flex items-center space-x-3 glass-morphism rounded-full px-8 py-4 cursor-pointer hover-lift group"
                onClick={() => setCurrentPage('rsvp')}
              >
                <span className="text-gray-700 font-light tracking-wider">Reserve Your Place</span>
                <ChevronRight className="w-5 h-5 text-gray-700 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="max-w-5xl w-full">
              <h2 className="text-6xl font-extralight text-gray-800 text-center mb-16 gradient-text">The Evening Awaits</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Calendar,
                    title: 'The Occasion',
                    details: [
                      'July 26th, 2024',
                      '8:00 PM - 11:00 PM',
                      'Cocktail Reception',
                      'Gourmet Dining'
                    ]
                  },
                  {
                    icon: MapPin,
                    title: 'The Venue',
                    details: [
                      'Maestro\'s',
                      'Westfield Shopping Center',
                      'Valet Parking Available',
                      'Private Event Space'
                    ]
                  },
                  {
                    icon: Heart,
                    title: 'The Cause',
                    details: [
                      '$1,000 Minimum Donation',
                      '200 Distinguished Guests',
                      'Supporting Excellence',
                      'Making a Difference'
                    ]
                  }
                ].map((section, index) => (
                  <div
                    key={index}
                    className="glass-morphism rounded-3xl p-10 premium-shadow hover-lift"
                    style={{
                      animation: `slideInUp 0.8s ease-out ${index * 0.2}s both`
                    }}
                  >
                    <div className="text-center space-y-6">
                      <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                        <section.icon className="w-12 h-12 text-gray-700" />
                      </div>
                      <h3 className="text-2xl font-light text-gray-800 tracking-wide">{section.title}</h3>
                      <div className="space-y-3">
                        {section.details.map((detail, i) => (
                          <p key={i} className="text-gray-600 font-light">{detail}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-16 glass-morphism rounded-3xl p-12 premium-shadow text-center">
                <h3 className="text-3xl font-light text-gray-800 mb-8">An Unforgettable Experience</h3>
                <div className="grid md:grid-cols-4 gap-8">
                  {[
                    'Live Entertainment',
                    'Gourmet Cuisine',
                    'Premium Beverages',
                    'Silent Auction'
                  ].map((item, index) => (
                    <div key={index} className="text-gray-600 font-light">
                      <Sparkles className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'dress':
        return (
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="max-w-5xl w-full">
              <h2 className="text-6xl font-extralight text-gray-800 text-center mb-16 gradient-text">Dress to Inspire</h2>
              <div className="glass-morphism rounded-3xl p-16 premium-shadow text-center mb-12">
                <Sparkles className="w-20 h-20 text-gray-600 mx-auto mb-8" style={{
                  animation: 'float 4s ease-in-out infinite'
                }} />
                <h3 className="text-5xl font-extralight text-gray-800 mb-8">White & Black Elegance</h3>
                <p className="text-xl text-gray-600 font-light leading-relaxed max-w-3xl mx-auto">
                  Join us in creating a stunning visual symphony of monochromatic elegance.
                  Your choice of sophisticated white and black attire will contribute to an
                  atmosphere of timeless refinement and contemporary luxury.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    title: 'Feminine Elegance',
                    items: [
                      'Flowing cocktail dresses in pristine white or dramatic black',
                      'Sophisticated separates with luxurious textures',
                      'Statement jewelry in silver, pearls, or diamonds',
                      'Elegant heels and refined clutches'
                    ]
                  },
                  {
                    title: 'Masculine Refinement',
                    items: [
                      'Tailored tuxedos or sophisticated dinner jackets',
                      'Crisp white dress shirts with black bow ties',
                      'Polished dress shoes and classic accessories',
                      'Optional white or black pocket squares'
                    ]
                  }
                ].map((category, index) => (
                  <div
                    key={index}
                    className="glass-morphism rounded-3xl p-10 premium-shadow"
                    style={{
                      animation: `slideInUp 0.8s ease-out ${index * 0.2}s both`
                    }}
                  >
                    <h4 className="text-2xl font-light text-gray-800 mb-6 text-center">{category.title}</h4>
                    <div className="space-y-4">
                      {category.items.map((item, i) => (
                        <div key={i} className="flex items-start space-x-3">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-3 flex-shrink-0"></div>
                          <p className="text-gray-600 font-light leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <p className="text-2xl text-gray-500 font-extralight italic">
                  "Where elegance meets purpose"
                </p>
              </div>
            </div>
          </div>
        );

      case 'rsvp':
        return (
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="max-w-3xl w-full">
              <h2 className="text-6xl font-extralight text-gray-800 text-center mb-16 gradient-text">Reserve Your Place</h2>
              <div className="glass-morphism rounded-3xl p-12 premium-shadow">
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}> {/* Added form tag and onSubmit */}
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2 text-gray-700 font-light">
                        <User className="w-5 h-5" />
                        <span>Full Name</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 rounded-2xl bg-white/50 backdrop-blur border border-gray-200 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20 transition-all text-gray-800 font-light"
                        placeholder="Enter your full name"
                        disabled={isSubmitting}
                        required // Added required attribute
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2 text-gray-700 font-light">
                        <Mail className="w-5 h-5" />
                        <span>Email Address</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 rounded-2xl bg-white/50 backdrop-blur border border-gray-200 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20 transition-all text-gray-800 font-light"
                        placeholder="your@email.com"
                        disabled={isSubmitting}
                        required // Added required attribute
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2 text-gray-700 font-light">
                        <Phone className="w-5 h-5" />
                        <span>Phone Number</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 rounded-2xl bg-white/50 backdrop-blur border border-gray-200 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20 transition-all text-gray-800 font-light"
                        placeholder="+1 (555) 123-4567"
                        disabled={isSubmitting}
                        required // Added required attribute
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2 text-gray-700 font-light">
                        <Calendar className="w-5 h-5" />
                        <span>Will you grace us with your presence?</span>
                      </label>
                      <select
                        name="attendance"
                        value={formData.attendance}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 rounded-2xl bg-white/50 backdrop-blur border border-gray-200 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20 transition-all text-gray-800 font-light appearance-none cursor-pointer"
                        disabled={isSubmitting}
                      >
                        <option value="yes">Yes, I will attend</option>
                        <option value="no">Unfortunately, I cannot attend</option>
                      </select>
                    </div>
                    {formData.attendance === 'yes' && (
                      <div className="space-y-3">
                        <label className="flex items-center space-x-2 text-gray-700 font-light">
                          <Hash className="w-5 h-5" />
                          <span>Number of Guests (including yourself)</span>
                        </label>
                        <select
                          name="guests"
                          value={formData.guests}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 rounded-2xl bg-white/50 backdrop-blur border border-gray-200 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20 transition-all text-gray-800 font-light appearance-none cursor-pointer"
                          disabled={isSubmitting}
                        >
                          {[1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>
                              {num} {num === 1 ? 'Guest' : 'Guests'}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <button
                      type="submit" // Added type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-8 bg-gradient-to-r from-gray-800 to-gray-900 text-white py-5 rounded-2xl font-light tracking-wider hover:from-gray-900 hover:to-black transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed premium-shadow hover-lift"
                    >
                      <Send className="w-5 h-5" />
                      <span className="text-lg">{isSubmitting ? 'Processing...' : 'Confirm Reservation'}</span>
                    </button>
                    <p className="text-center text-sm text-gray-500 font-light mt-6">
                      Your information will be kept strictly confidential and used only for event coordination.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-auto relative"> {/* Changed overflow-hidden to overflow-auto */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-8">
          <div className={`glass-morphism rounded-full premium-shadow transition-all duration-500 ${scrolled ? 'py-2' : 'py-3'}`}>
            <div className="flex justify-center items-center space-x-1">
              {navigationItems.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`group relative flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg'
                        : 'hover:bg-white/30 text-gray-700'
                    }`}
                    style={{
                      animation: `slideInUp 0.5s ease-out ${index * 0.1}s both`
                    }}
                    aria-current={isActive ? 'page' : undefined} // Added for accessibility
                  >
                    <IconComponent className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className={`font-light tracking-wide ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 opacity-20 blur-xl -z-10"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with fade transition */}
      <main className={`min-h-screen transition-all duration-1000 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}> {/* Ensured min-h-screen */}
        {renderContent()}
      </main>

      {/* Ambient particles (Consider optimizing if performance is an issue) */}
      <div className="fixed pointer-events-none inset-0 z-0">
        {[...Array(3)].map((_, i) => (
          <div
            key={`ambient-${i}`}
            className="absolute rounded-full"
            style={{
              width: '300px',
              height: '300px',
              background: `radial-gradient(circle at center, rgba(${150 + i * 30},${150 + i * 30},${150 + i * 30},0.05) 0%, transparent 70%)`,
              left: `${20 + i * 30}%`,
              top: `${20 + i * 20}%`,
              animation: `float ${10 + i * 5}s ease-in-out infinite`,
              animationDelay: `${i * 2}s`,
              filter: 'blur(100px)'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SummerSoireeWebsite;