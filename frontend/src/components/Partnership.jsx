import React, { useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "react-toastify/dist/ReactToastify.css";
import PartnersSection from "./partnership/PartnersSection";
import BusinessDetailsSection from "./partnership/BusinessDetailsSection";
import WorkingPartnersSection from "./partnership/WorkingPartnersSection";
import ProfitSharingSection from "./partnership/ProfitSharingSection";
import NonWorkingPartnersSection from "./partnership/NonWorkingPartnersSection";
import WitnessesSection from "./partnership/WitnessesSection";
import AdditionalDetailsSection from "./partnership/AdditionalDetailsSection";

const Partnership = () => {
  const [formData, setFormData] = useState({
    dateOfExecution: new Date().toISOString().split("T")[0],
    executionPlace: "",
    partners: [
      { name: "", age: "", fatherName: "", residence: "" },
      { name: "", age: "", fatherName: "", residence: "" },
    ],
    businessType: "",
    firmName: "",
    principalPlaceOfBusiness: "",
    originalDeedDate: "",
    workingPartners: [{ name: "", remunerationPercentage: "" }],
    profitSharing: [
      { name: "", profitSharePercentage: "" },
      { name: "", profitSharePercentage: "" },
    ],
    bankOperationMode: "",
    nonWorkingPartners: [{ name: "" }],
    witnesses: [{ name: "" }, { name: "" }],
    additionalTerms: "",
  });

  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (section, index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev[section]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [section]: updated };
    });
  };

  const handleAddItem = (section) => {
    setFormData((prev) => {
      let newItem = {};
      switch (section) {
        case "partners":
          newItem = { name: "", age: "", fatherName: "", residence: "" };
          break;
        case "workingPartners":
          newItem = { name: "", remunerationPercentage: "" };
          break;
        case "profitSharing":
          newItem = { name: "", profitSharePercentage: "" };
          break;
        case "nonWorkingPartners":
        case "witnesses":
          newItem = { name: "" };
          break;
        default:
          return prev;
      }
      const updated = [...prev[section], newItem];
      if (section === "partners") {
        const profitSharing = updated.map(() => ({
          name: "",
          profitSharePercentage: "",
        }));
        return { ...prev, [section]: updated, profitSharing };
      }
      return { ...prev, [section]: updated };
    });
  };

  const handleRemoveItem = (section, index) => {
    setFormData((prev) => {
      const updated = prev[section].filter((_, i) => i !== index);
      if (section === "partners") {
        const profitSharing = updated.map(() => ({
          name: "",
          profitSharePercentage: "",
        }));
        return { ...prev, [section]: updated, profitSharing };
      }
      return { ...prev, [section]: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.info("Generating preview...");
    setShowPreview(true);
  };

  const downloadPDF = async () => {
    const input = previewRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("Partnership_Deed.pdf");
    toast.success("PDF downloaded successfully!");
  };

  const renderPreview = () => (
    <div
      ref={previewRef}
      className="bg-white text-black p-8 rounded-lg shadow-lg max-w-4xl mx-auto leading-relaxed"
    >
      <h2 className="text-center font-bold text-2xl mb-4">PARTNERSHIP DEED</h2>
      <p className="text-center text-sm mb-6">(Sample Indian Legal Format)</p>
      <p>
        This Partnership Deed is executed on{" "}
        <strong>{formData.dateOfExecution}</strong> at{" "}
        <strong>{formData.executionPlace || "__________"}</strong> between:
      </p>

      {formData.partners.map((p, i) => (
        <p key={i}>
          Partner {i + 1}: <strong>{p.name || "__________"}</strong>, aged{" "}
          <strong>{p.age || "____"}</strong>, son/daughter of{" "}
          <strong>{p.fatherName || "__________"}</strong>, residing at{" "}
          <strong>{p.residence || "__________"}</strong>.
        </p>
      ))}

      <p className="mt-4">
        Business Name: <strong>{formData.firmName || "__________"}</strong>{" "}
        <br />
        Principal Place of Business:{" "}
        <strong>
          {formData.principalPlaceOfBusiness || "__________"}
        </strong>{" "}
        <br />
        Type of Business:{" "}
        <strong>{formData.businessType || "__________"}</strong> <br />
        Original Deed Date:{" "}
        <strong>{formData.originalDeedDate || "__________"}</strong>
      </p>

      <div className="mt-4">
        <h3 className="font-bold mb-2">Working Partners and Remuneration:</h3>
        {formData.workingPartners.map((wp, i) => (
          <p key={i}>
            {wp.name || "__________"} - {wp.remunerationPercentage || "____"}%
          </p>
        ))}
      </div>

      <div className="mt-4">
        <h3 className="font-bold mb-2">Profit Sharing:</h3>
        {formData.profitSharing.map((ps, i) => (
          <p key={i}>
            {ps.name || "__________"} - {ps.profitSharePercentage || "____"}%
          </p>
        ))}
      </div>

      <div className="mt-4">
        <h3 className="font-bold mb-2">Non-Working Partners:</h3>
        {formData.nonWorkingPartners.map((np, i) => (
          <p key={i}>{np.name || "__________"}</p>
        ))}
      </div>

      <div className="mt-4">
        <h3 className="font-bold mb-2">Bank Operation Mode:</h3>
        <p>{formData.bankOperationMode || "__________"}</p>
      </div>

      <div className="mt-4">
        <h3 className="font-bold mb-2">Witnesses:</h3>
        {formData.witnesses.map((w, i) => (
          <p key={i}>{w.name || "__________"}</p>
        ))}
      </div>

      {formData.additionalTerms && (
        <p className="mt-4">
          <strong>Additional Terms:</strong> {formData.additionalTerms}
        </p>
      )}
    </div>
  );

  return (
    <div className="w-full px-4 py-8">
      <ToastContainer />
      <h1 className="text-center text-blue-600 text-3xl font-bold mb-12">
        Partnership Deed Form
      </h1>

      {!showPreview ? (
        <form onSubmit={handleSubmit} className="space-y-8 w-full">
          <PartnersSection
            formData={formData}
            handleArrayChange={handleArrayChange}
            handleAddItem={handleAddItem}
            handleRemoveItem={handleRemoveItem}
          />
          <BusinessDetailsSection
            formData={formData}
            handleChange={handleChange}
          />
          <WorkingPartnersSection
            formData={formData}
            handleArrayChange={handleArrayChange}
            handleAddItem={handleAddItem}
            handleRemoveItem={handleRemoveItem}
          />
          <NonWorkingPartnersSection
            formData={formData}
            handleArrayChange={handleArrayChange}
            handleAddItem={handleAddItem}
            handleRemoveItem={handleRemoveItem}
          />
          <ProfitSharingSection
            formData={formData}
            handleArrayChange={handleArrayChange}
            handleAddItem={handleAddItem}
            handleRemoveItem={handleRemoveItem}
          />
          <WitnessesSection
            formData={formData}
            handleArrayChange={handleArrayChange}
            handleAddItem={handleAddItem}
            handleRemoveItem={handleRemoveItem}
          />
          <AdditionalDetailsSection
            formData={formData}
            handleChange={handleChange}
          />

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-blue-800 transition"
            >
              Generate Preview
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center">
          {renderPreview()}
          <div className="mt-6 space-x-4">
            <button
              onClick={() => setShowPreview(false)}
              className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
            >
              Edit Details
            </button>
            <button
              onClick={downloadPDF}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partnership;
