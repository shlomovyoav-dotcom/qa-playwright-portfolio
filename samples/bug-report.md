# Inventory images don't load for problem_user

## Steps

1. I open https://www.saucedemo.com
2. I log in as problem_user
3. I look at the inventory

## Expected

I see a product image on every card.

## Actual

The images are broken. In Network, the image requests return 404. I log in as standard_user on the same build and the images load.
