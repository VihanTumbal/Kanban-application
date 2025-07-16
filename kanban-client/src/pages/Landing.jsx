import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const workflowSteps = [
    {
      step: "01",
      title: "Create Your Board",
      description: "Start with a clean slate. Create project boards that reflect your team's unique workflow.",
      icon: "🎯",
      color: "from-accent/20 to-primary-500/20"
    },
    {
      step: "02", 
      title: "Add Tasks & Lists",
      description: "Break down your project into manageable tasks organized in customizable lists.",
      icon: "📝",
      color: "from-primary-500/20 to-purple-500/20"
    },
    {
      step: "03",
      title: "Collaborate & Track",
      description: "Invite your team, assign tasks, and watch your project progress in real-time.",
      icon: "🚀",
      color: "from-purple-500/20 to-accent/20"
    }
  ];

  const features = [
    {
      title: "Drag & Drop Magic",
      description: "Effortless task management with smooth drag-and-drop interactions",
      number: "01"
    },
    {
      title: "Real-time Sync",
      description: "Your team stays in sync with instant updates across all devices",
      number: "02"
    },
    {
      title: "Smart Organization", 
      description: "Intelligent categorization and filtering to keep you focused",
      number: "03"
    },
    {
      title: "Progress Insights",
      description: "Visual analytics to track your team's productivity and milestones",
      number: "04"
    }
  ];

  const stats = [
    { label: "Active Teams", value: "2.5K+", icon: "👥" },
    { label: "Projects Completed", value: "15K+", icon: "✅" },
    { label: "Tasks Managed", value: "100K+", icon: "📋" },
    { label: "Happy Users", value: "98%", icon: "😊" }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Floating Navigation */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-card/20 backdrop-blur-2xl border border-border/50 rounded-full px-8 py-4 shadow-2xl">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-textPrimary to-accent bg-clip-text text-transparent">
              FlowBoard
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-textSecondary hover:text-accent transition-colors text-sm font-medium">Features</a>
            <a href="#workflow" className="text-textSecondary hover:text-accent transition-colors text-sm font-medium">Workflow</a>
            <a href="#stats" className="text-textSecondary hover:text-accent transition-colors text-sm font-medium">Stats</a>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-textSecondary hover:text-textPrimary px-4 py-2 rounded-full transition-colors text-sm font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r from-accent to-primary-500 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-accent/20 to-primary-500/20 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-to-r from-purple-500/10 to-accent/10 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-24">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-accent/10 border border-accent/20 rounded-full px-6 py-2 mb-8">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
              <span className="text-accent text-sm font-medium">Now with AI-powered insights</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <div className="overflow-hidden">
              <span className="block bg-gradient-to-r from-textPrimary via-accent to-primary-500 bg-clip-text text-transparent animate-slide-up">
                Work Flows
              </span>
            </div>
            <div className="overflow-hidden">
              <span className="block bg-gradient-to-r from-primary-500 via-purple-500 to-accent bg-clip-text text-transparent animate-slide-up delay-200">
                Like Magic
              </span>
            </div>
          </h1>
          
          <p className="text-xl md:text-2xl text-textSecondary mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-400">
            Transform chaos into clarity with the most intuitive Kanban experience ever created. 
            <span className="text-accent font-medium"> Where productivity meets simplicity.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-fade-in-up delay-600">
            <Link
              to="/register"
              className="group relative bg-gradient-to-r from-accent to-primary-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Start Building</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link
              to="/login"
              className="text-textPrimary border-2 border-border px-8 py-4 rounded-2xl font-bold text-lg hover:border-accent hover:bg-accent/5 transition-all duration-300"
            >
              Sign In
            </Link>
          </div>

          {/* Floating Cards Preview */}
          <div className="relative animate-fade-in-up delay-800">
            <div className="flex flex-wrap justify-center items-start gap-6 max-w-4xl mx-auto">
              <div className="bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl transform rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-500 max-w-xs">
                <div className="w-4 h-4 bg-accent rounded-full mb-3"></div>
                <h3 className="font-bold text-textPrimary mb-2">Design Sprint</h3>
                <p className="text-textSecondary text-sm mb-4">Create wireframes for mobile app</p>
                <div className="flex space-x-2">
                  <div className="w-6 h-6 bg-accent rounded-full text-white text-xs flex items-center justify-center font-bold">A</div>
                  <div className="w-6 h-6 bg-primary-500 rounded-full text-white text-xs flex items-center justify-center font-bold">B</div>
                </div>
              </div>
              <div className="bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl transform -rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-500 max-w-xs mt-8">
                <div className="w-4 h-4 bg-primary-500 rounded-full mb-3"></div>
                <h3 className="font-bold text-textPrimary mb-2">Code Review</h3>
                <p className="text-textSecondary text-sm mb-4">Review authentication module</p>
                <div className="text-xs text-accent bg-accent/10 px-2 py-1 rounded-full inline-block">Due Today</div>
              </div>
              <div className="bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl transform rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-500 max-w-xs">
                <div className="w-4 h-4 bg-purple-500 rounded-full mb-3"></div>
                <h3 className="font-bold text-textPrimary mb-2">User Testing</h3>
                <p className="text-textSecondary text-sm mb-4">Conduct usability sessions</p>
                <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full inline-block">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-textPrimary to-accent bg-clip-text text-transparent">
                Your Workflow,
              </span>
              <br />
              <span className="bg-gradient-to-r from-accent to-primary-500 bg-clip-text text-transparent">
                Simplified
              </span>
            </h2>
            <p className="text-xl text-textSecondary max-w-2xl mx-auto">
              Three simple steps to transform how your team works together
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {workflowSteps.map((step, index) => (
              <div
                key={index}
                className="group relative"
              >
                <div className={`bg-gradient-to-br ${step.color} p-8 rounded-3xl border border-border/50 hover:border-accent/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2`}>
                  <div className="text-6xl mb-6">{step.icon}</div>
                  <div className="text-5xl font-black text-textSecondary/20 mb-4">{step.step}</div>
                  <h3 className="text-2xl font-bold text-textPrimary mb-4">{step.title}</h3>
                  <p className="text-textSecondary leading-relaxed">{step.description}</p>
                  
                  {/* Connection Line */}
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-accent to-transparent" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-32 px-4 bg-card/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-textPrimary to-primary-500 bg-clip-text text-transparent">
                Built for
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary-500 to-accent bg-clip-text text-transparent">
                Performance
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-card/40 backdrop-blur-xl border border-border rounded-3xl p-8 hover:border-accent/50 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-4 right-4 text-6xl font-black text-textSecondary/10 group-hover:text-accent/20 transition-colors">
                  {feature.number}
                </div>
                <h3 className="text-2xl font-bold text-textPrimary mb-4 relative z-10">
                  {feature.title}
                </h3>
                <p className="text-textSecondary leading-relaxed relative z-10">
                  {feature.description}
                </p>
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-textPrimary to-accent bg-clip-text text-transparent">
                Trusted by Teams
              </span>
              <br />
              <span className="bg-gradient-to-r from-accent to-primary-500 bg-clip-text text-transparent">
                Worldwide
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center group"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-accent to-primary-500 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-textSecondary font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-2xl rounded-[3rem] p-16 border border-border/50 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary-500/10" />
            <div className="relative z-10">
              <h2 className="text-5xl md:text-6xl font-black mb-8">
                <span className="bg-gradient-to-r from-textPrimary to-accent bg-clip-text text-transparent">
                  Ready to Flow?
                </span>
              </h2>
              <p className="text-xl text-textSecondary mb-12 max-w-2xl mx-auto leading-relaxed">
                Join thousands of teams who've already transformed their workflow. 
                Start your journey to effortless productivity today.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link
                  to="/register"
                  className="group relative bg-gradient-to-r from-accent to-primary-500 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10">Start Free Trial</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
                <Link
                  to="/login"
                  className="text-textPrimary border-2 border-border px-12 py-5 rounded-2xl font-bold text-xl hover:border-accent hover:bg-accent/5 transition-all duration-300"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-textPrimary to-accent bg-clip-text text-transparent">
                FlowBoard
              </span>
            </div>
            <div className="flex items-center space-x-8 text-sm text-textSecondary">
              <a href="#" className="hover:text-accent transition-colors">Privacy</a>
              <a href="#" className="hover:text-accent transition-colors">Terms</a>
              <a href="#" className="hover:text-accent transition-colors">Support</a>
            </div>
            <p className="text-sm text-textSecondary">
              &copy; 2025 FlowBoard. Crafted with 💚 for productive teams.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
