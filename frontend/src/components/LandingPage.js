import React from 'react';
import { useNavigate } from 'react-router-dom';
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
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight">
                Turn conversations into <span className="text-primary">system diagrams</span> automatically
              </h1>
              <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                Sematic listens to your meetings and instantly generates comprehensive system architecture diagrams,
                accelerating your development process from ideation to implementation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={onGetStarted}>
                Get Started
              </Button>
            </div>

            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Real-time processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Enterprise ready</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <DiagramAnimation />
          </div>
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
      company: "TechCorp",
    },
    {
      value: "95% accuracy",
      label: "in system mapping",
      company: "DevTeam",
    },
    {
      value: "50% reduction",
      label: "in planning time",
      company: "StartupXYZ",
    },
    {
      value: "99.9% uptime",
      label: "enterprise reliability",
      company: "BigCorp",
    },
  ]

  return (
    <section className="py-16 border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="text-2xl lg:text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="text-xs text-muted-foreground/70">{stat.company}</div>
            </div>
          ))}
        </div>
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
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance">Accelerate your development process</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            From meeting to implementation in minutes, not hours. Let AI handle the documentation while you focus on
            building.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="text-3xl mb-2">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection({ onGetStarted }) {
  return (
    <section id="pricing" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your team's needs. Start free and scale as you grow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-background rounded-lg p-8 border border-border">
            <h3 className="text-2xl font-bold mb-4">Starter</h3>
            <div className="text-4xl font-bold mb-6">Free</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Up to 5 meetings/month
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Basic diagram generation
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Export to PNG/SVG
              </li>
            </ul>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={onGetStarted}>
              Get Started
            </Button>
          </div>

          <div className="bg-background rounded-lg p-8 border-2 border-primary relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold mb-4">Professional</h3>
            <div className="text-4xl font-bold mb-6">
              $29<span className="text-lg text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Unlimited meetings
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Advanced AI models
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Real-time collaboration
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                API access
              </li>
            </ul>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={onGetStarted}>
              Start Free Trial
            </Button>
          </div>

          <div className="bg-background rounded-lg p-8 border border-border">
            <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
            <div className="text-4xl font-bold mb-6">Custom</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Custom integrations
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                On-premise deployment
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Dedicated support
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                SLA guarantees
              </li>
            </ul>
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function DocsSection() {
  return (
    <section id="docs" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Documentation & Resources</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to get started with Sematic and integrate it into your workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-colors">
            <h3 className="text-xl font-bold mb-3">Quick Start Guide</h3>
            <p className="text-muted-foreground mb-4">
              Get up and running with Sematic in under 5 minutes. Connect your meeting platform and start generating
              diagrams.
            </p>
            <button className="text-primary hover:text-primary/80 font-medium text-left">
              Read Guide →
            </button>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-colors">
            <h3 className="text-xl font-bold mb-3">API Reference</h3>
            <p className="text-muted-foreground mb-4">
              Complete API documentation with examples for integrating Sematic into your existing tools and workflows.
            </p>
            <button className="text-primary hover:text-primary/80 font-medium text-left">
              View API Docs →
            </button>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-colors">
            <h3 className="text-xl font-bold mb-3">Integrations</h3>
            <p className="text-muted-foreground mb-4">
              Connect Sematic with Zoom, Teams, Slack, Figma, and dozens of other tools your team already uses.
            </p>
            <button className="text-primary hover:text-primary/80 font-medium text-left">
              Browse Integrations →
            </button>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-colors">
            <h3 className="text-xl font-bold mb-3">Best Practices</h3>
            <p className="text-muted-foreground mb-4">
              Learn how top engineering teams use Sematic to streamline their design process and improve collaboration.
            </p>
            <button className="text-primary hover:text-primary/80 font-medium text-left">
              Read Best Practices →
            </button>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-colors">
            <h3 className="text-xl font-bold mb-3">Troubleshooting</h3>
            <p className="text-muted-foreground mb-4">
              Common issues and solutions to help you get the most out of Sematic's AI-powered diagram generation.
            </p>
            <button className="text-primary hover:text-primary/80 font-medium text-left">
              Get Help →
            </button>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-colors">
            <h3 className="text-xl font-bold mb-3">Community</h3>
            <p className="text-muted-foreground mb-4">
              Join our community of developers and designers sharing tips, templates, and use cases.
            </p>
            <button className="text-primary hover:text-primary/80 font-medium text-left">
              Join Community →
            </button>
          </div>
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
          <p className="text-sm text-muted-foreground">© 2024 Sematic. All rights reserved.</p>
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