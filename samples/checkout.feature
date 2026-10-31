# Name, BDD Script. UI copy in single quotes.

Feature: Checkout

  Scenario: [CRITICAL] Checkout - Two items, totals on the overview
    Given I am a standard user on the checkout overview
    And the cart has 'Sauce Labs Backpack' and 'Sauce Labs Bike Light'
    When I view the payment overview
    Then I see 'Item total: $39.98'
    And I see 'Tax: $3.20'
    And I see 'Total: $43.18'
