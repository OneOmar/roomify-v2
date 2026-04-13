import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-x-hidden bg-background px-4 py-12 text-foreground">
      <div
        className="pointer-events-none absolute inset-0 opacity-50 dark:opacity-35"
        aria-hidden
      >
        <div className="absolute left-1/2 top-0 h-[24rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-3xl dark:bg-primary/[0.12]" />
      </div>
      <div className="relative w-full max-w-md">
        <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
      </div>
    </div>
  );
}
