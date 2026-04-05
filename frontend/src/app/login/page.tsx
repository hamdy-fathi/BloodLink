"use client";

import { Droplet, ArrowRight, Github, Mail } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-brand selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shadow-[0_0_15px_rgba(225,29,72,0.2)]">
            <Droplet className="w-6 h-6 text-brand" fill="currentColor" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground tracking-tight">
          Sign in to Blood<span className="text-brand">Link</span>
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Or{' '}
          <a href="#" className="font-medium text-brand hover:text-brand-hover transition-colors">
            register as a new donor
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-panel py-8 px-4 shadow-xl border border-border sm:rounded-2xl sm:px-10 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <form className="space-y-6 relative z-10" action="#" method="POST">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-zinc-700 bg-zinc-900/50 rounded-lg shadow-sm placeholder-zinc-500 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm transition-colors text-white"
                  placeholder="you@hospital.org"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-zinc-700 bg-zinc-900/50 rounded-lg shadow-sm placeholder-zinc-500 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm transition-colors text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-brand focus:ring-brand border-zinc-700 rounded bg-zinc-900"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-400">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-brand hover:text-brand-hover transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-[0_0_15px_rgba(225,29,72,0.2)] text-sm font-semibold text-white bg-brand hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand focus:ring-offset-background transition-colors group"
              >
                Sign In
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          <div className="mt-6 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-panel text-zinc-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-zinc-700 rounded-lg shadow-sm bg-zinc-900/50 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  <span className="sr-only">Sign in with Google</span>
                  <Mail className="w-5 h-5" />
                </a>
              </div>

              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-zinc-700 rounded-lg shadow-sm bg-zinc-900/50 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  <span className="sr-only">Sign in with SSO</span>
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
