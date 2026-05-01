describe('BloodLink System E2E Tests', () => {
  beforeEach(() => {
    cy.session('admin-session', () => {
      cy.visit('http://localhost:3000/login');
      cy.contains('admin@bloodlink.org').click();
      cy.get('button[type="submit"]').click();
      cy.url({ timeout: 10000 }).should('eq', 'http://localhost:3000/');
    });
    cy.visit('http://localhost:3000/');
  });

  it('should display the dashboard with correct stats', () => {
    cy.contains('Platform Overview').should('be.visible');
    cy.contains('Emergencies').should('be.visible');
    cy.get('main').contains('Inventory').should('be.visible');
  });

  it('should navigate to Inventory and check stock levels', () => {
    cy.get('nav').contains('Inventory').click();
    cy.url().should('include', '/inventory');
    cy.contains('Blood Type').should('be.visible');
    cy.contains('Available Units').should('be.visible');
  });

  it('should toggle user profile menu', () => {
    // The profile button is in the header but outside the nav
    // For admin@bloodlink.org, the avatar initials are "AF"
    cy.get('header').contains('HA').click();
    
    cy.contains('My Profile').should('be.visible');
    cy.contains('Sign Out').should('be.visible');
  });

  it('should create a new emergency request and find matches', () => {
    cy.get('nav').contains('Emergencies').click();
    cy.url().should('include', '/emergencies');

    // Click the "+" button next to "Active Emergencies"
    cy.contains('Active Emergencies').parent().find('button').click();
    cy.wait(500); // Wait for modal

    // 1. Fill out the form
    cy.get('input[placeholder="Hospital name"]').type('Cypress Emergency Hospital');
    cy.get('input[placeholder="e.g. Trauma Unit"]').type('Emergency Room');
    cy.get('select').eq(0).select('O-'); // Blood Type
    cy.get('input[placeholder="6"]').clear().type('8'); // Units
    cy.get('select').eq(1).select('Critical'); // Urgency

    // 2. Submit
    cy.get('button[type="submit"]').contains('Create Emergency Request').click();

    // 3. Verify it appeared in the list and matching engine loaded
    cy.contains('Emergency Created').should('be.visible');
    cy.contains('Cypress Emergency Hospital').should('be.visible');
    cy.contains('Matching Engine', { timeout: 10000 }).should('be.visible');
  });
});
