'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, Check, MessageCircle, TrendingUp } from 'lucide-react';
import { CTAButton } from '../shared/CTAButton';
import { SectionContainer } from '../shared/SectionContainer';

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <SectionContainer variant="gradient" padding="xl" className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-50" />
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Now in Beta - Join 500+ Creators
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Turn Comments into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Customers
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              Automate your Instagram DM responses without losing the personal touch. 
              Convert 3x more commenters into customers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <CTAButton variant="primary" size="lg" href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </CTAButton>
              <CTAButton variant="outline" size="lg" href="#demo">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </CTAButton>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>14-day free trial</span>
              </div>
            </div>
          </motion.div>
          
          {/* Right: Visual */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-gray-100">
              <div className="aspect-video flex items-center justify-center text-gray-400">
                <p className="text-lg">Dashboard Preview</p>
              </div>
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">New DM Sent</p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">+340% Conversion</p>
                    <p className="text-xs text-gray-500">This week</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </SectionContainer>
  );
}
