import { defineAuth } from '@aws-amplify/backend';

/**
 * Configures Cognito User Pools authentication for the application.
 * - Email-based login with a verification code workflow.
 * - Custom subject/body to match the product tone.
 *
 * Tip: Consider enabling MFA or password policy hardening if this app
 * becomes more than a demo.
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: 'CODE',
      verificationEmailSubject: 'Welcome to the AI-Powered Recipe Generator!',
      verificationEmailBody: (createCode) =>
          `Use this code to confirm your account: ${createCode()}`,
    },
  },
});
