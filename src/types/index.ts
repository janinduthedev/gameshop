export type FormState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  orderId?: string;
  helpHref?: string;
  helpLabel?: string;
} | null;

export type ActionResult = {
  success: boolean;
  message?: string;
};
