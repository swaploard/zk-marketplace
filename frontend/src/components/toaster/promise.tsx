import { toast, ToastPosition } from "react-hot-toast";

export const handlePromiseToaster = async (
  promise,
  error,
  loading,
  success,
  position: ToastPosition = "top-right",
) => {
  toast.promise(
    promise,
    {
      loading: loading,
      success: success,
      error: error,
    },
    {
      position,
      style: {
        minWidth: "250px",
        borderRadius: "8px",
        padding: "8px",
        color: "#fff",
      },
      success: {
        duration: 5000,
        icon: "✅",
        style: {
          background: "#4caf50", // Green for success
        },
      },
      loading: {
        duration: 5000,
        icon: "⏳",
        style: {
          background: "#2196f3", // Blue for loading
        },
      },
      error: {
        duration: 5000,
        icon: "❌",
        style: {
          background: "#f44336", // Red for error
        },
      },
    },
  );
};
