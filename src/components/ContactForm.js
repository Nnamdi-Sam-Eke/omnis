import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Edit3, MessageSquare } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import toast from 'react-hot-toast'; // make sure toast styles are included in your layout

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [formStatus, setFormStatus] = useState(null);
  const messageRef = useRef();

  useEffect(() => {
    const ta = messageRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  }, [formData.message]);

  useEffect(() => {
    if (formStatus === 'success') {
      const t = setTimeout(() => setFormStatus(null), 3000);
      return () => clearTimeout(t);
    }
  }, [formStatus]);

  const validators = {
    name: v => v.trim() ? '' : 'Name is required',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Invalid email',
    subject: v => v.trim() ? '' : 'Subject is required',
    message: v => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters'
  };

  const validateField = (name, value) => {
    const error = validators[name]?.(value) || '';
    setErrors(e => ({ ...e, [name]: error }));
    return error;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(d => ({ ...d, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach(k => {
      const err = validators[k]?.(formData[k]);
      if (err) newErrors[k] = err;
    });
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setFormStatus('loading');
    try {
      await new Promise(r => setTimeout(r, 1500));
      setFormStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast.success('Message sent!', { position: 'top-right' });
    } catch {
      setFormStatus('error');
      toast.error('Submission failed', { position: 'top-right' });
    }
  };

  return (
    <div className="w-full px-6 py-10 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white space-y-10">
      {/* Contact Section Layout */}
      <div className="flex flex-col lg:flex-row gap-10 max-w-6xl mx-auto">
        {/* Left: Contact Form */}
        <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-blue-600 dark:text-white mb-6">Contact Us</h2>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Name Field */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={e => validateField(e.target.name, e.target.value)}
                placeholder="Name"
                required
                className={`w-full pl-10 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2
                  ${errors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'}
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white`}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={e => validateField(e.target.name, e.target.value)}
                placeholder="Email"
                required
                className={`w-full pl-10 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2
                  ${errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'}
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white`}
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            {/* Subject Field */}
            <div className="relative">
              <Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                onBlur={e => validateField(e.target.name, e.target.value)}
                placeholder="Subject"
                required
                className={`w-full pl-10 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2
                  ${errors.subject ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'}
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white`}
              />
              {errors.subject && <p className="text-sm text-red-600 mt-1">{errors.subject}</p>}
            </div>

            {/* Message Field */}
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-gray-400" />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                onBlur={e => validateField(e.target.name, e.target.value)}
                ref={messageRef}
                placeholder="Your message..."
                rows={3}
                required
                className={`w-full pl-10 pt-3 pb-3 border rounded-lg shadow-sm resize-none focus:outline-none focus:ring-2
                  ${errors.message ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'}
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white`}
              />
              {errors.message && <p className="text-sm text-red-600 mt-1">{errors.message}</p>}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={formStatus === 'loading' || formStatus === 'success'}
                className="w-full p-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 disabled:opacity-50"
              >
                {formStatus === 'loading' ? 'Sending…' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Info + Hours */}
        <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Our Information</h3>
            <p>Omnis Intelligence Ltd</p>
            <p>123 Future Lane, Innovation City</p>
            <p>Email: support@omnis.ai</p>
            <p>Phone: +1 234 567 8900</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Opening Hours</h3>
            <ul className="space-y-1">
              <li>Mon – Fri: 9:00 AM – 6:00 PM</li>
              <li>Sat: 10:00 AM – 4:00 PM</li>
              <li>Sun: Closed</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Google Map */}
      <div className="max-w-6xl mx-auto rounded-xl overflow-hidden shadow-lg">
        <iframe
          title="Omnis Map"
          src="https://maps.google.com/maps?q=Innovation%20City&t=&z=13&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="350"
          className="w-full border-none"
          loading="lazy"
          allowFullScreen
        ></iframe>
      </div>

      {/* Social Links */}
      <div className="flex justify-center gap-6 text-2xl">
        <a href="https://facebook.com" className="hover:text-blue-600" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
        <a href="https://twitter.com" className="hover:text-blue-400" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
        <a href="https://linkedin.com" className="hover:text-blue-700" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
        <a href="https://instagram.com" className="hover:text-pink-500" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
      </div>

      {/* Newsletter */}
      <div className="max-w-md mx-auto text-center mt-10">
        <h3 className="text-xl font-semibold mb-2">Stay in the loop</h3>
        <p className="text-sm mb-4">Subscribe to get product updates, launch news, and more.</p>
        <form className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
