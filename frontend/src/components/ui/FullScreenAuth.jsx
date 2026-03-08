import { Sparkles } from "lucide-react";
import { InteractiveHoverButton } from "./InteractiveHoverButton";

export const FullScreenAuth = ({ 
  mode = "signup", 
  onSubmit, 
  formData, 
  onChange, 
  errors = {}, 
  loading = false 
}) => {
  const isSignup = mode === "signup";

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden p-4">
      <div className="w-full relative max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-xl rounded-3xl">
        {/* Overlay gradients */}
        <div className="w-full h-full z-2 absolute bg-gradient-to-t from-transparent to-black/10 rounded-3xl"></div>
        
        {/* Vertical stripes effect */}
        <div className="flex absolute z-2 overflow-hidden backdrop-blur-2xl rounded-l-3xl">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className="h-[40rem] z-2 w-[4rem] bg-gradient-to-b from-transparent via-black/70 to-transparent opacity-30 overflow-hidden"
            ></div>
          ))}
        </div>

        {/* Decorative circles */}
        <div className="w-[15rem] h-[15rem] bg-orange-500 absolute z-1 rounded-full -bottom-20 -left-10"></div>
        <div className="w-[8rem] h-[8rem] bg-white absolute z-1 rounded-full bottom-10 left-20"></div>

        {/* Left side - Black section */}
        <div className="bg-black text-white p-8 md:p-12 md:w-1/2 relative rounded-l-3xl overflow-hidden flex items-center">
          <h1 className="text-2xl md:text-3xl font-normal leading-tight z-10 tracking-tight relative" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>
            Streamline your events with EventNexus, the complete platform for event management.
          </h1>
        </div>

        {/* Right side - Form section */}
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-white z-10 text-gray-900 rounded-r-3xl">
          <div className="flex flex-col items-left mb-8">
            <div className="text-black mb-4">
              <Sparkles className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-medium mb-2 tracking-tight">
              {isSignup ? "Get Started" : "Welcome Back"}
            </h2>
            <p className="text-left opacity-80">
              {isSignup 
                ? "Welcome to EventNexus — Let's get started" 
                : "Sign in to continue to EventNexus"}
            </p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
            {isSignup && (
              <div>
                <label htmlFor="name" className="block text-sm mb-2">
                  Your name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  className={`text-base w-full min-h-[44px] py-3 px-4 border rounded-lg focus:outline-none focus:ring-1 bg-white text-black focus:ring-black ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.name || ""}
                  onChange={onChange}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm mb-2">
                Your email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                className={`text-base w-full min-h-[44px] py-3 px-4 border rounded-lg focus:outline-none focus:ring-1 bg-white text-black focus:ring-black ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.email || ""}
                onChange={onChange}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mb-2">
                {isSignup ? "Create password" : "Password"}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={`text-base w-full min-h-[44px] py-3 px-4 border rounded-lg focus:outline-none focus:ring-1 bg-white text-black focus:ring-black ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.password || ""}
                onChange={onChange}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {isSignup && (
              <div>
                <label htmlFor="role" className="block text-sm mb-2">
                  Account type
                </label>
                <select
                  id="role"
                  name="role"
                  className="text-base w-full min-h-[44px] py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 bg-white text-black focus:ring-black"
                  value={formData.role || "participant"}
                  onChange={onChange}
                  disabled={loading}
                >
                  <option value="participant">Participant</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <InteractiveHoverButton
              text={loading 
                ? (isSignup ? "Creating account..." : "Signing in...") 
                : (isSignup ? "Create account" : "Sign in")}
              type="submit"
              className="w-full h-12 mt-2"
              disabled={loading}
            />

            <div className="text-center text-gray-600 text-sm">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <a 
                href={isSignup ? "/login" : "/register"} 
                className="text-black font-medium underline"
              >
                {isSignup ? "Login" : "Sign up"}
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
