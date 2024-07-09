import { ConfirmationToken } from './value-objects/confirmation-token';
import { Email } from './value-objects/email';

export abstract class EmailServiceI {
  abstract sendToEmailConfirmationLink(
    email: Email,
    confirmationToken: ConfirmationToken,
  ): void;
}
