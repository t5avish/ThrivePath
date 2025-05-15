import React from "react";

const HeaderSection = ({ menuOpen, setMenuOpen, navigate, patientId }) => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  const handleGoBack = () => navigate("/select-patient");

  return (
    <header className="border-b border-gray-200 px-4 py-4 bg-white shadow sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-blue-600 text-xl font-bold">ThrivePath</div>
        </div>

        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <nav className="hidden md:flex items-center justify-end gap-4">
          <a
            onClick={() => navigate(`/treatment/${patientId}`)}
            className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer px-3 py-2 rounded-md hover:bg-gray-100"
          >
            Treatment
          </a>
          <a
            onClick={() => navigate(`/tracking/${patientId}`)}
            className="text-blue-600 font-semibold px-3 py-2 rounded-md bg-blue-50"
          >
            Tracking
          </a>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Patients
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors shadow-sm flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </nav>
      </div>

      {menuOpen && (
        <div className="md:hidden py-2 px-2 border-t border-gray-100 bg-white mt-2">
          <div className="space-y-1">
            <a
              onClick={() => { navigate(`/treatment/${patientId}`); setMenuOpen(false); }}
              className="block py-2 px-3 text-gray-600 hover:text-blue-600 rounded-md hover:bg-gray-100"
            >
              Treatment
            </a>
            <a
              onClick={() => { navigate(`/tracking/${patientId}`); setMenuOpen(false); }}
              className="block py-2 px-3 text-blue-600 font-semibold rounded-md bg-blue-50"
            >
              Tracking
            </a>
            <button
              onClick={() => { handleGoBack(); setMenuOpen(false); }}
              className="w-full text-left py-2 px-3 text-gray-600 hover:bg-gray-50 rounded-md flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Patients
            </button>
            <button
              onClick={() => { handleLogout(); setMenuOpen(false); }}
              className="w-full text-left py-2 px-3 text-gray-600 hover:bg-gray-50 rounded-md flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderSection;
