# Zephyr import shape: CSV columns Name, BDD Script.
# First person. UI copy in single quotes.
# Product and prices are the Sauce Demo catalog.

Feature: Checkout money path

  Scenario: [CRITICAL] Checkout - Item total, tax and total match the catalog
    Given I am logged in as a standard user
    And the catalog lists 'Sauce Labs Backpack' at 29.99 USD
    And the catalog lists 'Sauce Labs Bike Light' at 9.99 USD
    When I add 'Sauce Labs Backpack' to the cart
    And I add 'Sauce Labs Bike Light' to the cart
    And I continue to checkout with valid shipping
    Then the item total is 39.98
    And the tax is 3.20
    And the total is 43.18

  Scenario: Checkout - Blank first name stays on the form
    Given I am logged in as a standard user
    And I have 'Sauce Labs Backpack' in the cart
    When I continue to checkout with a blank first name
    Then I stay on the shipping form
    And I see 'First Name is required'

  Scenario: [CRITICAL] Login - Locked-out user cannot reach inventory
    Given I am on the login page
    When I sign in as the locked-out user
    Then I see 'Sorry, this user has been locked out'
    And I am still on the login page
