import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardShell } from "@/components/dashboard-shell";
import { MissingKeyBannerStack } from "@/components/missing-key-banner-stack";
import { PostHogIdentify } from "@/components/posthog-identify";
import { StreamingProvider } from "@/lib/streaming-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Signal",
  description: "Signal Dashboard",
};

function MissingClerkConfig() {
  return (
    <main className="bg-background text-foreground flex min-h-dvh items-center justify-center px-6 py-12">
      <section className="border-border w-full max-w-2xl rounded-lg border p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm font-medium">
            Deployment setup needed
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Add your Clerk keys to continue
          </h1>
          <p className="text-muted-foreground text-sm leading-6">
            Signal deployed successfully, but authentication is not configured
            yet. Add these environment variables in Netlify, then trigger a new
            deploy.
          </p>
        </div>

        <div className="bg-muted mt-5 rounded-md p-4 font-mono text-sm leading-7">
          <div>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</div>
          <div>CLERK_SECRET_KEY</div>
          <div>CLERK_FRONTEND_API_DOMAIN</div>
          <div>NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login</div>
          <div>NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup</div>
          <div>NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/</div>
          <div>NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/</div>
        </div>

        <p className="text-muted-foreground mt-5 text-sm leading-6">
          You can get the Clerk keys from the Clerk dashboard under API keys.
          Supabase and Anthropic keys are also required before the full app is
          usable.
        </p>
      </section>
    </main>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        {!clerkPublishableKey ? (
          <MissingClerkConfig />
        ) : (
          <ClerkProvider appearance={{ theme: shadcn }}>
            <PostHogIdentify />
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <StreamingProvider>
                <TooltipProvider>
                  <DashboardShell banner={<MissingKeyBannerStack />}>
                    {children}
                  </DashboardShell>
                  <Toaster richColors />
                </TooltipProvider>
              </StreamingProvider>
            </ThemeProvider>
          </ClerkProvider>
        )}
      </body>
    </html>
  );
}
