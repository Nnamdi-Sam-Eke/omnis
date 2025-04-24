// src/StripeProvider.js
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe("pk_test_51RH5xqQWRAMN8xYLaERS5Uno5dfcY27wzsxJAXaVMJ89ts1VZVwvTsYu0NTtjCRCnfsvMnuLWg7AOv1c8F3eohR400MD9eUIO6");

const StripeProvider = ({ children }) => {
  return <Elements stripe={stripePromise}>{children}</Elements>;
};

export default StripeProvider;
// src/StripeProvider.js
// import React from 'react';