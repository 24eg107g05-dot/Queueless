import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Clock, Smartphone, MessageSquare, List } from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="flex flex-col min-h-[calc(100vh-130px)]">
      {/* Hero Section */}
      <section className="flex-1 flex items-center bg-gradient-to-br from-primary-50 to-indigo-50 py-20 px-4 sm:px-6 lg:px-8 rounded-3xl mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Skip the Queue, <br className="hidden sm:block" />
            <span className="text-primary-600">Not the Service</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            QueueLess is the smart way to manage your time. Get virtual tokens, track your position in real-time, and arrive exactly when it's your turn.
          </p>
          <div className="flex justify-center gap-4">
            {isAuthenticated ? (
              <Link 
                to={user?.role === 'ADMIN' ? '/admin' : user?.role === 'STAFF' ? '/staff' : '/dashboard'}
                className="bg-primary-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 flex items-center gap-2"
              >
                Go to Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="bg-primary-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
                  Get Started
                </Link>
                <Link to="/login" className="bg-white text-primary-600 px-8 py-4 rounded-xl text-lg font-medium border border-primary-100 hover:bg-primary-50 transition-colors">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why choose QueueLess?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={Smartphone} 
              title="Virtual Tokens" 
              desc="Book your spot from anywhere. No need to physically wait in line."
            />
            <FeatureCard 
              icon={Clock} 
              title="Real-time Updates" 
              desc="Watch the queue progress live and get estimated wait times."
            />
            <FeatureCard 
              icon={MessageSquare} 
              title="AI Assistant" 
              desc="Got questions? Our smart AI assistant is ready to help 24/7."
            />
            <FeatureCard 
              icon={List} 
              title="Multi-service" 
              desc="One app for hospitals, banks, government offices and more."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white rounded-3xl px-4 sm:px-6 lg:px-8 mb-8 border border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How it works</h2>
          <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 md:gap-4 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gray-200 z-0"></div>
            <Step number="1" title="Register" desc="Create your free account in seconds." />
            <Step number="2" title="Select Service" desc="Find the hospital or bank you need to visit." />
            <Step number="3" title="Get Token" desc="Reserve your spot with one tap." />
            <Step number="4" title="Track Live" desc="Monitor progress and get notified." />
            <Step number="5" title="Done!" desc="Show up when it's your turn." />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-primary-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{desc}</p>
  </div>
);

const Step = ({ number, title, desc }) => (
  <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/5">
    <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xl mb-4 border-4 border-white shadow-sm">
      {number}
    </div>
    <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
    <p className="text-sm text-gray-500 px-2">{desc}</p>
  </div>
);

export default LandingPage;
