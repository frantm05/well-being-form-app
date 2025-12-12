import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import "./IntroForm.css";

export function IntroForm({ onComplete }) {
  const [step, setStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: null, // Changed to null for AsyncSelect
    country: null,
    university: null,
    faculty: "",
    major: "",
  });

  // Gender options as async function
  const loadGenderOptions = (inputValue) => {
    const genderOptions = [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "other", label: "Other" },
    ];

    if (!inputValue) {
      return Promise.resolve(genderOptions);
    }

    const filtered = genderOptions.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    return Promise.resolve(filtered);
  };

  const loadApiCountries = (inputValue) => {
    const fetchUrl = `/api/getUniversities?name=${encodeURIComponent(
      inputValue
    )}`;

    return fetch(fetchUrl)
      .then((response) => response.json())
      .then((data) => {
        const uniqueCountries = [
          ...new Set(data.map((uni) => uni.country)),
        ].filter((countryName) =>
          countryName.toLowerCase().includes(inputValue.toLowerCase())
        );

        return uniqueCountries.map((countryName) => ({
          value: countryName,
          label: countryName,
        }));
      });
  };

  const loadUniversities = (inputValue) => {
    if (!personalInfo.country) {
      return Promise.resolve([]);
    }

    const apiCountryName = personalInfo.country.value;
    let apiUrl = `/api/getUniversities?country=${encodeURIComponent(
      apiCountryName
    )}`;

    if (inputValue) {
      apiUrl += `&name=${encodeURIComponent(inputValue)}`;
    }

    return fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        return data.map((uni) => ({
          value: uni.name,
          label: uni.name,
          domain: uni.domains[0],
        }));
      })
      .catch((error) => {
        console.error("University fetch error:", error);
        return [];
      });
  };

  const handleChange = (field, value) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const isPersonalInfoComplete = () => {
    return (
      personalInfo.age &&
      personalInfo.gender &&
      personalInfo.country &&
      personalInfo.university &&
      personalInfo.faculty.trim() &&
      personalInfo.major.trim()
    );
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "#1a1a1a",
      borderColor: state.isFocused ? "#ff69b4" : "#333",
      borderRadius: "8px",
      padding: "2px",
      minHeight: "42px",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#ff69b4",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#1a1a1a",
      border: "1px solid #333",
      borderRadius: "8px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      borderRadius: "8px",
      backgroundColor: "#1a1a1a",
      padding: "4px",
      maxHeight: "160px",
      "::-webkit-scrollbar": {
        width: "8px",
      },
      "::-webkit-scrollbar-track": {
        background: "#1a1a1a",
        marginBottom: "1.5px",
        marginTop: "1.5px",
      },
      "::-webkit-scrollbar-thumb": {
        background: "#444",
        borderRadius: "8px",
      },
      "::-webkit-scrollbar-thumb:hover": {
        background: "#555",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? "#2a2a2a"
        : state.isSelected
        ? "rgba(255, 105, 180, 0.2)"
        : "#1a1a1a",
      color: "rgba(255, 255, 255, 0.87)",
      padding: "8px 12px",
      cursor: "pointer",
      borderRadius: "4px",
      "&:active": {
        backgroundColor: "rgba(255, 105, 180, 0.3)",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "rgba(255, 255, 255, 0.87)",
    }),
    input: (provided) => ({
      ...provided,
      color: "rgba(255, 255, 255, 0.87)",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "rgba(255, 255, 255, 0.4)",
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: "#333",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "rgba(255, 255, 255, 0.6)",
      "&:hover": {
        color: "rgba(255, 255, 255, 0.87)",
      },
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: "rgba(255, 255, 255, 0.6)",
      "&:hover": {
        color: "rgba(255, 255, 255, 0.87)",
      },
    }),
    loadingIndicator: (provided) => ({
      ...provided,
      color: "rgba(255, 255, 255, 0.6)",
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: "rgba(255, 255, 255, 0.6)",
    }),
    loadingMessage: (provided) => ({
      ...provided,
      color: "rgba(255, 255, 255, 0.6)",
    }),
  };

  return (
    <div className="intro-overlay">
      <div className="intro-modal">
        {step === 1 ? (
          <>
            <h2>Welcome to your Well-being Form</h2>
            <p>Please provide some information about yourself:</p>
            <form className="personal-info-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nickname (optional)</label>
                  <input
                    type="text"
                    value={personalInfo.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    placeholder="First name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={personalInfo.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    className="small-input"
                    placeholder="Age"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <AsyncSelect
                    id="gender"
                    cacheOptions
                    defaultOptions
                    loadOptions={loadGenderOptions}
                    value={personalInfo.gender}
                    onChange={(option) => handleChange("gender", option)}
                    placeholder="Select gender"
                    styles={customSelectStyles}
                    isClearable
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="country">Country of Study</label>
                <AsyncSelect
                  id="country"
                  cacheOptions
                  defaultOptions
                  loadOptions={loadApiCountries}
                  value={personalInfo.country}
                  onChange={(option) => handleChange("country", option)}
                  placeholder="Start typing country name"
                  styles={customSelectStyles}
                  isClearable
                />
              </div>

              <div className="form-group">
                <label htmlFor="university">University</label>
                <AsyncSelect
                  id="university"
                  key={
                    personalInfo.country
                      ? personalInfo.country.value
                      : "no-country"
                  }
                  cacheOptions
                  defaultOptions
                  loadOptions={loadUniversities}
                  value={personalInfo.university}
                  onChange={(option) => handleChange("university", option)}
                  placeholder="Start typing university name"
                  styles={customSelectStyles}
                  isClearable
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Faculty</label>
                  <input
                    type="text"
                    value={personalInfo.faculty}
                    onChange={(e) => handleChange("faculty", e.target.value)}
                    placeholder="e.g., Engineering"
                  />
                </div>
                <div className="form-group">
                  <label>Major</label>
                  <input
                    type="text"
                    value={personalInfo.major}
                    onChange={(e) => handleChange("major", e.target.value)}
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
            </form>

            <div className="intro-buttons">
              <button
                onClick={() => setStep(2)}
                disabled={!isPersonalInfoComplete()}
                className="next-button"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>How to Use This Form</h2>
            <div className="instructions">
              <p>
                You can see above which question you are currently answering.
              </p>
              <p>
                We will go through different areas of your life and you will
                rate how you feel in each of them.
              </p>
              <p>
                <strong>Slide the bar from 0 to 10.</strong> Zero means bad, you
                are not happy here, ten means great, you are doing excellent
                here.
              </p>
              <p>
                If a question does not apply to you, choose{" "}
                <strong>"Not relevant"</strong>.
              </p>
            </div>

            <div className="intro-buttons">
              <button onClick={() => setStep(1)} className="back-button">
                Back
              </button>
              <button
                onClick={() => {
                  if (isPersonalInfoComplete()) {
                    onComplete(personalInfo);
                  }
                }}
                className="start-button"
              >
                Start Form
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
