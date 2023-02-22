/// <reference types="cypress" />
// ***********************************************
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      loginIn(): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add("loginIn", () => {
  cy.session("loginIn", () => {
    cy.visit("https://www.epidemicsound.com");
    cy.contains("Accept").click();
    cy.get('[data-cy-login-button="true"]').click();
    cy.get('[id="username"]').click().type("gyusig1247@gmail.com");
    cy.get('[id="password"]').click().type("ideA1968!!");
    cy.get('[id="kc-login"]').click();
  });
});

export {};
