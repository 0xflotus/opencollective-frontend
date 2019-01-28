import { randomEmail } from '../support/faker';

describe('signin', () => {
  it('redirects directly when using a dev test account', () => {
    cy.visit('/signin?next=/testuseradmin');
    cy.get('input[name=email]').type('testuser+admin@opencollective.com');
    cy.get('button[type=submit]').click();
    cy.get('.LoginTopBarProfileButton-name').contains('testuseradmin', { timeout: 15000 });
  });

  it('shows an error when token gets rejected', () => {
    cy.visit('/signin?token=InvalidToken');
    cy.contains('Sign In failed: Invalid token.');
    cy.contains('You can ask for a new sign in link using the form below.');
    cy.contains('Sign in using your email address:');
    cy.get('input[name=email]').should('exist');
  });

  it("doesn't go into redirect loop if given own address in redirect", () => {
    cy.visit('/signin?next=/signin');
    cy.get('input[name=email]').type('testuser+admin@opencollective.com');
    cy.get('button[type=submit]').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  });

  it('can signup as regular user', () => {
    cy.visit('/signin');

    // Go to CreateProfile
    cy.contains('button', 'Join Free').click();

    // Test frontend validations
    cy.get('input[name=email]').type('Incorrect value');
    cy.get('button[type=submit]').click();
    cy.contains("Please include an '@' in the email address. 'Incorrectvalue' is missing an '@'.");

    // Test backend validations
    cy.get('input[name=email]').type('{selectall}Incorrect@value');
    cy.get('button[type=submit]').click();
    cy.contains('Validation error: Email must be valid');

    // Submit the form with correct values
    const email = randomEmail();
    cy.get('input[name=email]').type(`{selectall}${email}`);
    cy.get('button[type=submit]').click();
    cy.contains('Your magic link is on its way!');
    cy.contains(`We've sent it to ${email}.`);
  });

  it('can signup as organization', () => {
    cy.visit('/signin');

    // Go to CreateProfile
    cy.contains('button', 'Join Free').click();

    // Select "Create oganization"
    cy.contains('Create Organization Profile').click();

    // Test frontend validations
    cy.get('input[name=orgName]').type('Test Organization');
    cy.get('input[name=email]').type('Incorrect value');
    cy.get('button[type=submit]').click();
    cy.contains("Please include an '@' in the email address. 'Incorrectvalue' is missing an '@'.");

    // Test backend validations
    cy.get('input[name=email]').type('{selectall}Incorrect@value');
    cy.get('button[type=submit]').click();
    cy.contains('Validation error: Email must be valid');

    // Submit the form with correct values
    const email = randomEmail();
    cy.get('input[name=email]').type(`{selectall}${email}`);
    cy.get('button[type=submit]').click();
    cy.contains('Your magic link is on its way!');
    cy.contains(`We've sent it to ${email}.`);
  });
});
