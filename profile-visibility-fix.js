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

          // Simple approach: Try to show the auth modal directly
          console.log('🔄 Attempting to show auth modal...');

          // First, try to create the modal if it doesn't exist
          let authModal = document.getElementById('authModal');
          if (!authModal) {
            console.log('🔄 Auth modal not found, creating it...');
            // Create a simple auth modal
            const modalHTML = `
              <div id="authModal" class="auth-modal">
                <div class="auth-modal-overlay">
                  <div class="auth-modal-content">
                    <button class="auth-modal-close" id="authModalClose">
                      <i class="fas fa-times"></i>
                    </button>
                    
                    <div class="auth-modal-header">
                      <h2 id="authModalTitle">Sign In</h2>
                      <p id="authModalSubtitle">Welcome to TagYou!</p>
                    </div>

                    <form id="authForm" class="auth-form">
                      <div class="form-group">
                        <label for="authEmail">Email</label>
                        <input type="email" id="authEmail" required>
                      </div>
                      
                      <div class="form-group">
                        <label for="authPassword">Password</label>
                        <input type="password" id="authPassword" required>
                      </div>

                      <button type="submit" class="auth-submit-btn" id="authSubmitBtn">
                        <span id="authSubmitText">Sign In</span>
                      </button>
                    </form>

                    <div class="auth-modal-footer">
                      <p id="authToggleText">Don't have an account? <a href="#" id="authToggleBtn">Sign Up</a></p>
                      <p><a href="#" id="forgotPasswordBtn">Forgot Password?</a></p>
                    </div>

                    <div id="authMessage"></div>
                  </div>
                </div>
              </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            authModal = document.getElementById('authModal');
            console.log('✅ Auth modal created');
          }

          // Show the modal
          if (authModal) {
            authModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            console.log('✅ Auth modal shown successfully');

            // Set up event listeners for the modal
            setTimeout(() => {
              ensureAuthModalEventListeners();
            }, 100);
          } else {
            console.error('❌ Failed to create or find auth modal');
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
    console.log('🔄 Will retry in 1 second...');
    setTimeout(ensureModernProfileUI, 1000);
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

  // Wait for modern profile UI to be available
  const waitForModernProfileUI = () => {
    if (window.modernProfileUI) {
      console.log('✅ Modern Profile UI found, setting up event listeners...');
      ensureModernProfileUI();
    } else {
      console.log('⏳ Waiting for Modern Profile UI to be available...');
      setTimeout(waitForModernProfileUI, 500);
    }
  };

  waitForModernProfileUI();

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

// Direct auth modal function
window.showAuthModalDirect = function () {
  console.log('🔐 showAuthModalDirect called!');

  // Create or find auth modal
  let authModal = document.getElementById('authModal');
  if (!authModal) {
    console.log('🔄 Creating auth modal...');
    const modalHTML = `
      <div id="authModal" class="auth-modal">
        <div class="auth-modal-overlay">
          <div class="auth-modal-content">
            <button class="auth-modal-close" id="authModalClose" onclick="hideAuthModalDirect()">
              <i class="fas fa-times"></i>
            </button>
            
            <div class="auth-modal-header">
              <h2 id="authModalTitle">Sign In</h2>
              <p id="authModalSubtitle">Welcome to TagYou!</p>
            </div>

            <form id="authForm" class="auth-form" onsubmit="handleAuthSubmitDirect(event)">
              <div class="form-group">
                <label for="authEmail">Email</label>
                <input type="email" id="authEmail" required>
              </div>
              
              <div class="form-group">
                <label for="authPassword">Password</label>
                <input type="password" id="authPassword" required>
              </div>

              <button type="submit" class="auth-submit-btn" id="authSubmitBtn">
                <span id="authSubmitText">Sign In</span>
              </button>
            </form>

            <div class="auth-modal-footer">
              <p id="authToggleText">Don't have an account? <a href="#" onclick="toggleAuthModeDirect()" class="auth-link">Sign Up</a></p>
              <p><a href="#" id="forgotPasswordBtn" onclick="handleForgotPasswordDirect()">Forgot Password?</a></p>
            </div>

            <div id="authMessage"></div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    authModal = document.getElementById('authModal');
    console.log('✅ Auth modal created');
  }

  // Show the modal
  if (authModal) {
    authModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    console.log('✅ Auth modal shown successfully');
  } else {
    console.error('❌ Failed to create or find auth modal');
  }
};

// Hide auth modal function
window.hideAuthModalDirect = function () {
  console.log('❌ Hiding auth modal...');
  const authModal = document.getElementById('authModal');
  if (authModal) {
    authModal.classList.remove('show');
    document.body.style.overflow = '';
    console.log('✅ Auth modal hidden');
  }
};

// Toggle auth mode function
window.toggleAuthModeDirect = function () {
  console.log('🔄 Toggling auth mode...');
  const title = document.getElementById('authModalTitle');
  const subtitle = document.getElementById('authModalSubtitle');
  const submitText = document.getElementById('authSubmitText');
  const toggleText = document.getElementById('authToggleText');
  const toggleBtn = document.getElementById('authToggleBtn');
  const form = document.getElementById('authForm');

  if (form.dataset.mode === 'signup') {
    // Switch to sign in
    title.textContent = 'Sign In';
    subtitle.textContent = 'Welcome to TagYou!';
    submitText.textContent = 'Sign In';
    toggleText.innerHTML = "Don't have an account? <a href='#' onclick='toggleAuthModeDirect()' class='auth-link'>Sign Up</a>";
    form.dataset.mode = 'signin';
  } else {
    // Switch to sign up
    title.textContent = 'Sign Up';
    subtitle.textContent = 'Create your TagYou account';
    submitText.textContent = 'Sign Up';
    toggleText.innerHTML = "Already have an account? <a href='#' onclick='toggleAuthModeDirect()' class='auth-link'>Sign In</a>";
    form.dataset.mode = 'signup';
  }
};

// Handle auth submit function
window.handleAuthSubmitDirect = function (event) {
  event.preventDefault();
  console.log('📝 Auth form submitted');

  const form = event.target;
  const mode = form.dataset.mode || 'signin';
  const email = form.querySelector('#authEmail').value;
  const password = form.querySelector('#authPassword').value;

  console.log('🔐 Auth attempt:', { mode, email });

  // Show loading state
  const submitBtn = form.querySelector('#authSubmitBtn');
  const submitText = submitBtn.querySelector('#authSubmitText');
  const originalText = submitText.textContent;

  submitBtn.disabled = true;
  submitText.textContent = mode === 'signin' ? 'Signing In...' : 'Signing Up...';

  // Clear any existing messages
  const messageDiv = document.getElementById('authMessage');
  if (messageDiv) {
    messageDiv.textContent = '';
    messageDiv.className = '';
  }

  // Simulate auth process (replace with actual Supabase auth later)
  setTimeout(() => {
    submitBtn.disabled = false;
    submitText.textContent = originalText;

    // For now, just close the modal
    hideAuthModalDirect();
  }, 1500);
};

// Handle forgot password function
window.handleForgotPasswordDirect = function () {
  console.log('🔑 Forgot password clicked');

  // Hide the auth modal
  hideAuthModalDirect();

  // Show forgot password modal
  showForgotPasswordModal();
};

// Show forgot password modal
window.showForgotPasswordModal = function () {
  console.log('🔑 Showing forgot password modal...');

  // Create or find forgot password modal
  let forgotModal = document.getElementById('forgotPasswordModal');
  if (!forgotModal) {
    console.log('🔄 Creating forgot password modal...');
    const modalHTML = `
      <div id="forgotPasswordModal" class="auth-modal">
        <div class="auth-modal-overlay">
          <div class="auth-modal-content forgot-password-content">
            <button class="auth-modal-close" id="forgotPasswordModalClose" onclick="hideForgotPasswordModal()">
              <i class="fas fa-times"></i>
            </button>
            
            <div class="forgot-password-header">
              <div class="forgot-password-icon">
                <i class="fas fa-lock"></i>
              </div>
              <h2>Forgot Password?</h2>
              <p>No worries! Enter your email and we'll send you reset instructions.</p>
            </div>

            <form id="forgotPasswordForm" class="forgot-password-form" onsubmit="handleForgotPasswordSubmit(event)">
              <div class="form-group">
                <label for="forgotPasswordEmail">Email Address</label>
                <div class="input-wrapper">
                  <i class="fas fa-envelope input-icon"></i>
                  <input type="email" id="forgotPasswordEmail" placeholder="Enter your email address" required>
                </div>
              </div>

              <button type="submit" class="forgot-password-submit-btn" id="forgotPasswordSubmitBtn">
                <span id="forgotPasswordSubmitText">Send Reset Link</span>
                <i class="fas fa-paper-plane"></i>
              </button>
            </form>

            <div class="forgot-password-footer">
              <p>Remember your password? <a href="#" onclick="backToSignIn()">Back to Sign In</a></p>
            </div>

            <div id="forgotPasswordMessage"></div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    forgotModal = document.getElementById('forgotPasswordModal');
    console.log('✅ Forgot password modal created');
  }

  // Show the modal
  if (forgotModal) {
    forgotModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    console.log('✅ Forgot password modal shown successfully');

    // Focus on email input
    setTimeout(() => {
      const emailInput = document.getElementById('forgotPasswordEmail');
      if (emailInput) {
        emailInput.focus();
      }
    }, 100);
  } else {
    console.error('❌ Failed to create or find forgot password modal');
  }
};

// Hide forgot password modal
window.hideForgotPasswordModal = function () {
  console.log('❌ Hiding forgot password modal...');
  const forgotModal = document.getElementById('forgotPasswordModal');
  if (forgotModal) {
    forgotModal.classList.remove('show');
    document.body.style.overflow = '';
    console.log('✅ Forgot password modal hidden');
  }
};

// Handle forgot password form submit
window.handleForgotPasswordSubmit = async function (event) {
  event.preventDefault();
  console.log('📝 Forgot password form submitted');

  const email = document.getElementById('forgotPasswordEmail').value;
  const messageDiv = document.getElementById('forgotPasswordMessage');
  const submitBtn = document.getElementById('forgotPasswordSubmitBtn');
  const submitText = document.getElementById('forgotPasswordSubmitText');

  if (!email) {
    if (messageDiv) {
      messageDiv.textContent = 'Please enter your email address.';
      messageDiv.className = 'auth-message auth-error';
    }
    return;
  }

  // Show loading state
  submitBtn.disabled = true;
  submitText.textContent = 'Sending...';

  if (messageDiv) {
    messageDiv.textContent = 'Sending password reset email...';
    messageDiv.className = 'auth-message auth-info';
  }

  try {
    console.log('🔑 Sending password reset email to:', email);

    // Check if Supabase is available
    if (typeof window.supabase === 'undefined') {
      throw new Error('Supabase not available. Please refresh the page and try again.');
    }

    // Send password reset email using Supabase
    const { error } = await window.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password.html'
    });

    if (error) {
      throw new Error(error.message);
    }

    // Success - show success state
    if (messageDiv) {
      messageDiv.textContent = '✅ Reset link sent! Check your email for instructions.';
      messageDiv.className = 'auth-message auth-success';
    }

    // Update button to show success
    submitText.textContent = 'Email Sent!';
    submitBtn.classList.add('success');

    console.log('✅ Password reset email sent successfully');

  } catch (error) {
    console.error('❌ Password reset error:', error);

    if (messageDiv) {
      messageDiv.textContent = 'Failed to send reset email: ' + error.message;
      messageDiv.className = 'auth-message auth-error';
    }

    // Reset button state
    submitText.textContent = 'Send Reset Link';
    submitBtn.classList.remove('success');
  } finally {
    // Re-enable button after a delay
    setTimeout(() => {
      submitBtn.disabled = false;
      submitText.textContent = 'Send Reset Link';
      submitBtn.classList.remove('success');
    }, 3000);
  }
};

// Back to sign in function
window.backToSignIn = function () {
  console.log('🔄 Going back to sign in...');
  hideForgotPasswordModal();
  showAuthModalDirect();
};

// Debug function to test Sign In button
window.testSignInButton = function () {
  console.log('🧪 Testing Sign In button...');

  const signInBtn = document.getElementById('profileSignInBtn');
  if (signInBtn) {
    console.log('✅ Sign In button found');
    console.log('🔍 Button properties:', {
      display: signInBtn.style.display,
      visibility: signInBtn.style.visibility,
      opacity: signInBtn.style.opacity,
      pointerEvents: signInBtn.style.pointerEvents,
      cursor: signInBtn.style.cursor
    });

    // Test click
    console.log('🖱️ Simulating click...');
    signInBtn.click();
  } else {
    console.error('❌ Sign In button not found');
  }

  // Test modern profile UI
  console.log('🔍 Modern Profile UI:', window.modernProfileUI);
  if (window.modernProfileUI) {
    console.log('🔍 Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.modernProfileUI)));
  }
};

console.log('✅ Comprehensive profile visibility fix loaded');
