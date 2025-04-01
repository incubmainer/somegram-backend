export const COUNTRY_CATALOG_ROUTE = {
  MAIN: 'country-catalog',
  COUNTRY: 'country',
  CITY: 'city',
};

export const SECURITY_DEVICES_ROUTE = {
  MAIN: 'devices',
  TERMINATE: 'terminate',
};

export const USER_ROUTE = {
  MAIN: 'users',
  PROFILE_INFO: 'profile-info',
  PROFILE_UPLOAD_AVATAR: 'profile-upload-avatar',
  PROFILE_FILL_INFO: 'profile-fill-info',
  PROFILE_DELETE_AVATAR: 'profile-delete-avatar',
};

export const USER_PUBLIC_ROUTE = {
  MAIN: 'public-users',
  PROFILE: 'profile',
};

export const SUBSCRIPTIONS_ROUTE = {
  MAIN: 'subscriptions',
  CREATE_PAYMENT: 'create-payment',
  MY_PAYMENTS: 'my-payments',
  INFO: 'info',
  STRIPE_WEBHOOK: 'stripe-webhook',
  DISABLE_AUTO_RENEWAL: 'disable-auto-renewal',
  ENABLE_AUTO_RENEWAL: 'enable-auto-renewal',
  PAYPAL_WEBHOOK: 'paypal-webhook',
  TESTING: 'testing',
  CANCEL_SUBSCRIPTION: 'cancel-subscription',
};

export const NOTIFICATION_NAME_SPACE = 'notification';

export const NOTIFICATION_ROUTE = {
  MAIN: 'notifications',
  MARK_AS_READ: 'read',
  TESTING: 'testing',
};

export const POST_PUBLIC_ROUTE = {
  MAIN: 'public-posts',
  ALL: 'all',
  COMMENTS: 'comments',
};

export const POST_ROUTE = {
  MAIN: 'posts',
};

export const AUTH_ROUTE = {
  MAIN: 'auth',
  REGISTRATION: 'registration',
  REGISTRATION_CONFIRMATION: 'registration-confirmation',
  REGISTRATION_EMAIL_RESENDING: 'registration-email-resending',
  GOOGLE: 'google',
  GITHUB: 'github',
  CALLBACK: 'callback',
  LOGIN: 'login',
  LOGOUT: 'logout',
  UPDATE_TOKENS: 'refresh-token',
  ME: 'me',
  RESTORE_PASSWORD: 'restore-password',
  RESTORE_PASSWORD_CONFIRM: 'restore-password-confirmation',
  RECAPTCHA_SITE_KEY: 'recaptcha-site-key',
};

export const POST_COMMENT_ROUTE = {
  MAIN: 'posts/comments',
  ANSWER_FOR_COMMENT: 'answer-comment',
  LIKE: 'like',
};
