import React, { useState, useEffect, useRef } from "react";
import { ChevronRight, Play, Zap, Target, TrendingUp, Users, Star, ArrowRight, CheckCircle, Sparkles } from "lucide-react";

function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Use Case Data
  const useCases = [
    { 
      title: "Business Analysts", 
      desc: "Leverage AI to simulate different business strategies and optimize outcomes with precision.",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "from-blue-500 to-green-500"
    },
    { 
      title: "Students & Researchers", 
      desc: "Test hypotheses and analyze scenarios in a controlled AI environment for breakthrough insights.",
      icon: <Target className="w-8 h-8" />,
      color: "from-green-500 to-blue-500"
    },
    { 
      title: "Investors & Traders", 
      desc: "Predict market trends and simulate trading strategies for superior investment decisions.",
      icon: <Zap className="w-8 h-8" />,
      color: "from-blue-600 to-green-400"
    },
    { 
      title: "Product Designers", 
      desc: "Visualize user interactions and optimize product features before market launch.",
      icon: <Users className="w-8 h-8" />,
      color: "from-green-600 to-blue-400"
    },
  ];

  // Steps Data
  const steps = [
    { 
      title: "Input Your Scenario", 
      desc: "Describe your situation with natural language and let our AI understand the complete context.",
      icon: "01"
    },
    { 
      title: "Run Simulations", 
      desc: "Our advanced AI processes thousands of scenarios to generate deep insights and predictions.",
      icon: "02"
    },
    { 
      title: "Get Insights", 
      desc: "Receive actionable insights with confidence scores and make data-driven decisions instantly.",
      icon: "03"
    }
  ];

  // Floating particles component
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-2 h-2 rounded-full opacity-20 animate-float ${
            i % 2 === 0 ? 'bg-blue-400' : 'bg-green-400'
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        />
      ))}
    </div>
  );

  // Hero Section Component with enhanced animations
  const HeroSection = () => (
    <div className="relative flex flex-col lg:flex-row min-h-screen bg-black overflow-hidden">
      <FloatingParticles />
      
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-green-600/10 animate-gradient-x"></div>
      
      {/* Left: Text Content */}
      <div className="lg:w-1/2 flex flex-col justify-center p-6 sm:p-12 md:p-16 lg:p-20 relative z-10">
        <div className="space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Now in Beta - Join the Future
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
            Revolutionizing
            <span className="block bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent animate-pulse-slow">
              Scenario Simulations
            </span>
            <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-2">
              with Digital Twin Intelligence
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-300 max-w-2xl leading-relaxed">
            Experience the power of AI-driven simulations to make informed decisions and explore endless possibilities with unprecedented accuracy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
              <span className="relative z-10 flex items-center">
                Join on Discord
                <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-green-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </button>
            
            <button className="group bg-white/10 backdrop-blur border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:bg-white/20">
              <span className="flex items-center">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Right: Interactive Background */}
      <div className="lg:w-1/2 relative flex items-center justify-center p-8">
        <div className="relative w-96 h-96">
          {/* Animated rings */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`absolute inset-0 border-2 rounded-full animate-ping ${
                i % 2 === 0 ? 'border-blue-500/30' : 'border-green-500/30'
              }`}
              style={{
                animationDelay: `${i * 1}s`,
                animationDuration: '3s',
                transform: `scale(${1 + i * 0.2})`
              }}
            />
          ))}
          
          {/* Central orb */}
          <div className="absolute inset-0 m-auto w-32 h-32 bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-pulse blur-sm"></div>
          <div className="absolute inset-0 m-auto w-24 h-24 bg-gradient-to-r from-blue-400 to-green-400 rounded-full animate-spin-slow"></div>
          
          {/* Orbiting elements */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-4 h-4 rounded-full animate-orbit ${
                i % 2 === 0 ? 'bg-gradient-to-r from-blue-400 to-green-400' : 'bg-gradient-to-r from-green-400 to-blue-400'
              }`}
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: '0 0',
                animation: `orbit 8s linear infinite`,
                animationDelay: `${i * 1}s`,
                transform: `rotate(${i * 45}deg) translateX(120px)`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // Enhanced Omnis Section
  const OmnisSection = () => (
    <section className="relative py-32 overflow-hidden bg-gray-900 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2 space-y-8">
          <div className="space-y-6">
            <h2 className="text-5xl lg:text-6xl font-bold text-white">
              What is
              <span className="block bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                Omnis?
              </span>
            </h2>
            
            <p className="text-xl leading-relaxed text-gray-300">
              Omnis is our revolutionary AI-powered simulation platform designed to help users explore infinite possible futures. Whether you're a business strategist, researcher, or investor, Omnis provides dynamic scenario analysis to optimize decision-making with unprecedented precision.
            </p>
          </div>
          
          <div className="space-y-4">
            {[
              "Advanced AI algorithms",
              "Real-time scenario processing", 
              "Predictive analytics engine",
              "Interactive visualization"
            ].map((feature, i) => (
              <div key={i} className="flex items-center space-x-3 animate-fade-in-up" style={{ animationDelay: `${i * 0.2}s` }}>
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-lg text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-1/2 relative">
          <div className="relative w-full h-96 flex items-center justify-center">
            {/* Animated data visualization */}
            <div className="absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-4 h-4 rounded-full animate-float ${
                    i % 2 === 0 ? 'bg-gradient-to-r from-blue-500 to-green-500' : 'bg-gradient-to-r from-green-500 to-blue-500'
                  }`}
                  style={{
                    top: `${30 + 40 * Math.sin((i / 12) * 2 * Math.PI)}%`,
                    left: `${30 + 40 * Math.cos((i / 12) * 2 * Math.PI)}%`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: '4s'
                  }}
                />
              ))}
            </div>
            
            {/* Central hub */}
            <div className="relative z-10 w-32 h-32 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center animate-pulse-slow">
              <Zap className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Enhanced Steps Section
  const StepsSection = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const intervalRef = useRef(null);

    const startAuto = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentStep(s => (s + 1) % steps.length);
      }, 4000);
    };

    const stopAuto = () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };

    useEffect(() => {
      startAuto();
      return () => stopAuto();
    }, []);

    return (
      <section 
        className="py-32 text-white relative overflow-hidden bg-black"
        onMouseEnter={stopAuto}
        onMouseLeave={startAuto}
      >
        <FloatingParticles />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-300 mb-16">Three simple steps to unlock infinite possibilities</p>
          
          <div className="relative">
            {/* Progress line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gray-700 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className={`relative transition-all duration-500 transform ${
                    i === currentStep ? 'scale-105' : 'scale-95 opacity-70'
                  }`}
                  onClick={() => setCurrentStep(i)}
                >
                  <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-3xl p-8 hover:border-blue-500/50 transition-all duration-300 cursor-pointer">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto ${
                      i === currentStep 
                        ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white' 
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {step.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-gray-300">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-12 space-x-3">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i === currentStep ? 'bg-blue-500 w-8' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Enhanced Use Cases Section
  const UseCasesSection = () => (
    <section className="py-32 bg-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-white">Who Can Benefit?</h2>
          <p className="text-xl text-gray-300">Empowering professionals across industries</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {useCases.map((useCase, i) => (
            <div
              key={i}
              className="group relative bg-gray-800 border border-gray-700 rounded-3xl p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 transform hover:-translate-y-2 hover:border-blue-500/50"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${useCase.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {useCase.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">{useCase.title}</h3>
              <p className="mb-6 text-gray-300">{useCase.desc}</p>
              <button className="flex items-center text-blue-400 font-semibold group-hover:text-green-400 transition-colors">
                Learn more
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Enhanced Demo Section
  const InteractiveDemoSection = () => (
    <section className="py-32 text-white relative overflow-hidden bg-gradient-to-br from-blue-900/20 via-black to-green-900/20">
      <FloatingParticles />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-5xl font-bold mb-6">Experience It Yourself</h2>
        <p className="text-xl text-blue-100 mb-12">See the power of Omnis in action</p>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="text-left space-y-6">
              {[
                "Real-time simulation processing",
                "Interactive scenario modeling", 
                "Advanced predictive analytics",
                "Comprehensive result visualization"
              ].map((feature, i) => (
                <div key={i} className="flex items-center space-x-4 animate-fade-in-up" style={{ animationDelay: `${i * 0.2}s` }}>
                  <div className={`w-2 h-2 rounded-full ${
                    i % 2 === 0 ? 'bg-gradient-to-r from-blue-400 to-green-400' : 'bg-gradient-to-r from-green-400 to-blue-400'
                  }`}></div>
                  <span className="text-lg">{feature}</span>
                </div>
              ))}
            </div>
            
            <button className="group bg-white text-blue-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
              Try Demo
              <Play className="inline ml-2 w-5 h-5 transition-transform group-hover:scale-110" />
            </button>
          </div>
          
          <div className="relative">
            <div className="aspect-video bg-black/40 backdrop-blur border border-white/10 rounded-3xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 animate-pulse"></div>
              <Play className="w-16 h-16 text-white/80" />
              <span className="absolute bottom-4 left-4 text-sm text-white/60">Demo Video Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Enhanced Testimonials
  const TestimonialSection = () => (
    <section className="py-32 bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-white">What Our Users Say</h2>
          <p className="text-xl text-gray-300">Trusted by professionals worldwide</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { 
              quote: "Omnis has completely transformed how I approach strategic decision-making. The insights are incredible.", 
              name: "Sarah Chen", 
              role: "Business Analyst",
              company: "TechCorp",
              rating: 5
            },
            { 
              quote: "From gut feelings to data-driven decisions - Omnis gave me the confidence to make better choices.", 
              name: "Marcus Rodriguez", 
              role: "Product Designer",
              company: "InnovateLab", 
              rating: 5
            }
          ].map((testimonial, i) => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-3xl p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-lg mb-6 text-gray-300">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4 ${
                  i % 2 === 0 ? 'bg-gradient-to-r from-blue-500 to-green-500' : 'bg-gradient-to-r from-green-500 to-blue-500'
                }`}>
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-bold text-white">{testimonial.name}</h4>
                  <p className="text-gray-400">{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Enhanced CTA Section
  const CallToActionSection = () => (
    <section className="py-32 text-white relative overflow-hidden bg-black">
      <FloatingParticles />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-6xl font-bold mb-6">
          Join the
          <span className="block bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            Future of Decision Making
          </span>
        </h2>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Be among the first to experience the next generation of AI-powered scenario simulation. Sign up for early access today.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button className="group bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
            <span className="flex items-center">
              Sign Up for Beta
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
          
          <button className="bg-white/10 backdrop-blur border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300">
            Join Community
          </button>
        </div>
        
        <div className="flex justify-center items-center space-x-8 text-sm text-gray-400">
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
            Free during beta
          </span>
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
            No credit card required
          </span>
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
            Early access privileges
          </span>
        </div>
      </div>
    </section>
  );

  return (
    <div className="relative">
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-gradient-x { animation: gradient-x 15s ease infinite; background-size: 200% 200%; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-orbit { animation: orbit 8s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
      
      <HeroSection />
      <OmnisSection />
      <StepsSection />
      <UseCasesSection />
      <InteractiveDemoSection />
      <TestimonialSection />
      <CallToActionSection />
    </div>
  );
}

export default Home;