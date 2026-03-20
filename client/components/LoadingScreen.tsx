import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center z-50">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-blue-500/30 rounded-full animate-pulse"></div>
          <Loader2 className="h-16 w-16 text-blue-400 animate-spin mx-auto relative z-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white animate-pulse">{message}</h2>
          <div className="flex justify-center gap-2">
            <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
