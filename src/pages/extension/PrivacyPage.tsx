import { useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface PrivacyPageProps {
  privacyPolicy: string;
  productName: string;
}

export function PrivacyPage({ privacyPolicy, productName }: PrivacyPageProps) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `Privacy Policy | ${productName}`;

    return () => {
      document.title = previousTitle;
    };
  }, [productName]);

  return (
    <article className="mx-auto max-w-3xl rounded-3xl border border-border/60 bg-card/70 px-6 py-10 shadow-sm backdrop-blur-sm sm:px-10 md:py-14">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-4 mt-10 border-t border-border/60 pt-8 text-2xl font-bold tracking-tight text-foreground">
              {children}
            </h2>
          ),
          p: ({ children }) => (
            <p className="my-5 text-base leading-8 text-muted-foreground">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-5 list-disc space-y-3 pl-6 text-muted-foreground marker:text-primary">
              {children}
            </ul>
          ),
          li: ({ children }) => <li className="pl-2 leading-7">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          a: ({ children, href }) => (
            <a
              className="font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
              href={href}
            >
              {children}
            </a>
          ),
        }}
      >
        {privacyPolicy}
      </ReactMarkdown>
    </article>
  );
}
