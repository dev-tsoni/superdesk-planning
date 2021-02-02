import {Popup} from './popup';

/**
 * Wrapper class around Superdesk's ItemActions menu
 */
export class ActionMenu {
    /**
     * Creates an instance of the ActionMenu wrapper
     * @param {function():Cypress.Chainable<JQuery<HTMLElement>>} getParent - Callback to retrieve the parent
     */
    constructor(getParent) {
        this.getParent = getParent;
        this.popup = new Popup('.item-actions-menu__popup');
    }

    /**
     * Returns the parent dom node
     * @returns {Cypress.Chainable<JQuery<HTMLElement>>}
     */
    get parent() {
        return this.getParent();
    }

    /**
     * Returns the 3 dot icon that opens the menu
     * @returns {Cypress.Chainable<JQuery<HTMLElement>>}
     */
    get menuButton() {
        return this.parent
            .find('.icon-dots-vertical')
            .first()
            .should('exist');
    }

    /**
     * Clicks on the menu button then waits for the popup to be visible
     * @returns {ActionMenu}
     */
    open() {
        cy.log('Common.UI.ActionMenu.open');
        this.menuButton.click();
        this.popup.waitTillOpen();
        return this;
    }

    /**
     * Returns the dom node for the menu action based on the label
     * @param {string} label - The text of the label to look for
     * @param {boolean} checkExists - If true, makes sure the element exists
     * @returns {Cypress.Chainable<JQuery<HTMLElement>>}
     */
    getAction(label, checkExists = true) {
        return checkExists ?
            this.popup.element
                .contains(label)
                .should('exist') :
            this.popup.element.contains(label);
    }
}
