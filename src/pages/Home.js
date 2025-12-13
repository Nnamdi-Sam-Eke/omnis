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
      color: "from-purple-500 to-violet-500"
    },
    { 
      title: "Students & Researchers", 
      desc: "Test hypotheses and analyze scenarios in a controlled AI environment for breakthrough insights.",
      icon: <Target className="w-8 h-8" />,
      color: "from-violet-500 to-purple-500"
    },
    { 
      title: "Investors & Traders", 
      desc: "Predict market trends and simulate trading strategies for superior investment decisions.",
      icon: <Zap className="w-8 h-8" />,
      color: "from-purple-600 to-indigo-500"
    },
    { 
      title: "Product Designers", 
      desc: "Visualize user interactions and optimize product features before market launch.",
      icon: <Users className="w-8 h-8" />,
      color: "from-indigo-500 to-purple-600"
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
  const FloatingParticles = () => {
    // Generate random values only once
    const particles = React.useMemo(() =>
      [...Array(25)].map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${3 + Math.random() * 4}s`,
        colorClass:
          Math.random() < 1 / 3
            ? 'bg-purple-400'
            : Math.random() < 0.5
            ? 'bg-violet-400'
            : 'bg-indigo-400'
      })),
      []
    );

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full opacity-30 animate-float ${p.colorClass}`}
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.animationDelay,
              animationDuration: p.animationDuration
            }}
          />
        ))}
      </div>
    );
  };

  // Hero Section Component with enhanced animations
  const HeroSection = () => (
    <div className="relative flex flex-col lg:flex-row min-h-screen bg-slate-900 overflow-hidden">
      <FloatingParticles />
      
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-violet-600/10 to-indigo-600/20 animate-gradient-x"></div>
      
      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Left: Text Content */}
      <div className="lg:w-1/2 flex flex-col justify-center p-6 sm:p-12 md:p-16 lg:p-20 relative z-10">
        <div className="space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center px-4 py-2 bg-purple-500/10 border border-purple-400/30 rounded-full text-purple-300 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Now in Beta - Join the Future
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
            Revolutionizing
            <span className="block bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent animate-pulse-slow">
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
            <button className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
              <span className="relative z-10 flex items-center">
                Join on Discord
                <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-violet-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </button>
            
            <button className="group bg-white/10 backdrop-blur border border-purple-400/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:bg-white/20 hover:border-purple-400/40">
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
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`absolute inset-0 border-2 rounded-full animate-ping ${
                i % 3 === 0 ? 'border-purple-500/20' : i % 3 === 1 ? 'border-violet-500/20' : 'border-indigo-500/20'
              }`}
              style={{
                animationDelay: `${i * 0.8}s`,
                animationDuration: '4s',
                transform: `scale(${0.8 + i * 0.15})`
              }}
            />
          ))}
          
          {/* Central orb with glassmorphism */}
          <div className="absolute inset-0 m-auto w-40 h-40 bg-gradient-to-r from-purple-500/30 to-violet-500/30 rounded-full backdrop-blur-xl border border-white/10 animate-pulse flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full animate-spin-slow"></div>
          </div>
          
          {/* Orbiting elements */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-6 h-6 rounded-full backdrop-blur-sm border border-white/20 will-change-transform ${
                i % 3 === 0 ? 'bg-gradient-to-r from-purple-400/80 to-violet-400/80' : 
                i % 3 === 1 ? 'bg-gradient-to-r from-violet-400/80 to-indigo-400/80' : 
                'bg-gradient-to-r from-indigo-400/80 to-purple-400/80'
              }`}
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: '0 0',
                animation: `orbit ${10 + i}s linear infinite`,
                animationDelay: `${i * 1.5}s`,
                transform: `rotate(${i * 60}deg) translateX(${140 + i * 10}px)`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // Enhanced Omnis Section
  const OmnisSection = () => (
    <section className="relative py-32 overflow-hidden bg-slate-800 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #8b5cf6 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2 space-y-8">
          <div className="space-y-6">
            <h2 className="text-5xl lg:text-6xl font-bold text-white">
              What is
              <span className="block bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
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
                <CheckCircle className="w-6 h-6 text-purple-400" />
                <span className="text-lg text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
          
          <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105">
            Learn More
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>

        <div className="lg:w-1/2 relative">
          <div className="relative w-full h-96 flex items-center justify-center">
            {/* Glassmorphism card */}
            <div className="absolute inset-4 bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-xl rounded-3xl border border-purple-400/20 p-8">
              {/* Animated data points */}
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-3 h-3 rounded-full animate-float ${
                    i % 3 === 0 ? 'bg-gradient-to-r from-purple-400 to-violet-400' : 
                    i % 3 === 1 ? 'bg-gradient-to-r from-violet-400 to-indigo-400' : 
                    'bg-gradient-to-r from-indigo-400 to-purple-400'
                  }`}
                  style={{
                    top: `${20 + 60 * Math.sin((i / 16) * 4 * Math.PI)}%`,
                    left: `${20 + 60 * Math.cos((i / 16) * 4 * Math.PI)}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: `${3 + i * 0.1}s`
                  }}
                />
              ))}
              
              {/* Central hub */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center animate-pulse-slow shadow-lg shadow-purple-500/25">
                <Zap className="w-10 h-10 text-white" />
              </div>
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
        className="py-32 text-white relative overflow-hidden bg-slate-900"
        onMouseEnter={stopAuto}
        onMouseLeave={startAuto}
      >
        <FloatingParticles />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-300 mb-16">Three simple steps to unlock infinite possibilities</p>
          
          <div className="relative">
            {/* Progress line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-slate-700 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-1000"
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
                  <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-3xl p-8 hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:bg-slate-800/70">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto transition-all duration-300 ${
                      i === currentStep 
                        ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/25' 
                        : 'bg-slate-700 text-slate-300'
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
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentStep ? 'bg-purple-500 w-8' : 'bg-slate-600 w-2'
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
    <section className="py-32 bg-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-white">Who Can Benefit?</h2>
          <p className="text-xl text-gray-300">Empowering professionals across industries</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {useCases.map((useCase, i) => (
            <div
              key={i}
              className="group relative bg-slate-900/50 backdrop-blur border border-slate-700 rounded-3xl p-8 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 transform hover:-translate-y-2 hover:border-purple-500/50 hover:bg-slate-900/70"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${useCase.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {useCase.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">{useCase.title}</h3>
              <p className="mb-6 text-gray-300">{useCase.desc}</p>
              <button className="flex items-center text-purple-400 font-semibold group-hover:text-violet-400 transition-colors">
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
    <section className="py-32 text-white relative overflow-hidden bg-gradient-to-br from-purple-900/20 via-slate-900 to-violet-900/20">
      <FloatingParticles />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-5xl font-bold mb-6">Experience It Yourself</h2>
        <p className="text-xl text-purple-100 mb-12">See the power of Omnis in action</p>
        
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
                  <div className={`w-3 h-3 rounded-full ${
                    i % 3 === 0 ? 'bg-gradient-to-r from-purple-400 to-violet-400' : 
                    i % 3 === 1 ? 'bg-gradient-to-r from-violet-400 to-indigo-400' : 
                    'bg-gradient-to-r from-indigo-400 to-purple-400'
                  }`}></div>
                  <span className="text-lg">{feature}</span>
                </div>
              ))}
            </div>
            
            <button className="group bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25">
              Try Demo
              <Play className="inline ml-2 w-5 h-5 transition-transform group-hover:scale-110" />
            </button>
          </div>
          
          <div className="relative">
            <div className="aspect-video bg-slate-800/40 backdrop-blur border border-purple-400/20 rounded-3xl flex items-center justify-center relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-violet-500/20 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-violet-600/10"></div>
              <Play className="w-16 h-16 text-purple-300 relative z-10" />
              <span className="absolute bottom-4 left-4 text-sm text-purple-200/60">Demo Video Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Enhanced Testimonials
  const TestimonialSection = () => (
    <section className="py-32 bg-slate-800">
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
            <div key={i} className="bg-slate-900/50 backdrop-blur border border-slate-700 rounded-3xl p-8 hover:shadow-xl hover:border-purple-500/30 transition-all duration-300">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-lg mb-6 text-gray-300">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-lg ${
                  i % 2 === 0 ? 'bg-gradient-to-r from-purple-500 to-violet-500' : 'bg-gradient-to-r from-violet-500 to-indigo-500'
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
    <section className="py-32 text-white relative overflow-hidden bg-slate-900">
      <FloatingParticles />
      
      {/* Background mesh gradient */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-6xl font-bold mb-6">
          Join the
          <span className="block bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Future of Decision Making
          </span>
        </h2>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Be among the first to experience the next generation of AI-powered scenario simulation. Sign up for early access today.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button className="group bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
            <span className="flex items-center">
              Sign Up for Beta
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
          
          <button className="bg-white/10 backdrop-blur border border-purple-400/20 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 hover:border-purple-400/40 transition-all duration-300">
            Join Community
          </button>
        </div>
        
        <div className="flex justify-center items-center space-x-8 text-sm text-gray-400">
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-purple-400" />
            Free during beta
          </span>
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-purple-400" />
            No credit card required
          </span>
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-purple-400" />
            Early access privileges
          </span>
        </div>
      </div>
    </section>
  );

  return (
    <div className=" relative">
      <style>{`
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
          from { transform: rotate(0deg) translateX(140px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(140px) rotate(-360deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-gradient-x { animation: gradient-x 15s ease infinite; background-size: 200% 200%; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-orbit { animation: orbit 10s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
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