"use client"

export default function ActivationLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4">

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <img
          src="/images/bg-activation.jpg"
          className="w-full h-full object-cover"
          alt=""
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      </div>

      {/* CARD */}
      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl p-6 text-center shadow-lg">

        {/* ICON */}
        <div className="mb-4">
          <img src="/icons/gift.svg" className="w-12 h-12 mx-auto" />
        </div>

        {children}

      </div>
    </main>
  )
}