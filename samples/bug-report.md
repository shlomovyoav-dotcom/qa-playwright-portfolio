# problem_user — inventory images 404

Major · https://www.saucedemo.com · Chrome · 2026-10-17  
Account: `problem_user` / `secret_sauce`

## Steps

1. Open https://www.saucedemo.com
2. DevTools → Network, filter Img. Console open.
3. Log in as `problem_user`.
4. On inventory, compare with a `standard_user` session.

## Expected

Each inventory card shows the product image. `img.naturalWidth > 0`.

## Actual

Every product image on `/inventory.html` has `naturalWidth === 0`.  
Network: the image requests return 404.  
Console: failed loads for `/static/media/*.jpg`.  
`standard_user` on the same build is fine.

## Evidence

- Screenshot of the inventory.
- Network log: image URL and 404.
- Console log of the failed loads.
- Account: `problem_user`.

## Note

`tests/e2e/problem-user.spec.ts` checks that this persona can still use the inventory. The image 404 is not a CI gate. It shows up in some browsers and not in GitHub-hosted Chrome.
