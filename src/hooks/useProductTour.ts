import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Step, CallBackProps, STATUS } from 'react-joyride';

export interface TourStep extends Step {
  route?: string;
  beforeRoute?: () => void;
}

const TOUR_STORAGE_KEY = 'product-tour-completed';
const TOUR_DISMISSED_KEY = 'product-tour-dismissed';

export const useProductTour = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Check if user has completed or dismissed the tour
  useEffect(() => {
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    const tourDismissed = localStorage.getItem(TOUR_DISMISSED_KEY);
    const isFirstVisit = !tourCompleted && !tourDismissed;
    
    // Auto-start tour on first visit after a brief delay
    if (isFirstVisit && location.pathname === '/') {
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const tourSteps: TourStep[] = [
    {
      target: 'body',
      content: 'Welcome to OpenTeknologies! 🎉 Let\'s take a quick tour of our platform\'s key features. This will only take 2 minutes.',
      placement: 'center',
      disableBeacon: true,
      title: 'Welcome!',
    },
    {
      target: '[data-tour="hero-section"]',
      content: 'Create custom designs using our advanced AI tools. Generate unique clothing, furniture, and accessories with just a text prompt.',
      placement: 'bottom',
      title: 'AI-Powered Design Generation',
    },
    {
      target: '[data-tour="create-button"]',
      content: 'Click here to access our AI image generator. You can use text prompts, reference images, or both to create your perfect design.',
      placement: 'bottom',
      title: 'Start Creating',
    },
    {
      target: '[data-tour="features-section"]',
      content: 'Explore our comprehensive features including AI generation, marketplace, production workflow, and real-time order tracking.',
      placement: 'top',
      title: 'Platform Features',
    },
    {
      target: 'body',
      route: '/marketplace',
      content: 'Browse and purchase designs from talented creators. Filter by category, style, and price range.',
      placement: 'center',
      title: 'Marketplace',
    },
    {
      target: '[data-tour="marketplace-filters"]',
      route: '/marketplace',
      content: 'Use our advanced filters to find exactly what you\'re looking for. Search by category, design style, creator, and price range.',
      placement: 'bottom',
      title: 'Smart Filtering',
    },
    {
      target: 'body',
      route: '/create',
      content: 'This is where the magic happens! Enter a prompt, select your preferences, and let AI create your design.',
      placement: 'center',
      title: 'AI Generation Studio',
    },
    {
      target: '[data-tour="generation-form"]',
      route: '/create',
      content: 'Choose your item type, set aspect ratio, add reference images, and customize your generation settings for perfect results.',
      placement: 'right',
      title: 'Design Controls',
    },
    {
      target: 'body',
      route: '/dashboard',
      content: 'Manage your designs, products, orders, and earnings all in one place.',
      placement: 'center',
      title: 'Your Dashboard',
    },
    {
      target: '[data-tour="dashboard-tabs"]',
      route: '/dashboard',
      content: 'Switch between different sections: Overview, Designs, Products, Orders, Earnings, and AI Insights.',
      placement: 'bottom',
      title: 'Dashboard Navigation',
    },
    {
      target: 'body',
      content: 'You\'re all set! 🚀 You now know the basics of OpenTeknologies. Start creating, browsing, or managing your projects! Tip: You can restart this tour anytime from the Help menu.',
      placement: 'center',
      title: 'Ready to Go!',
    },
  ];

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type, index, action } = data;
    
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      setStepIndex(0);
      
      if (status === STATUS.FINISHED) {
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
      } else if (status === STATUS.SKIPPED) {
        localStorage.setItem(TOUR_DISMISSED_KEY, 'true');
      }
      
      // Navigate back to home if not already there
      if (location.pathname !== '/') {
        navigate('/');
      }
    } else if (type === 'step:after') {
      const nextStepIndex = index + (action === 'prev' ? -1 : 1);
      const nextStep = tourSteps[nextStepIndex];
      
      if (nextStep?.route && nextStep.route !== location.pathname) {
        setRun(false);
        navigate(nextStep.route);
        
        // Resume tour after navigation
        setTimeout(() => {
          setStepIndex(nextStepIndex);
          setRun(true);
        }, 500);
      } else {
        setStepIndex(nextStepIndex);
      }
    }
  }, [navigate, location.pathname, tourSteps]);

  const startTour = useCallback(() => {
    setStepIndex(0);
    setRun(true);
    localStorage.removeItem(TOUR_DISMISSED_KEY);
    
    // Navigate to home if not already there
    if (location.pathname !== '/') {
      navigate('/');
    }
  }, [navigate, location.pathname]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    localStorage.removeItem(TOUR_DISMISSED_KEY);
    startTour();
  }, [startTour]);

  return {
    run,
    stepIndex,
    tourSteps,
    handleJoyrideCallback,
    startTour,
    resetTour,
  };
};
