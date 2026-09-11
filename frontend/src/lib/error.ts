import * as Sentry from "@sentry/nextjs";

interface ErrorContext {
  section?: string;
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
  user?: {
    id?: string;
    email?: string;
  };
}

/**
 * Captures an exception and reports it to Sentry with contextual tags and metadata.
 */
export function captureAppError(error: unknown, context?: ErrorContext) {
  Sentry.withScope((scope) => {
    if (context?.section) {
      scope.setTag("section", context.section);
    }
    if (context?.tags) {
      scope.setTags(context.tags);
    }
    if (context?.extra) {
      scope.setExtras(context.extra);
    }
    if (context?.user) {
      scope.setUser(context.user);
    }
    Sentry.captureException(error);
  });
}
