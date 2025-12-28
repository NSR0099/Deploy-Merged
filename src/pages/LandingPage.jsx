// src/LandingPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();
  
  // Initialize animations and event listeners
  useEffect(() => {
    // Scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const fadeElements = document.querySelectorAll('.achievement-card, .about-item, .collaborator-card');
    fadeElements.forEach(el => {
      el.classList.add('fade-in');
      observer.observe(el);
    });
    
    // Cleanup
    return () => {
      fadeElements.forEach(el => observer.unobserve(el));
    };
  }, []);
  
  // Mobile menu toggle
  const toggleMobileMenu = () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    }
  };

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  // Smooth scroll
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Close mobile menu
      const navMenu = document.querySelector('.nav-menu');
      const hamburger = document.querySelector('.hamburger');
      if (navMenu?.classList.contains('active')) {
        navMenu.classList.remove('active');
        hamburger?.classList.remove('active');
      }
    }
  };

  // Update active nav link on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.nav-link');
      
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 150)) {
          current = section.getAttribute('id');
        }
      });
      
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <nav className="navbar">
          <div className="logo-container">
            <div className="logo-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h1 className="logo-text">SmartIES</h1>
          </div>
          
          <ul className="nav-menu">
            <li className="nav-item">
              <a href="#home" className="nav-link active" onClick={(e) => handleSmoothScroll(e, '#home')}>
                Home
              </a>
            </li>
            <li className="nav-item">
              <a href="#about" className="nav-link" onClick={(e) => handleSmoothScroll(e, '#about')}>
                About
              </a>
            </li>
            <li className="nav-item">
              <a href="#achievements" className="nav-link" onClick={(e) => handleSmoothScroll(e, '#achievements')}>
                Past Achievements
              </a>
            </li>
            <li className="nav-item">
              <a href="#collaborators" className="nav-link" onClick={(e) => handleSmoothScroll(e, '#collaborators')}>
                Contact
              </a>
            </li>
            <li className="nav-item">
              <button className="nav-link login-btn" onClick={handleLogin}>
                Login
              </button>
            </li>
          </ul>
          
          <div className="hamburger" onClick={toggleMobileMenu}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-image">
              <img 
                src="https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1025&q=80" 
                alt="Emergency Response Coordination" 
              />
            </div>
            <div className="hero-content">
              <h2 className="hero-title">Smart Incident Emergency System</h2>
              <p className="hero-description">
                Our advanced system leverages cutting-edge technology to detect incidents in real-time, 
                enabling fast coordination between police, hospitals, and telecom services. By integrating 
                multiple emergency response channels, we've successfully reduced emergency response times 
                by up to 40% in pilot cities.
              </p>
              <div className="hero-buttons">
                <button className="btn btn-primary" onClick={(e) => handleSmoothScroll(e, '#about')}>
                  Our Vision
                </button>
                <button className="btn btn-secondary" onClick={(e) => handleSmoothScroll(e, '#achievements')}>
                  Happy Users
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="achievements">
        <div className="container">
          <h2 className="section-title">Our Past Achievements</h2>
          <p className="section-subtitle">Transforming emergency response through technology and innovation</p>
          
          <div className="achievements-grid">
            <div className="achievement-card">
              <div className="achievement-icon">
                <i className="fas fa-ambulance"></i>
              </div>
              <h3 className="achievement-number">25,000+</h3>
              <h4 className="achievement-title">Incidents Handled</h4>
              <p className="achievement-description">Successfully managed and coordinated emergency responses across multiple cities.</p>
            </div>
            
            <div className="achievement-card">
              <div className="achievement-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h3 className="achievement-number">40%</h3>
              <h4 className="achievement-title">Response Time Reduced</h4>
              <p className="achievement-description">Average emergency response time decreased significantly through our system.</p>
            </div>
            
            <div className="achievement-card">
              <div className="achievement-icon">
                <i className="fas fa-city"></i>
              </div>
              <h3 className="achievement-number">15+</h3>
              <h4 className="achievement-title">Cities Covered</h4>
              <p className="achievement-description">Currently operating in major metropolitan areas with plans to expand nationwide.</p>
            </div>
            
            <div className="achievement-card">
              <div className="achievement-icon">
                <i className="fas fa-life-ring"></i>
              </div>
              <h3 className="achievement-number">50,000+</h3>
              <h4 className="achievement-title">Lives Impacted</h4>
              <p className="achievement-description">Positive impact on citizens through faster emergency assistance and support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <h2 className="section-title">About Our System</h2>
          <p className="section-subtitle">Revolutionizing emergency response through smart technology integration</p>
          
          <div className="about-grid">
            <div className="about-item">
              <div className="about-icon">
                <i className="fas fa-bolt"></i>
              </div>
              <h3 className="about-title">Real-Time Detection</h3>
              <p className="about-description">Advanced sensors and AI algorithms detect incidents as they happen, triggering immediate response protocols.</p>
            </div>
            
            <div className="about-item">
              <div className="about-icon">
                <i className="fas fa-network-wired"></i>
              </div>
              <h3 className="about-title">Multi-Agency Coordination</h3>
              <p className="about-description">Seamlessly connect police, fire departments, hospitals, and telecom services on a unified platform.</p>
            </div>
            
            <div className="about-item">
              <div className="about-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="about-title">Data-Driven Insights</h3>
              <p className="about-description">Analytics and reporting tools help optimize response strategies and resource allocation.</p>
            </div>
            
            <div className="about-item">
              <div className="about-icon">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h3 className="about-title">Citizen Integration</h3>
              <p className="about-description">Mobile apps allow citizens to report incidents and receive emergency alerts in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Collaborators Section */}
      <section id="collaborators" className="collaborators">
        <div className="container">
          <h2 className="section-title">Our Collaborators</h2>
          <p className="section-subtitle">Partnering with leading organizations for comprehensive emergency response</p>
          
          <div className="collaborators-grid">
            <div className="collaborator-card">
              <div className="collaborator-logo">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="collaborator-name">Police Corporations</h3>
              <p className="collaborator-description">Strategic partnerships with law enforcement agencies across the country.</p>
            </div>
            
            <div className="collaborator-card">
              <div className="collaborator-logo">
                <i className="fas fa-satellite-dish"></i>
              </div>
              <h3 className="collaborator-name">Telecom Companies</h3>
              <p className="collaborator-description">Collaboration with major telecom providers for seamless communication.</p>
            </div>
            
            <div className="collaborator-card">
              <div className="collaborator-logo">
                <i className="fas fa-hospital"></i>
              </div>
              <h3 className="collaborator-name">Hospital Networks</h3>
              <p className="collaborator-description">Integration with healthcare facilities for rapid medical response.</p>
            </div>
            
            <div className="collaborator-card">
              <div className="collaborator-logo">
                <i className="fas fa-fire-extinguisher"></i>
              </div>
              <h3 className="collaborator-name">Emergency Services</h3>
              <p className="collaborator-description">Partnership with fire departments and rescue organizations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="logo-container footer-logo">
                <div className="logo-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h2 className="logo-text">SmartIES</h2>
              </div>
              <p className="footer-description">
                Transforming emergency response through intelligent technology and coordinated action.
              </p>
            </div>
            
            <div className="footer-col">
              <h3 className="footer-title">Quick Links</h3>
              <ul className="footer-links">
                <li><a href="#home" onClick={(e) => handleSmoothScroll(e, '#home')}>Home</a></li>
                <li><a href="#about" onClick={(e) => handleSmoothScroll(e, '#about')}>About</a></li>
                <li><a href="#achievements" onClick={(e) => handleSmoothScroll(e, '#achievements')}>Achievements</a></li>
                <li><a href="#collaborators" onClick={(e) => handleSmoothScroll(e, '#collaborators')}>Contact</a></li>
              </ul>
            </div>
            
            <div className="footer-col">
              <h3 className="footer-title">Contact Us</h3>
              <ul className="footer-contact">
                <li><i className="fas fa-map-marker-alt"></i> 123 Emergency Lane, Response City</li>
                <li><i className="fas fa-phone"></i> +1 (555) 123-HELP</li>
                <li><i className="fas fa-envelope"></i> info@smarties-response.org</li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Smart Incident Emergency System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;