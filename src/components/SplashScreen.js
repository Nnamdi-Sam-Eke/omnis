// SplashScreen.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import favicon from '../images/favicon1.png'

export default function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setShowSplash(false), 7000)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2 }}
            className="flex items-center gap-2"
          >
            <img
              src={favicon}
              alt="App Logo"
              className="w-16 h-16"
            />
            <h1 className="text-4xl font-bold capitalize text-indigo-500 font-poppins ">
              Omnis
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 2.5 }}
            className="text-sm text-gray-600 dark:text-gray-400 mt-3"
          >
            {/* Simulate. Predict. Evolve. */}
           Model. Adapt. Succeed.
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
