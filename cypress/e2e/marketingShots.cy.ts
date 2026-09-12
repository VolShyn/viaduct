/*
 * Regenerates the landing screenshots.
 *
 * Not a test: nothing here asserts anything about the product. It is a
 * capture rig that happens to need a browser, and Cypress is the browser this
 * repo already has. Run it on purpose:
 *
 *   npx cypress run --spec cypress/e2e/marketingShots.cy.ts --browser electron \
 *     --config viewportWidth=1800,viewportHeight=1125 --env SHOTS=1
 *
 * then convert what lands in cypress/screenshots — see scripts/marketingShots.sh.
 *
 * The model is the sample project the onboarding dialog offers, taken by
 * clicking the dialog's own button rather than by seeding the store's
 * persisted shape: the pictures should show the product with something in it,
 * this is the something the product hands a new person, and going through the
 * app's own door means the rig cannot drift from what the app actually stores.
 */
const VIEWPORT = { width: 1800, height: 1125 };
const THEMES = ['dark', 'light'] as const;

function seed(theme: (typeof THEMES)[number]) {
  cy.viewport(VIEWPORT.width, VIEWPORT.height);
  cy.visit('/editor', {
    onBeforeLoad(win) {
      win.localStorage.setItem('c4-color-mode', theme);
    },
  });
  cy.contains('button', 'Start from a template', { timeout: 20000 }).click();
  /* The tour opens over the canvas on a first visit and would otherwise be the
     subject of every picture. Skipped through its own button, since the flag it
     writes is the tour's business and not this rig's. */
  cy.contains('Skip tour', { timeout: 20000 }).click();
  /* Frame the whole model, the way the reference shots are framed. */
  settle();
}

/**
 * Wait for the level to draw, then frame all of it.
 *
 * Edges are drawn a frame after the nodes they join and the fit runs its own
 * animation, so the wait is after the fit rather than before it.
 */
function settle() {
  cy.get('.react-flow__node', { timeout: 20000 }).should('have.length.greaterThan', 1);
  cy.get('[aria-label="Fit view"]').click();
  cy.wait(1200);
}

/*
 * The app's own box, not the browser window.
 *
 * A viewport capture came out as the runner's window — 2560x1440 with the app
 * laid out at its own size inside and scrollbars around it. Shooting the root
 * element clips to exactly what the app draws, and on this screen it lands at
 * twice the asked size, which downsamples to the 1800x1125 the landing wants
 * rather than being upscaled to it.
 */
function shoot(name: string) {
  cy.get('#root').screenshot(name, { overwrite: true });
}

describe('marketing screenshots', () => {
  THEMES.forEach((theme) => {
    it(`system context — ${theme}`, () => {
      seed(theme);
      shoot(`system-context-${theme}`);
    });

    it(`containers — ${theme}`, () => {
      seed(theme);
      /* Into the system the sample is about. The magnifier is the drill-down;
         a click on the card itself opens the edit panel. */
      cy.contains('.react-flow__node', 'Internet Banking System')
        .find('[aria-label="Zoom in"], [title="Zoom in"]')
        .first()
        .click();
      settle();
      shoot(`containers-${theme}`);
    });

    it(`catalog — ${theme}`, () => {
      seed(theme);
      cy.visit('/catalog');
      cy.wait(1500);
      /* Expanded, the way the reference is: folded, the picture is four words
         and an empty pane, which says nothing about what a catalogue is for. */
      ['Services', 'Gateways', 'Brokers', 'Databases'].forEach((group) => {
        cy.contains(group).click({ force: true });
      });
      cy.wait(600);
      shoot(`catalog-${theme}`);
    });

    it(`flows — ${theme}`, () => {
      seed(theme);
      cy.visit('/flows');
      cy.wait(1500);
      shoot(`flows-${theme}`);
    });
  });
});
