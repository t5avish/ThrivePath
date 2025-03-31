import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const TreatmentPage = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [treatment, setTreatment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    const fetchPatientTreatment = async () => {
      try {
        const response = await fetch(`/api/get-patient-treatment?patientId=${patientId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        const text = await response.text();

        if (!response.ok) {
          throw new Error(text || "Failed to fetch patient treatment");
        }

        const data = JSON.parse(text);
        setPatient(data.patient);
        setTreatment(data.patient.treatment);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching patient treatment:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchPatientTreatment();
  }, [patientId, navigate]);

  const handleDownloadPlan = () => {
    alert("Download functionality to be implemented");
  };

  const handleGoBack = () => {
    navigate("/select-patient");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-blue-500 flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading treatment plan...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">
          <span className="font-medium">Error:</span> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b border-gray-200 px-6 py-4 bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-blue-600 text-xl font-bold">ThrivePath</div>
          <nav className="flex items-center justify-end gap-8">
            <a className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1" href="#">Treatment</a>
            <a className="text-gray-600 hover:text-blue-600 transition-colors" href="#">Tracking</a>
            <button
              onClick={handleGoBack}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Back to Patients
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Treatment Plan</h1>
            <p className="text-gray-600">Personalized recommendations for {patient?.name}</p>
          </div>
          <button
            onClick={handleDownloadPlan}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download Plan
          </button>
        </div>

        {treatment && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Meal Plan - Improved */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Daily Meal Plan</h2>
              </div>
              <div className="space-y-4">
                {["breakfast", "lunch", "dinner"].map((meal) => (
                  <div key={meal} className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-400">
                    <h3 className="font-medium text-gray-900 capitalize mb-2 flex items-center">
                      {meal === "breakfast" && (
                        <span className="text-yellow-500 mr-2">☀️</span>
                      )}
                      {meal === "lunch" && (
                        <span className="text-orange-500 mr-2">🕛</span>
                      )}
                      {meal === "dinner" && (
                        <span className="text-blue-500 mr-2">🌙</span>
                      )}
                      {meal}
                    </h3>
                    <div className="space-y-2">
                      {treatment.dailyMealPlan[meal].map((item, index) => (
                        <div key={index} className="bg-white p-3 rounded border border-gray-200 flex justify-between">
                          <div className="font-medium">{item.option}</div>
                          <div className="flex gap-3 text-sm">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {item.portion}
                            </span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                              {item.nutrition}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-400">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <span className="mr-2">🍎</span>
                    Snacks
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {treatment.dailyMealPlan.snacks.map((snack, idx) => (
                      <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                        {snack}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Activity */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Physical Activity</h2>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white p-3 rounded shadow-sm flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Duration</span>
                      <p className="font-medium">{treatment.physicalActivity.duration}</p>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Type</span>
                      <p className="font-medium">{treatment.physicalActivity.type}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Suggested Timing</h3>
                <div className="space-y-2">
                  <div className="flex items-center p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <span className="mr-2">☀️</span>
                    <p>{treatment.physicalActivity.timingSuggestions.morning}</p>
                  </div>
                  <div className="flex items-center p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
                    <span className="mr-2">🔄</span>
                    <p>{treatment.physicalActivity.timingSuggestions.alternative}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="font-medium text-green-800 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Muscle Strengthening
                </h3>
                <p className="text-green-800">
                  {treatment.physicalActivity.muscleStrengtheningActivities}
                </p>
              </div>
            </div>

            {/* Sleep Schedule */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Sleep Schedule</h2>
              </div>
              <div className="flex justify-between items-center mb-4 bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-indigo-100 p-2 rounded-full mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bedtime</p>
                    <p className="font-medium text-indigo-900">{treatment.sleepSchedule.bedtime}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-2 rounded-full mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Wake Time</p>
                    <p className="font-medium text-indigo-900">{treatment.sleepSchedule.wakeTime}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <h3 className="font-medium text-indigo-900 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  Routine Tips
                </h3>
                <div className="space-y-2">
                  {treatment.sleepSchedule.routineTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start p-2 bg-white rounded border border-indigo-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-indigo-800">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hydration */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Daily Hydration</h2>
              </div>
              <div className="bg-cyan-50 p-4 rounded-lg mb-4 flex items-center">
                <div className="bg-cyan-100 p-3 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-cyan-700">Total Water</p>
                  <p className="text-2xl font-bold text-cyan-900">{treatment.hydration.totalWater}</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-900 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Hydration Tips
                </h3>
                <div className="space-y-2">
                  {treatment.hydration.tips.map((tip, idx) => (
                    <div key={idx} className="flex items-start p-2 bg-white rounded border border-blue-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                      </svg>
                      <p className="text-blue-800">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TreatmentPage;