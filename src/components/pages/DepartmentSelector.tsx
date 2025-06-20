import React, { useState, forwardRef, useImperativeHandle } from "react";
import { useLanguage } from "./LanguageContext";

type DepartmentOption = {
  label: string;
  subDepartments?: DepartmentOption[];
};

const DepartmentSelector = forwardRef<
  { reset: () => void },
  {
    onChange: (value: string) => void;
    showBreadcrumb?: boolean;
    showSubDropdowns?: boolean;
  }
>(({ onChange, showBreadcrumb = true, showSubDropdowns = true }, ref) => {
  const { t, lang } = useLanguage();

  const departments: DepartmentOption[] = t.departmentSelector.departments;

  const [selectedMainCategory, setSelectedMainCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [selectedSubSubCategory, setSelectedSubSubCategory] =
    useState<string>("");

  useImperativeHandle(ref, () => ({
    reset: () => {
      setSelectedMainCategory("");
      setSelectedSubCategory("");
      setSelectedSubSubCategory("");
    },
  }));

  const flattenedDepartments = React.useMemo(() => {
    const flatten = (
      options: DepartmentOption[],
      parentLabel = ""
    ): { label: string; value: string }[] => {
      let result: { label: string; value: string }[] = [];
      options.forEach((opt) => {
        const currentLabel = opt.label;
        const fullLabel = parentLabel
          ? `${parentLabel} > ${currentLabel}`
          : currentLabel;
        result.push({ label: currentLabel, value: fullLabel });
        if (opt.subDepartments) {
          result = result.concat(flatten(opt.subDepartments, fullLabel));
        }
      });
      return result;
    };
    return flatten(departments);
  }, [departments]);

  const handleMainCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedMainCategory(event.target.value);
    setSelectedSubCategory("");
    setSelectedSubSubCategory("");
    onChange(event.target.value);
  };

  const handleSubCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedSubCategory(event.target.value);
    setSelectedSubSubCategory("");
    onChange(`${selectedMainCategory} > ${event.target.value}`);
  };

  const handleSubSubCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedSubSubCategory(event.target.value);
    onChange(
      `${selectedMainCategory} > ${selectedSubCategory} > ${event.target.value}`
    );
  };

  const subCategories =
    departments.find((dept) => dept.label === selectedMainCategory)
      ?.subDepartments || [];
  const subSubCategories =
    subCategories.find((sub) => sub.label === selectedSubCategory)
      ?.subDepartments || [];

  return (
    <div>
      <label className="block text-gray-700 font-medium mb-1">
        {t.departmentSelector.mainCategory}
      </label>
      <select
        className="border border-gray-300 rounded-lg px-3 py-2 w-full bg-white focus:ring-2 focus:ring-blue-200 mb-2"
        value={selectedMainCategory}
        onChange={handleMainCategoryChange}
      >
        <option value="">{t.departmentSelector.selectMainCategory}</option>
        {departments.map((dept) => (
          <option key={dept.label} value={dept.label}>
            {dept.label}
          </option>
        ))}
      </select>

      {showSubDropdowns && subCategories.length > 0 && (
        <>
          <label className="block text-gray-700 font-medium mb-1">
            {t.departmentSelector.subCategory}
          </label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 w-full bg-white focus:ring-2 focus:ring-blue-200 mb-2"
            value={selectedSubCategory}
            onChange={handleSubCategoryChange}
          >
            <option value="">{t.departmentSelector.selectSubCategory}</option>
            {subCategories.map((sub) => (
              <option key={sub.label} value={sub.label}>
                {sub.label}
              </option>
            ))}
          </select>
        </>
      )}

      {showSubDropdowns && subSubCategories.length > 0 && (
        <>
          <label className="block text-gray-700 font-medium mb-1">
            {t.departmentSelector.subSubCategory}
          </label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 w-full bg-white focus:ring-2 focus:ring-blue-200 mb-2"
            value={selectedSubSubCategory}
            onChange={handleSubSubCategoryChange}
          >
            <option value="">
              {t.departmentSelector.selectSubSubCategory}
            </option>
            {subSubCategories.map((subSub) => (
              <option key={subSub.label} value={subSub.label}>
                {subSub.label}
              </option>
            ))}
          </select>
        </>
      )}

      {showBreadcrumb &&
        (selectedMainCategory ||
          selectedSubCategory ||
          selectedSubSubCategory) && (
          <div style={{ marginTop: "20px", color: "green" }}>
            {t.departmentSelector.selectedCategory}:{" "}
            <strong>
              {[
                selectedMainCategory,
                selectedSubCategory,
                selectedSubSubCategory,
              ]
                .filter(Boolean)
                .join(" > ")}
            </strong>
          </div>
        )}
    </div>
  );
});

export default DepartmentSelector;
