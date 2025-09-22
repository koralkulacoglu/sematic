import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { DiagramAnimation } from './DiagramAnimation';

function Header({ onSignIn, onGetStarted }) {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src="/sematic_2.png" alt="Sematic" className="w-8 h-8" />
          <span className="text-xl font-bold text-foreground">Sematic</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <button onClick={() => scrollToSection('features')} className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </button>
          <button onClick={() => scrollToSection('pricing')} className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </button>
          <button onClick={() => scrollToSection('docs')} className="text-muted-foreground hover:text-foreground transition-colors">
            Docs
          </button>
        </nav>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={onSignIn}>
            Sign In
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={onGetStarted}>
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  )
}

function HeroSection({ onGetStarted, onSignIn }) {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight">
                Transform meetings into <span className="text-primary">architecture diagrams</span> instantly
              </h1>
              <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                Stop drawing diagrams by hand. Sematic uses AI to listen to your conversations and automatically 
                create professional system architecture diagrams in real-time.
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={onGetStarted}>
                Get Started
              </Button>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-6 text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span>Real-time processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span>Enterprise ready</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <DiagramAnimation />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const stats = [
    {
      value: "10x faster",
      label: "diagram creation",
    },
    {
      value: "95% accuracy",
      label: "in system mapping",
    },
    {
      value: "50% reduction",
      label: "in planning time",
    },
    {
      value: "99.9% uptime",
      label: "enterprise reliability",
    },
  ]

  return (
    <section className="py-16 border-y border-border/50">
      <div className="container mx-auto px-4">
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center space-y-2"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut" 
              }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <motion.div 
                className="text-2xl lg:text-3xl font-bold text-primary"
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1 + 0.2,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
              >
                {stat.value}
              </motion.div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      title: "Real-time Speech Processing",
      description: "Advanced AI listens to your meetings and extracts architectural concepts in real-time.",
      icon: "🎤",
    },
    {
      title: "Intelligent Diagram Generation",
      description: "Automatically creates comprehensive system diagrams with proper relationships and dependencies.",
      icon: "🔗",
    },
    {
      title: "Multi-format Export",
      description: "Export diagrams in various formats including Mermaid, PlantUML, and visual formats.",
      icon: "📊",
    },
    {
      title: "Team Collaboration",
      description: "Share and collaborate on diagrams with your team in real-time with version control.",
      icon: "👥",
    },
    {
      title: "Integration Ready",
      description: "Seamlessly integrates with popular development tools and project management platforms.",
      icon: "🔧",
    },
    {
      title: "Enterprise Security",
      description: "Bank-level security with end-to-end encryption and compliance certifications.",
      icon: "🔒",
    },
  ]

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-balance">Accelerate your development process</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            From meeting to implementation in minutes, not hours. Let AI handle the documentation while you focus on
            building.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut" 
              }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
            >
              <Card className="bg-card border-border hover:border-primary/50 transition-colors h-full">
                <CardHeader>
                  <motion.div 
                    className="text-3xl mb-2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1 + 0.2,
                      type: "spring",
                      stiffness: 200
                    }}
                    viewport={{ once: true }}
                  >
                    {feature.icon}
                  </motion.div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection({ onGetStarted }) {
  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      features: ["Up to 5 meetings/month", "Basic diagram generation", "Export to PNG/SVG"],
      button: "Get Started",
      popular: false
    },
    {
      name: "Professional", 
      price: "$29",
      priceNote: "/month",
      features: ["Unlimited meetings", "Advanced AI models", "Real-time collaboration", "API access"],
      button: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: ["Custom integrations", "On-premise deployment", "Dedicated support", "SLA guarantees"],
      button: "Contact Sales",
      popular: false,
      variant: "outline"
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your team's needs. Start free and scale as you grow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              className={`bg-background rounded-lg p-8 border ${plan.popular ? 'border-2 border-primary' : 'border-border'} relative`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut" 
              }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ 
                y: plan.popular ? 0 : -10, 
                transition: { duration: 0.3 },
                scale: plan.popular ? 1 : 1.02
              }}
            >
              {plan.popular && (
                <motion.div 
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1 + 0.3,
                    type: "spring",
                    stiffness: 200
                  }}
                  viewport={{ once: true }}
                >
                  Most Popular
                </motion.div>
              )}
              
              <motion.h3 
                className="text-2xl font-bold mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                viewport={{ once: true }}
              >
                {plan.name}
              </motion.h3>
              
              <motion.div 
                className="text-4xl font-bold mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1 + 0.3,
                  type: "spring",
                  stiffness: 200
                }}
                viewport={{ once: true }}
              >
                {plan.price}{plan.priceNote && <span className="text-lg text-muted-foreground">{plan.priceNote}</span>}
              </motion.div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li 
                    key={featureIndex}
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1 + 0.4 + featureIndex * 0.1 
                    }}
                    viewport={{ once: true }}
                  >
                    <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                    {feature}
                  </motion.li>
                ))}
              </ul>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1 + 0.6 
                }}
                viewport={{ once: true }}
              >
                <Button 
                  className={plan.variant === 'outline' 
                    ? "w-full border-primary text-primary hover:bg-primary/10" 
                    : "w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  }
                  variant={plan.variant || "default"}
                  onClick={onGetStarted}
                >
                  {plan.button}
                </Button>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DocsSection() {
  const docItems = [
    {
      title: "Quick Start Guide",
      description: "Get up and running with Sematic in under 5 minutes. Connect your meeting platform and start generating diagrams.",
      link: "Read Guide →"
    },
    {
      title: "API Reference", 
      description: "Complete API documentation with examples for integrating Sematic into your existing tools and workflows.",
      link: "View API Docs →"
    },
    {
      title: "Integrations",
      description: "Connect Sematic with Zoom, Teams, Slack, Figma, and dozens of other tools your team already uses.",
      link: "Browse Integrations →"
    },
    {
      title: "Best Practices",
      description: "Learn how top engineering teams use Sematic to streamline their design process and improve collaboration.",
      link: "Read Best Practices →"
    },
    {
      title: "Troubleshooting",
      description: "Common issues and solutions to help you get the most out of Sematic's AI-powered diagram generation.",
      link: "Get Help →"
    },
    {
      title: "Community",
      description: "Join our community of developers and designers sharing tips, templates, and use cases.",
      link: "Join Community →"
    }
  ];

  return (
    <section id="docs" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-4xl font-bold mb-4">Documentation & Resources</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to get started with Sematic and integrate it into your workflow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {docItems.map((item, index) => (
            <motion.div
              key={index}
              className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-colors"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut" 
              }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ 
                y: -5, 
                transition: { duration: 0.3 }
              }}
            >
              <motion.h3 
                className="text-xl font-bold mb-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                viewport={{ once: true }}
              >
                {item.title}
              </motion.h3>
              
              <motion.p 
                className="text-muted-foreground mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                viewport={{ once: true }}
              >
                {item.description}
              </motion.p>
              
              <motion.button 
                className="text-primary hover:text-primary/80 font-medium text-left"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                viewport={{ once: true }}
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                {item.link}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/sematic_2.png" alt="Sematic" className="w-8 h-8" />
              <span className="text-xl font-bold">Sematic</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Transforming conversations into system diagrams with AI-powered precision.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button className="hover:text-foreground transition-colors text-left">
                  Features
                </button>
              </li>
              <li>
                <button className="hover:text-foreground transition-colors text-left">
                  Pricing
                </button>
              </li>
              <li>
                <button className="hover:text-foreground transition-colors text-left">
                  API
                </button>
              </li>
              <li>
                <button className="hover:text-foreground transition-colors text-left">
                  Integrations
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button className="hover:text-foreground transition-colors text-left">
                  About
                </button>
              </li>
              <li>
                <button className="hover:text-foreground transition-colors text-left">
                  Blog
                </button>
              </li>
              <li>
                <button className="hover:text-foreground transition-colors text-left">
                  Careers
                </button>
              </li>
              <li>
                <button className="hover:text-foreground transition-colors text-left">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button className="hover:text-foreground transition-colors text-left">
                  Documentation
                </button>
              </li>
              <li>
                <button className="hover:text-foreground transition-colors text-left">
                  Help Center
                </button>
              </li>
              <li>
                <button className="hover:text-foreground transition-colors text-left">
                  Community
                </button>
              </li>
              <li>
                <button className="hover:text-foreground transition-colors text-left">
                  Status
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">© 2025 Sematic. All rights reserved.</p>
          <div className="flex space-x-6 text-sm text-muted-foreground mt-4 md:mt-0">
            <button className="hover:text-foreground transition-colors">
              Privacy
            </button>
            <button className="hover:text-foreground transition-colors">
              Terms
            </button>
            <button className="hover:text-foreground transition-colors">
              Security
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleGetStarted = () => {
    navigate('/login?mode=signup');
  };

  return (
    <div className="min-h-screen bg-background text-foreground grid-pattern">
      <Header onSignIn={handleSignIn} onGetStarted={handleGetStarted} />
      <main>
        <HeroSection onGetStarted={handleGetStarted} onSignIn={handleSignIn} />
        <StatsSection />
        <FeaturesSection />
        <PricingSection onGetStarted={handleGetStarted} />
        <DocsSection />
        <Footer />
      </main>
    </div>
  );
}