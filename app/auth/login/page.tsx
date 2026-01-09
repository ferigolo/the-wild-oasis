import SignInButton from "@/app/auth/components/SignInButton";

export default function Page() {
  return (
    <div className="w-full flex flex-col gap-12 items-center">
      <h1 className="text-4xl">Sign in now</h1>
      <SignInButton></SignInButton>
    </div>
  );
}
