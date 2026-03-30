import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="auth-page-shell min-h-screen px-4 py-10 md:px-6">
      <section className="auth-panel mx-auto w-full max-w-[430px] rounded-3xl p-8 md:p-9">
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

        <h1 className="auth-title text-center text-5xl font-extrabold tracking-tight">Smart Home</h1>
        <p className="auth-subtitle mt-3 mb-7 text-center text-sm">Create an account to manage your devices.</p>
        <RegisterForm />
      </section>
    </main>
  );
}

