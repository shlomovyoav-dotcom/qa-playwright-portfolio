# Gherkin — public rewrite of a money-path plan.
# Same shape I imported into Zephyr (Given / When / Then, one behaviour per scenario).
# Product, prices and users are the Sauce Demo catalog, not an employer catalog.

Feature: Checkout money path
  The amount the customer pays must match the catalog of record.
  Tax is 8%. Totals are computed, not copied from a screenshot.

  Background:
    Given the catalog of record lists "Sauce Labs Backpack" at 29.99 USD
    And the catalog of record lists "Sauce Labs Bike Light" at 9.99 USD
    And I am logged in as a standard user

  @smoke @money @P0
  Scenario: Two items — subtotal, tax and total match the catalog
    When I add "Sauce Labs Backpack" to the cart
    And I add "Sauce Labs Bike Light" to the cart
    Then the cart badge shows 2
    When I open the cart
    Then the cart lists "Sauce Labs Backpack" and "Sauce Labs Bike Light"
    When I continue to checkout with valid shipping details
    Then the item total is 39.98
    And the tax is 3.20
    And the total is 43.18
    When I finish the order
    Then I see the order confirmation

  @negative @P1
  Scenario: Blank first name blocks checkout
    Given I have "Sauce Labs Backpack" in the cart
    When I continue to checkout with a blank first name
    Then I stay on the shipping form
    And I see "First Name is required"

  @access @P0
  Scenario: Locked-out user cannot reach inventory
    Given I am on the login page
    When I sign in as the locked-out user
    Then I see "Sorry, this user has been locked out"
    And I am still on the login page
