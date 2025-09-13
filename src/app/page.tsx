import Link from 'next/link'
import { ArrowRight, Users, BarChart3, Shield, Heart } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Kumu Coaching</span>
            </div>
            <Link
              href="/admin/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              Admin Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Your Life with
            <span className="text-blue-600"> Kumu Coaching</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Unlock your potential with personalized coaching, expert guidance, and a supportive community 
            dedicated to your success and well-being.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              Start Your Journey
            </button>
            <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <Users className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Coaches</h3>
            <p className="text-gray-600">
              Work with certified professionals who understand your goals and challenges.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <BarChart3 className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Progress</h3>
            <p className="text-gray-600">
              Monitor your growth with detailed analytics and personalized insights.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <Shield className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Platform</h3>
            <p className="text-gray-600">
              Your data and progress are protected with enterprise-grade security.
            </p>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Choose Your Coaching Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Basic Plan',
                price: '$29.99',
                period: '/month',
                features: ['Basic coaching materials', 'Monthly group sessions', 'Email support', 'Progress tracking'],
                popular: false
              },
              {
                name: 'Premium Plan',
                price: '$79.99',
                period: '/month',
                features: ['Everything in Basic', 'Weekly 1-on-1 sessions', 'Priority support', 'Advanced materials', 'Custom workout plans', 'Nutrition guidance'],
                popular: true
              },
              {
                name: 'Quarterly Premium',
                price: '$203.97',
                period: '/quarter',
                features: ['Everything in Premium', '15% savings', 'Quarterly progress review', 'Exclusive content'],
                popular: false
              },
              {
                name: 'Annual Elite',
                price: '$719.88',
                period: '/year',
                features: ['Everything in Premium', '25% savings', 'Annual assessment', 'Exclusive content', 'Priority booking', 'Lifetime access'],
                popular: false
              }
            ].map((plan, index) => (
              <div key={index} className={`bg-white p-6 rounded-xl shadow-lg ${plan.popular ? 'ring-2 ring-blue-600 relative' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                  plan.popular 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
                }`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Heart className="h-6 w-6 text-blue-400" />
              <span className="ml-2 text-xl font-bold">Kumu Coaching</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 mb-2">© 2024 Kumu Coaching. All rights reserved.</p>
              <Link
                href="/admin/login"
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                Admin Panel
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}