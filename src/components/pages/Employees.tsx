import React, { useState } from "react";
import DepartmentSelector from "./DepartmentSelector";
import { LetterData } from "../../types/letter.d";
import { useLetterForm } from "../../context/LetterFormContext";

interface EmployeesProps {
  letterData: LetterData;
  setLetterData: React.Dispatch<React.SetStateAction<LetterData>>;
}

const Employees: React.FC<EmployeesProps> = ({ letterData, setLetterData }) => {
  const { users, loadingUsers, fetchUsers } = useLetterForm();
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [searchEmployees, setSearchEmployees] = useState<string>("");

  // Group users by full department path (case-insensitive)
  const employeesByDepartment: Record<string, string[]> = React.useMemo(() => {
    const grouped: Record<string, string[]> = {};
    users.forEach((user: { departmentOrSector: string; name: string }) => {
      const dept = user.departmentOrSector?.trim().toLowerCase() || "other";
      if (!grouped[dept]) grouped[dept] = [];
      grouped[dept].push(user.name);
    });
    return grouped;
  }, [users]);

  // Filter users based on search term across all departments
  const filteredEmployees = React.useMemo(() => {
    if (!searchEmployees) return {};

    const filtered: Record<string, string[]> = {};
    Object.entries(employeesByDepartment).forEach(([dept, employees]) => {
      const matchingEmployees = employees.filter((emp) =>
        emp.toLowerCase().includes(searchEmployees.toLowerCase())
      );
      if (matchingEmployees.length > 0) {
        filtered[dept] = matchingEmployees;
      }
    });
    return filtered;
  }, [employeesByDepartment, searchEmployees]);

  // Only show unique, non-empty selected departments
  const uniqueSelectedDepartments = Array.from(
    new Set(selectedDepartments)
  ).filter(Boolean);

  // Get the last selected department for displaying users
  const currentDepartment =
    uniqueSelectedDepartments[uniqueSelectedDepartments.length - 1];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-sm font-medium text-gray-700">
          CC (Carbon Copy)
        </label>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          Confidential
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Selected employees will receive a confidential copy of this letter via
        email. The email will include forwarding restrictions and
        confidentiality notices.
      </p>

      <DepartmentSelector
        onChange={(value: string) => {
          if (!selectedDepartments.includes(value)) {
            setSelectedDepartments([...selectedDepartments, value]);
            setLetterData({
              ...letterData,
              cc: [...letterData.cc, value],
            });
          }
        }}
      />

      {/* Display selected category path */}
      {currentDepartment && (
        <div className="mt-3 mb-4">
          <span className="text-sm font-medium text-gray-700">
            Selected Category:
          </span>
          <div className="mt-1 text-sm text-blue-600">{currentDepartment}</div>
        </div>
      )}

      <div className="mt-4 border-t pt-2">
        <input
          type="text"
          placeholder="Search employees..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
          onChange={(e) => setSearchEmployees(e.target.value)}
          value={searchEmployees}
        />

        {loadingUsers ? (
          <div className="text-gray-500 text-sm">Loading employees...</div>
        ) : searchEmployees ? (
          // Search results section
          <div className="space-y-4">
            {Object.entries(filteredEmployees).map(([dept, employees]) => (
              <div key={dept} className="border-b pb-4">
                <div className="grid grid-cols-2 gap-2">
                  {employees.map((emp) => (
                    <label
                      key={emp}
                      className="inline-flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={
                          letterData.ccEmployees[dept]?.includes(emp) || false
                        }
                        onChange={(e) => {
                          const updatedEmployees = e.target.checked
                            ? [...(letterData.ccEmployees[dept] || []), emp]
                            : letterData.ccEmployees[dept]?.filter(
                                (x: string) => x !== emp
                              ) || [];
                          setLetterData({
                            ...letterData,
                            ccEmployees: {
                              ...letterData.ccEmployees,
                              [dept]: updatedEmployees,
                            },
                          });
                        }}
                      />
                      <span>{emp}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : currentDepartment ? (
          // Display users for selected department when not searching
          <div className="grid grid-cols-2 gap-2">
            {(employeesByDepartment[currentDepartment.toLowerCase()] || []).map(
              (emp) => (
                <label key={emp} className="inline-flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={
                      letterData.ccEmployees[currentDepartment]?.includes(
                        emp
                      ) || false
                    }
                    onChange={(e) => {
                      const updatedEmployees = e.target.checked
                        ? [
                            ...(letterData.ccEmployees[currentDepartment] ||
                              []),
                            emp,
                          ]
                        : letterData.ccEmployees[currentDepartment]?.filter(
                            (x: string) => x !== emp
                          ) || [];
                      setLetterData({
                        ...letterData,
                        ccEmployees: {
                          ...letterData.ccEmployees,
                          [currentDepartment]: updatedEmployees,
                        },
                      });
                    }}
                  />
                  <span>{emp}</span>
                </label>
              )
            )}
          </div>
        ) : null}

        {/* Display selected employees */}
        {Object.entries(letterData.ccEmployees).map(
          ([dept, employees]) =>
            employees.length > 0 && (
              <div key={dept} className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  CC Recipients ({employees.length} selected):
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {employees.map((emp: string) => (
                    <span
                      key={emp}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
                    >
                      {emp}
                      <button
                        type="button"
                        onClick={() => {
                          const updatedEmployees =
                            letterData.ccEmployees[dept]?.filter(
                              (x: string) => x !== emp
                            ) || [];
                          setLetterData({
                            ...letterData,
                            ccEmployees: {
                              ...letterData.ccEmployees,
                              [dept]: updatedEmployees,
                            },
                          });
                        }}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default Employees;
