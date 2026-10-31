# [Inventory] Product images don't load for problem_user — each card shows its image

**Where:** Inventory (https://www.saucedemo.com/inventory.html)
**Environment:** prod (www.saucedemo.com)
**User state:** problem_user

## Expected

When I look at the inventory, each product card shows its image.

## Actual

The image requests return 404. A standard user on the same build sees the images.

## Steps

1. Open https://www.saucedemo.com
2. Sign in as problem_user
3. Open the inventory
