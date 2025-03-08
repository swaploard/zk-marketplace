import toast, { ToastPosition } from "react-hot-toast";
import { ApiResponse } from "@/axios/index";

type ToastMessage = {
  title: string;
  message?: string;
};

export const handlePromiseToaster = (
  promise: ApiResponse,
  error: ToastMessage,
  loading: ToastMessage,
  success: ToastMessage,
  position: ToastPosition = "top-right",
) => {
  return toast.promise(
    Promise.resolve(promise),
    {
      loading: (
        <div className="flex flex-col relative">
          <button
            onClick={() => toast.dismiss()}
            className="absolute top-1 right-1 text-gray-400 hover:text-white"
          >
            ×
          </button>
          <strong className="text-sm">{loading.title}</strong>
          {loading.message && (
            <span className="text-xs">{loading.message}</span>
          )}
        </div>
      ),
      success: (
        <div className="flex flex-col relative">
          <button
            onClick={() => toast.dismiss()}
            className="absolute top-1 right-1 text-gray-400 hover:text-white"
          >
            ×
          </button>
          <strong className="text-sm">{success.title}</strong>
          {success.message && (
            <span className="text-xs">{success.message}</span>
          )}
        </div>
      ),
      error: (
        <div className="flex flex-col relative">
          <button
            onClick={() => toast.dismiss()}
            className="absolute top-1 right-1 text-gray-400 hover:text-white"
          >
            ×
          </button>
          <strong className="text-sm">{error.title}</strong>
          {error.message && <span className="text-xs">{error.message}</span>}
        </div>
      ),
    },
    {
      position,
      style: {
        minWidth: "300px",
        borderRadius: "8px",
        padding: "16px",
        backgroundColor: "#1a1a1a",
        color: "#fff",
      },
      success: {
        duration: 5000,
        icon: "✅",
      },
      error: {
        duration: 5000,
        icon: "❌",
      },
      loading: {
        duration: Infinity,
        icon: "⏳",
      },
      className: "toast-stack cursor-pointer",
    },
  );
};
