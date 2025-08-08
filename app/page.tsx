import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await currentUser();
  
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold">AI Playground</h1>
        <p className="text-lg text-gray-600">
          Explore multi-modal AI capabilities in one place
        </p>
        <div className="flex flex-col space-y-4">
          <Link 
            href="/sign-in"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
          >
            Sign In
          </Link>
          <Link 
            href="/sign-up"
            className="w-full py-2 px-4 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-lg shadow border border-gray-300"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}