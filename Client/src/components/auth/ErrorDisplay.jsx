const ErrorDisplay = ({ error }) => {
  if (!error) return null;

  return (
    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      {error}
    </div>
  );
};

export default ErrorDisplay;
