describe("Create NFT Collection Form", () => {
  
  it("Visit create nft page and click choose collection and select create a new collection", () => {
    cy.setCookie("siwe-session", "true");

    cy.visit("/create");
    cy.get('[cy-test="popover-trigger-collection-list"]').click();
    cy.get('[cy-link="create-collection"]').click();
    cy.url().should("include", "/create/collection");
    cy.intercept("POST", "/api/collections", { statusCode: 200 }).as(
      "createCollection",
    );
    const minimalPNG = Cypress.Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );
    cy.get('[cy-input="collection-logo"]').selectFile(
      {
        contents: minimalPNG,
        fileName: "valid-image.png",
        mimeType: "image/png",
      },
      { force: true },
    );
    cy.get('[cy-input="collection-name"]').type("My Awesome Collection");
    cy.get('[cy-input="collection-symbol"]').type("AWESM");
    cy.get('[cy-button="create-collection"]').click();
    cy.get(".toast-stack").should("be.visible");
  });
});
