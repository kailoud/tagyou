// Authentication Test Script
// This script tests the authentication functionality

async function testAuthentication() {
  console.log('🧪 Testing Authentication System...');
  console.log('====================================');

  // Wait for auth service to be available
  let attempts = 0;
  const maxAttempts = 20;

  while (attempts < maxAttempts) {
    if (window.authService) {
      console.log('✅ Auth service found, running tests...');
      break;
    }
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  if (attempts >= maxAttempts) {
    console.error('❌ Auth service not available for testing');
    return;
  }

  // Test 1: Check if auth service is properly initialized
  console.log('\n📋 Test 1: Auth Service Initialization');
  console.log('Auth service available:', !!window.authService);
  console.log('Current user:', window.authService.getCurrentUser());
  console.log('Is authenticated:', window.authService.isAuthenticated());

  // Test 2: Check auth UI elements
  console.log('\n📋 Test 2: Auth UI Elements');
  const profileButton = document.querySelector('.profile-button');
  const profileMenu = document.querySelector('.profile-menu');
  console.log('Profile button exists:', !!profileButton);
  console.log('Profile menu exists:', !!profileMenu);

  if (profileButton) {
    console.log('Profile button HTML:', profileButton.innerHTML);
  }

  // Test 3: Test modal functionality
  console.log('\n📋 Test 3: Modal Functionality');
  console.log('Testing login modal...');

  // Simulate showing login modal
  try {
    window.authService.showLogin();
    console.log('✅ Login modal shown successfully');

    // Check if modal exists
    setTimeout(() => {
      const modal = document.querySelector('.auth-modal');
      console.log('Modal created:', !!modal);

      if (modal) {
        console.log('Modal has show class:', modal.classList.contains('show'));

        // Close modal after testing
        setTimeout(() => {
          window.authService.closeAuthModal();
          console.log('✅ Modal closed successfully');
        }, 2000);
      }
    }, 500);

  } catch (error) {
    console.error('❌ Error testing modal:', error);
  }

  // Test 4: Test auth methods availability
  console.log('\n📋 Test 4: Auth Methods');
  const methods = [
    'signIn', 'signUp', 'signOut', 'resetPassword',
    'updateProfile', 'isAuthenticated', 'getCurrentUser'
  ];

  methods.forEach(method => {
    console.log(`${method}:`, typeof window.authService[method]);
  });

  console.log('\n🎯 Authentication test completed!');
  console.log('====================================');
}

// Export for manual use
export default testAuthentication;

// Run automatically
testAuthentication();
