describe("정책", () => {
  it("기본 Login", () => {
    cy.visit("https://www.epidemicsound.com");
    cy.contains("Accept").click();
    cy.get('[data-cy-login-button="true"]').click();
    cy.get('[id="username"]').click().type("");
    cy.get('[id="password"]').click().type("");
    cy.get('[id="kc-login"]').click();

    cy.url().should("include", "https://www.epidemicsound.com/music/"); // => true

    cy.wait(5000);
    cy.visit("https://www.epidemicsound.com/music/genres/mystery");
    let count = 0;

    // while (count < 10) {
    //   cy.get(`[data-index="${count}"] [aria-label="Download"]`).click();

    //   cy.contains(`MP3`).click();
    //   cy.contains("WAV").click();

    //   count++;

    //   cy.window()
    //     .document()
    //     .then(function (doc) {
    //       doc.addEventListener("click", () => {
    //         setTimeout(function () {
    //           doc.location && doc.location.reload();
    //         }, 5000);
    //       });
    //       cy.contains(`[role="dialog"] span`, "Download").click({ force: true });
    //     });
    // }
    // Cypress.config("pageLoadTimeout", 10000);
    // Cypress.on("uncaught:exception", (error) => {
    //   if (error.message.includes("Timed out after waiting `10000ms` for your remote page to load")) {
    //     return false;
    //   }
    // });

    // Cypress.on("fail", (error) => {
    //   if (error.message.includes("Timed out after waiting `10000ms` for your remote page to load")) {
    //     return false;
    //   }

    //   throw error;
    // });

    cy.intercept("/download/**", (req) => {
      // instead of redirecting to the CSV file
      // and having the browser deal with it
      // download the file ourselves
      // but we cannot use Cypress commands inside the callback
      // thus we will download it later using the captured URL
      req.redirect("/");
    }).as("records");

    cy.get(`[data-index="0"] [aria-label="Download"]`).click();
    cy.contains("MP3").click();
    cy.contains("WAV").click();
    cy.contains(`[role="dialog"] span`, "Download").click({ force: true });

    cy.wait("@records")
      .its("request")
      .then((req) => {
        cy.request(req).then(({ body, headers }) => {
          return true;
        });
      });
    count++;

    // cy.window()
    //   .document()
    //   .then(function (doc) {
    //     doc.addEventListener("click", () => {
    //       setTimeout(function () {
    //         doc.location && doc.location.reload();
    //       }, 5000);
    //     });
    //     cy.contains(`MP3`).click();
    //     cy.contains("WAV").click();
    //     cy.contains(`[role="dialog"] span`, "Download").click({ force: true });
    //   });

    cy.get(`[data-index="1"] [aria-label="Download"]`).click();

    cy.contains(`MP3`).click();
    cy.contains("WAV").click();
    cy.contains(`[role="dialog"] span`, "Download").click({ force: true });

    count++;

    cy.window()
      .document()
      .then(function (doc) {
        doc.addEventListener("click", () => {
          setTimeout(function () {
            doc.location && doc.location.reload();
          }, 5000);
        });
        cy.contains(`[role="dialog"] span`, "Download").click({ force: true });
      });

    // cy.get('[data-test-id="virtuoso-item-list"]>div').each(($el) => {
    //   cy.wrap($el).find('[aria-label="Download"]').click();

    //   cy.contains("MP3").click();
    //   cy.contains("WAV").click();
    //   cy.contains(`[role="dialog"] span`, "Cancel").click({ force: true });
    //   cy.wait(1000);

    // });

    // cy.get('[data-index="0"] [aria-label="Download"]').click();

    // cy.contains("MP3").click();
    // cy.contains("WAV").click();
    // cy.contains(`[role="dialog"] span`, "Download").click({ force: true });

    // targetRow.get('[aria-label="Download"]').click();
  });
});

export {};
