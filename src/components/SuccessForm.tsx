import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SuccessForm() {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulating an API call/Success action
    setTimeout(() => {
      setIsSubmitting(false);
      setShowModal(true);
    }, 1500);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Route to the home page
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Example Form Trigger */}
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 text-center">
          Submit Your Case
        </h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              rows="3"
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-blue-400"
          >
            {isSubmitting ? "Submitting..." : "Submit to Attorney"}
          </button>
        </form>
      </div>

      {/* --- SUCCESS MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto outline-none">
          {/* Backdrop Overlay */}
          <div className="fixed inset-0 bg-black opacity-50 transition-opacity"></div>

          {/* Modal Content Box */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center transform transition-all z-10 animate-fade-in">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Heading & Text */}
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
              Submission Successful!
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Thank you. Your message has been safely received. You will now be
              redirected to the main insights page.
            </p>

            {/* Action Button */}
            <button
              onClick={handleCloseModal}
              className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:text-sm"
            >
              Go to Home Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
