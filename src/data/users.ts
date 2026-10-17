/** Demo accounts published by saucedemo.com. Each one models a different production persona. */
export const PASSWORD = 'secret_sauce';

export const users = {
  standard: 'standard_user',
  lockedOut: 'locked_out_user',
  /** Known-buggy persona: broken images and dead add-to-cart buttons on some items. */
  problem: 'problem_user',
  performanceGlitch: 'performance_glitch_user',
} as const;

export type UserKey = keyof typeof users;

/** Shipping details accepted by the demo checkout. */
export const shipping = {
  firstName: 'Yoav',
  lastName: 'QA',
  postalCode: '6100000',
} as const;
