const LoadingSpinner = ({
  size = "medium",
  text = "Loading...",
  className = "",
}) => {
  const sizeClasses = {
    small: "size-4 border-2",
    medium: "size-6 border-3",
    large: "size-8 border-4",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 ${className}`}
    >
      <div
        className={`animate-spin inline-block ${sizeClasses[size]} border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500`}
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {text && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
