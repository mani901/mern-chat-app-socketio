import React from "react";

const MessageDetails = ({ message }) => {
  if (!message) return null;

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md mt-4">
      <h2 className="text-lg font-semibold">Received Message</h2>
      <p className="text-gray-800">{message.text}</p>
      <p className="text-sm text-gray-500">From: {message.sender}</p>
    </div>
  );
};

export default MessageDetails;
