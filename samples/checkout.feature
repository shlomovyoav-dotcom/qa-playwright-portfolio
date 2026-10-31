# Name, BDD Script. First person. UI copy in single quotes.

Feature: Checkout

  Scenario: [CRITICAL] Checkout - Two items, totals match
    Given I am logged in as a standard user
    When I add 'Sauce Labs Backpack' to the cart
    And I add 'Sauce Labs Bike Light' to the cart
    And I continue to checkout with valid shipping
    Then I see item total 39.98
    And I see tax 3.20
    And I see total 43.18

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
