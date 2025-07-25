import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Edit3, MessageSquare, Send, CheckCircle, AlertCircle, MapPin, Clock, Phone, Globe } from 'lucide-react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    company: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [formStatus, setFormStatus] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const messageRef = useRef();
  const formRef = useRef();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const ta = messageRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
    }
  }, [formData.message]);

  useEffect(() => {
    if (formStatus === 'success') {
      const timer = setTimeout(() => setFormStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [formStatus]);

  const validators = {
    name: v => v.trim().length >= 2 ? '' : 'Name must be at least 2 characters',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email address',
    subject: v => v.trim().length >= 3 ? '' : 'Subject must be at least 3 characters',
    message: v => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters',
    phone: v => !v || /^[\+]?[0-9\s\-\(\)]+$/.test(v) ? '' : 'Please enter a valid phone number'
  };

  const validateField = (name, value) => {
    const error = validators[name]?.(value) || '';
    setErrors(e => ({ ...e, [name]: error }));
    return error;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(d => ({ ...d, [name]: value }));
    if (errors[name]) {
      validateField(name, value);
    }
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setFocusedField(null);
    validateField(name, value);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach(k => {
      if (k === 'company' || k === 'phone') return; // Optional fields
      const err = validators[k]?.(formData[k]);
      if (err) newErrors[k] = err;
    });
    
    // Validate phone if provided
    if (formData.phone) {
      const phoneError = validators.phone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }
    
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setFormStatus('loading');
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success/failure for demo
      if (Math.random() > 0.2) {
        setFormStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '', company: '', phone: '' });
        setErrors({});
      } else {
        throw new Error('Simulated failure');
      }
    } catch (error) {
      console.error(error);
      setFormStatus('error');
      setTimeout(() => setFormStatus(null), 5000);
    }
  };

  const getFieldClasses = (fieldName) => {
    const baseClasses = "w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white";
    
    if (errors[fieldName]) {
      return `${baseClasses} border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-red-100 dark:shadow-red-900/20`;
    }
    
    if (focusedField === fieldName) {
      return `${baseClasses} border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 shadow-blue-100 dark:shadow-blue-900/20 transform scale-[1.01]`;
    }
    
    return `${baseClasses} hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none`;
  };

  const contactInfo = [
    { icon: MapPin, label: "Address", value: "123 Future Lane, Innovation City, IC 12345" },
    { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
    { icon: Mail, label: "Email", value: "hello@omnis.ai" },
    { icon: Globe, label: "Website", value: "www.omnis.ai" }
  ];

  const socialLinks = [
    { name: 'LinkedIn', url: 'https://linkedin.com/company/omnis', color: 'hover:text-blue-600', icon: '💼' },
    { name: 'Twitter', url: 'https://twitter.com/omnis', color: 'hover:text-sky-400', icon: '🐦' },
    { name: 'GitHub', url: 'https://github.com/omnis', color: 'hover:text-gray-600', icon: '🐱' },
    { name: 'Instagram', url: 'https://instagram.com/omnis', color: 'hover:text-pink-500', icon: '📸' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className={`relative z-10 container mx-auto px-4 py-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Let's Connect
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Ready to bring your ideas to life? We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Send us a message</h2>
                    <p className="text-gray-600 dark:text-gray-300">We'll get back to you within 24 hours</p>
                  </div>
                </div>

                <div ref={formRef} className="space-y-6">
                  {/* Name & Email Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative group">
                      <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'name' ? 'text-blue-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => handleFocus('name')}
                        onBlur={handleBlur}
                        placeholder="Your name *"
                        className={getFieldClasses('name')}
                      />
                      {errors.name && (
                        <div className="flex items-center gap-2 mt-2 text-red-500 text-sm animate-slideIn">
                          <AlertCircle className="w-4 h-4" />
                          {errors.name}
                        </div>
                      )}
                    </div>

                    <div className="relative group">
                      <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-blue-500' : 'text-gray-400'}`} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => handleFocus('email')}
                        onBlur={handleBlur}
                        placeholder="your.email@example.com *"
                        className={getFieldClasses('email')}
                      />
                      {errors.email && (
                        <div className="flex items-center gap-2 mt-2 text-red-500 text-sm animate-slideIn">
                          <AlertCircle className="w-4 h-4" />
                          {errors.email}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company & Phone Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative group">
                      <Globe className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'company' ? 'text-blue-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        onFocus={() => handleFocus('company')}
                        onBlur={handleBlur}
                        placeholder="Company name (optional)"
                        className={getFieldClasses('company')}
                      />
                    </div>

                    <div className="relative group">
                      <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'phone' ? 'text-blue-500' : 'text-gray-400'}`} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onFocus={() => handleFocus('phone')}
                        onBlur={handleBlur}
                        placeholder="Phone number (optional)"
                        className={getFieldClasses('phone')}
                      />
                      {errors.phone && (
                        <div className="flex items-center gap-2 mt-2 text-red-500 text-sm animate-slideIn">
                          <AlertCircle className="w-4 h-4" />
                          {errors.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="relative group">
                    <Edit3 className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'subject' ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onFocus={() => handleFocus('subject')}
                      onBlur={handleBlur}
                      placeholder="What's this about? *"
                      className={getFieldClasses('subject')}
                    />
                    {errors.subject && (
                      <div className="flex items-center gap-2 mt-2 text-red-500 text-sm animate-slideIn">
                        <AlertCircle className="w-4 h-4" />
                        {errors.subject}
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div className="relative group">
                    <MessageSquare className={`absolute left-4 top-4 w-5 h-5 transition-colors ${focusedField === 'message' ? 'text-blue-500' : 'text-gray-400'}`} />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => handleFocus('message')}
                      onBlur={handleBlur}
                      ref={messageRef}
                      placeholder="Tell us more about your project or question... *"
                      rows={4}
                      className={`${getFieldClasses('message')} resize-none`}
                    />
                    {errors.message && (
                      <div className="flex items-center gap-2 mt-2 text-red-500 text-sm animate-slideIn">
                        <AlertCircle className="w-4 h-4" />
                        {errors.message}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={formStatus === 'loading'}
                    className={`w-full relative overflow-hidden rounded-xl px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                      formStatus === 'loading'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-blue-500/25'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      {formStatus === 'loading' ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </div>
                  </button>
                </div>

                {/* Status Messages */}
                {formStatus === 'success' && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-slideIn">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-semibold text-green-800 dark:text-green-400">Message sent successfully!</p>
                        <p className="text-sm text-green-600 dark:text-green-300">We'll get back to you within 24 hours.</p>
                      </div>
                    </div>
                  </div>
                )}

                {formStatus === 'error' && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-slideIn">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <div>
                        <p className="font-semibold text-red-800 dark:text-red-400">Something went wrong</p>
                        <p className="text-sm text-red-600 dark:text-red-300">Please try again or contact us directly.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 pointer-events-none"></div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Get in Touch</h3>
                <div className="space-y-4">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Business Hours</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { day: 'Monday - Friday', time: '9:00 AM - 6:00 PM' },
                    { day: 'Saturday', time: '10:00 AM - 4:00 PM' },
                    { day: 'Sunday', time: 'Closed' }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <span className="text-gray-700 dark:text-gray-300">{item.day}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5 pointer-events-none"></div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg ${social.color}`}
                      title={social.name}
                    >
                      <span className="text-xl">{social.icon}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-6 max-w-7xl mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Find Us</h3>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <iframe
                title="Omnis Intelligence Location"
                src="https://maps.google.com/maps?q=Innovation%20City&t=&z=13&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="400"
                className="w-full border-none"
                loading="lazy"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ContactForm;