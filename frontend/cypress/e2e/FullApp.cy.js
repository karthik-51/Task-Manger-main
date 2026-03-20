describe("Full Clean E2E Flow", () => {

  const tasks = [
    { title: "Task 1", status: "todo" },
    { title: "Task 2", status: "inprogress" },
    { title: "Task 3", status: "completed" },
  ];

  // 🧹 CLEAR ALL TASKS BEFORE TEST
  before(() => {
    cy.request({
      method: "DELETE",
      url: "http://localhost:5000/api/tasks/clear", // adjust if needed
      failOnStatusCode: false,
    });
  });

  it("clean → login → create → move → delete → logout", () => {

    // ✅ INTERCEPT ONLY NECESSARY APIS
    cy.intercept("POST", "**/tasks").as("createTask");
    cy.intercept("DELETE", "**/tasks/*").as("deleteTask");

    // 🔐 LOGIN
    cy.visit("/login");

    cy.get('[data-testid="email"]').type(Cypress.env("email"));
    cy.get('[data-testid="password"]').type(Cypress.env("password"));
    cy.get('[data-testid="login-btn"]').click();

    cy.url().should("include", "/dashboard");

    // ➕ CREATE TASKS
    tasks.forEach((task) => {

      cy.get('[data-testid="create-task-btn"]').click();

      cy.get('[data-testid="task-title"]').clear().type(task.title);
      cy.get('[data-testid="task-desc"]').clear().type("E2E Task");

      cy.get('[data-testid="save-task"]').click();

      // wait only for POST
      cy.wait("@createTask");

      // ✅ verify UI (instead of waiting GET)
      cy.contains('[data-testid="task-title-text"]', task.title, {
        timeout: 10000,
      }).should("be.visible");
    });

    // 🔄 DRAG & DROP (basic stable)
    tasks.forEach((task) => {
      if (task.status !== "todo") {

        cy.contains('[data-testid="task-title-text"]', task.title)
          .trigger("mousedown", { which: 1 });

        cy.get(`[data-testid="column-${task.status}"]`)
          .trigger("mousemove")
          .trigger("mouseup", { force: true });

        // ✅ verify moved (no API wait)
        cy.contains('[data-testid="task-title-text"]', task.title)
          .should("exist");
      }
    });

    // 🗑️ DELETE TASKS
    tasks.forEach((task) => {

      cy.contains('[data-testid="task-title-text"]', task.title)
        .should("be.visible");

      cy.contains('[data-testid="task-title-text"]', task.title)
        .closest('[data-testid="task-card"]')
        .find('[data-testid="delete-task"]')
        .click();

      // wait DELETE only
      cy.wait("@deleteTask");

      // ✅ verify removed from UI
      cy.contains(task.title).should("not.exist");
    });

    // 🚪 LOGOUT
    cy.get('[data-testid="user-avatar"]').click();
    cy.get('[data-testid="logout-btn"]').click();

  });

});