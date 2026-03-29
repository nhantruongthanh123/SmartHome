import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-200 px-4 py-10 md:px-6">
      <section className="mx-auto w-full max-w-[430px] rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-[0_18px_46px_-24px_rgba(15,23,42,0.35)] md:p-9">
        <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-8 w-8 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
          >
            <path d="M3 10.75L12 3l9 7.75" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.75 9.5V21h10.5V9.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 21v-5.25h4V21" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="text-center text-5xl font-extrabold tracking-tight text-slate-900">Smart Home</h1>
        <p className="mt-3 mb-7 text-center text-sm text-slate-500">Create an account to manage your devices.</p>
        <RegisterForm />
      </section>
    </main>
  );
}

