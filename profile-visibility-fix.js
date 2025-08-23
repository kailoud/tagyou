// Profile Visibility Fix - Comprehensive Solution
// This script ensures the profile elements are always visible and functional

console.log('🔧 Loading comprehensive profile visibility fix...');

// Function to force profile visibility
function forceProfileVisibility() {
  console.log('🔧 Forcing profile visibility...');

  // Get all profile elements
  const profileContainer = document.querySelector('.profile-container');
  const profileSystem = document.querySelector('.profile-system');
  const profileGuest = document.querySelector('.profile-guest');
  const profileSignInBtn = document.querySelector('.profile-signin-btn');
  const profileGuestId = document.getElementById('profileGuest');
  const profileSignInBtnId = document.getElementById('profileSignInBtn');
  const profileAuthenticated = document.getElementById('profileAuthenticated');

  // Force visibility for all profile elements
  const elements = [
    profileContainer,
    profileSystem,
    profileGuest,
    profileSignInBtn,
    profileGuestId,
    profileSignInBtnId,
    profileAuthenticated
  ];

  elements.forEach(element => {
    if (element) {
      element.style.display = 'flex';
      element.style.visibility = 'visible';
      element.style.opacity = '1';
      element.style.position = 'relative';
      element.style.zIndex = '1000';
      element.style.pointerEvents = 'auto';
      console.log('✅ Forced visibility for:', element.className || element.id);
    }
  });

  // Check current screen width
  const screenWidth = window.innerWidth;
  console.log('📱 Current screen width:', screenWidth);

  // Special fixes for problematic ranges
  if (screenWidth >= 361 && screenWidth <= 479) {
    console.log('🎯 In target range (361px-479px) - applying special fixes');

    // Additional fixes for the problematic range
    if (profileContainer) {
      profileContainer.style.position = 'fixed';
      profileContainer.style.top = '20px';
      profileContainer.style.right = '20px';
      profileContainer.style.display = 'flex';
      profileContainer.style.visibility = 'visible';
      profileContainer.style.opacity = '1';
      profileContainer.style.zIndex = '1000';
      profileContainer.style.pointerEvents = 'auto';
      profileContainer.style.flexDirection = 'row';
      profileContainer.style.alignItems = 'center';
      profileContainer.style.justifyContent = 'center';
    }

    if (profileSignInBtn) {
      profileSignInBtn.style.display = 'flex';
      profileSignInBtn.style.visibility = 'visible';
      profileSignInBtn.style.opacity = '1';
      profileSignInBtn.style.position = 'relative';
      profileSignInBtn.style.margin = '0 auto';
      profileSignInBtn.style.justifyContent = 'center';
      profileSignInBtn.style.alignItems = 'center';
      profileSignInBtn.style.minWidth = '120px';
      profileSignInBtn.style.padding = '12px 20px';
      profileSignInBtn.style.fontSize = '14px';
      profileSignInBtn.style.whiteSpace = 'nowrap';
      profileSignInBtn.style.overflow = 'visible';
      profileSignInBtn.style.pointerEvents = 'auto';
      profileSignInBtn.style.cursor = 'pointer';
      console.log('✅ Sign In button styles applied');
    }

    if (profileSystem) {
      profileSystem.style.display = 'flex';
      profileSystem.style.visibility = 'visible';
      profileSystem.style.opacity = '1';
      profileSystem.style.flexDirection = 'row';
      profileSystem.style.alignItems = 'center';
      profileSystem.style.justifyContent = 'center';
      profileSystem.style.pointerEvents = 'auto';
    }

    if (profileGuest) {
      profileGuest.style.display = 'flex';
      profileGuest.style.visibility = 'visible';
      profileGuest.style.opacity = '1';
      profileGuest.style.justifyContent = 'center';
      profileGuest.style.alignItems = 'center';
      profileGuest.style.pointerEvents = 'auto';
    }
  }

  // Ensure guest state is visible when not authenticated
  if (profileGuest && profileAuthenticated) {
    const isAuthenticated = profileAuthenticated.style.display !== 'none';
    if (!isAuthenticated) {
      profileGuest.style.display = 'flex';
      profileGuest.style.visibility = 'visible';
      profileGuest.style.opacity = '1';
      profileGuest.style.pointerEvents = 'auto';
      console.log('✅ Guest state forced visible');
    }
  }
}

// Function to ensure modern profile UI is working
function ensureModernProfileUI() {
  console.log('🎨 Ensuring modern profile UI is working...');

  // Check if we're on mobile
  const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  console.log('📱 Mobile device detected:', isMobile);

  // Check if modern profile UI is available
  if (window.modernProfileUI) {
    console.log('✅ Modern Profile UI is available');
    console.log('🔍 Modern Profile UI methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.modernProfileUI)));

    // Ensure event listeners are set up
    const signInBtn = document.getElementById('profileSignInBtn');
    if (signInBtn) {
      console.log('✅ Sign In button found:', signInBtn);
      console.log('🔍 Sign In button properties:', {
        display: signInBtn.style.display,
        visibility: signInBtn.style.visibility,
        opacity: signInBtn.style.opacity,
        pointerEvents: signInBtn.style.pointerEvents,
        cursor: signInBtn.style.cursor,
        zIndex: signInBtn.style.zIndex,
        touchAction: signInBtn.style.touchAction,
        userSelect: signInBtn.style.userSelect
      });

      // Check if the button already has a click event listener
      const hasClickListener = signInBtn.onclick || signInBtn._hasClickListener;

      if (!hasClickListener) {
        // Function to handle button interaction
        const handleButtonInteraction = (e) => {
          console.log('🔐 Sign In button interacted!', e.type, e);
          e.preventDefault();
          e.stopPropagation();

          if (window.modernProfileUI && window.modernProfileUI.showAuthModal) {
            console.log('✅ Calling showAuthModal...');
            window.modernProfileUI.showAuthModal();

            // Ensure auth modal event listeners are set up after modal is shown
            setTimeout(() => {
              ensureAuthModalEventListeners();
            }, 100);
          } else {
            console.error('❌ Modern Profile UI showAuthModal not available');
            console.log('🔍 Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.modernProfileUI)));
          }
        };

        // Add multiple event listeners for mobile compatibility
        signInBtn.addEventListener('click', handleButtonInteraction);
        signInBtn.addEventListener('touchstart', handleButtonInteraction);
        signInBtn.addEventListener('touchend', handleButtonInteraction);

        // Mark that we've added listeners
        signInBtn._hasClickListener = true;
        console.log('✅ Sign In button event listeners added (click, touchstart, touchend)');
      } else {
        console.log('✅ Sign In button already has event listener');
      }
    } else {
      console.error('❌ Sign In button not found');
    }
  } else {
    console.error('❌ Modern Profile UI not available');
  }
}

// Function to ensure auth modal event listeners are set up
function ensureAuthModalEventListeners() {
  console.log('🔧 Ensuring auth modal event listeners...');

  const authModal = document.getElementById('authModal');
  if (!authModal) {
    console.error('❌ Auth modal not found');
    return;
  }

  // Set up toggle button event listener
  const toggleBtn = authModal.querySelector('#authToggleBtn');
  if (toggleBtn && !toggleBtn._hasToggleListener) {
    console.log('✅ Setting up toggle button event listener');
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🔄 Toggle button clicked');
      if (window.modernProfileUI && window.modernProfileUI.toggleAuthMode) {
        window.modernProfileUI.toggleAuthMode();
      }
    });
    toggleBtn._hasToggleListener = true;
  }

  // Set up forgot password button event listener
  const forgotBtn = authModal.querySelector('#forgotPasswordBtn');
  if (forgotBtn && !forgotBtn._hasForgotListener) {
    console.log('✅ Setting up forgot password button event listener');
    forgotBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🔑 Forgot password button clicked');
      if (window.modernProfileUI && window.modernProfileUI.handleForgotPassword) {
        window.modernProfileUI.handleForgotPassword();
      }
    });
    forgotBtn._hasForgotListener = true;
  }

  // Set up form submit event listener
  const form = authModal.querySelector('#authForm');
  if (form && !form._hasSubmitListener) {
    console.log('✅ Setting up auth form submit event listener');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('📝 Auth form submitted');
      if (window.modernProfileUI && window.modernProfileUI.handleAuthSubmit) {
        window.modernProfileUI.handleAuthSubmit(e);
      }
    });
    form._hasSubmitListener = true;
  }

  // Set up close button event listener
  const closeBtn = authModal.querySelector('#authModalClose');
  if (closeBtn && !closeBtn._hasCloseListener) {
    console.log('✅ Setting up auth modal close button event listener');
    closeBtn.addEventListener('click', () => {
      console.log('❌ Auth modal close button clicked');
      if (window.modernProfileUI && window.modernProfileUI.hideModal) {
        window.modernProfileUI.hideModal('authModal');
      }
    });
    closeBtn._hasCloseListener = true;
  }

  console.log('✅ Auth modal event listeners ensured');
}

// Function to remove old authentication conflicts
function removeOldAuthConflicts() {
  console.log('🧹 Removing old authentication conflicts...');

  // Remove old auth service references
  if (window.authService) {
    console.log('⚠️ Old authService found - removing...');
    delete window.authService;
  }

  // Remove old mobile auth references
  if (window.mobileAuth) {
    console.log('⚠️ Old mobileAuth found - removing...');
    delete window.mobileAuth;
  }

  // Remove old function references
  const oldFunctions = [
    'showSignInModal',
    'showSignUpModal',
    'closeAuthModal',
    'switchToSignIn',
    'switchToSignUp',
    'handleSignUp',
    'handleSignIn',
    'showPasswordReset',
    'handlePasswordReset'
  ];

  oldFunctions.forEach(funcName => {
    if (window[funcName]) {
      console.log(`⚠️ Old function ${funcName} found - removing...`);
      delete window[funcName];
    }
  });

  console.log('✅ Old authentication conflicts removed');
}

// Main initialization function
function initializeProfileFix() {
  console.log('🚀 Initializing comprehensive profile fix...');

  // Remove old conflicts first
  removeOldAuthConflicts();

  // Force visibility
  forceProfileVisibility();

  // Ensure modern profile UI is working
  ensureModernProfileUI();

  console.log('✅ Comprehensive profile fix initialized');
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM loaded, applying comprehensive profile fix...');
  initializeProfileFix();

  // Also run after delays to ensure all elements are loaded
  setTimeout(initializeProfileFix, 100);
  setTimeout(initializeProfileFix, 500);
  setTimeout(initializeProfileFix, 1000);
  setTimeout(initializeProfileFix, 2000);
});

// Run on window resize
window.addEventListener('resize', () => {
  console.log('📱 Window resized, checking profile visibility...');
  setTimeout(forceProfileVisibility, 100);
});

// Run immediately if DOM is already loaded
if (document.readyState === 'loading') {
  console.log('⏳ DOM still loading...');
} else {
  console.log('✅ DOM already loaded, applying fix immediately...');
  initializeProfileFix();
}

// Make functions globally available for testing
window.forceProfileVisibility = forceProfileVisibility;
window.ensureModernProfileUI = ensureModernProfileUI;
window.ensureAuthModalEventListeners = ensureAuthModalEventListeners;
window.removeOldAuthConflicts = removeOldAuthConflicts;
window.initializeProfileFix = initializeProfileFix;

console.log('✅ Comprehensive profile visibility fix loaded');
