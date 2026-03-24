import React, { useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "react-toastify/dist/ReactToastify.css";

import Info from "./nda/Info";
import DisclosingParty from "./nda/DisclosingParty";
import ReceivingParty from "./nda/ReceivingParty";
import NonCompete from "./nda/NonCompete";
import TermDuration from "./nda/TermDuration";
import Witness from "./nda/Witness";

const NDA = () => {
  const [formData, setFormData] = useState({
    dateOfDrafting: new Date().toISOString().split("T")[0],
    confidentialInformation: [
      "Business Operations",
      "Customer Data",
      "Services Provided",
      "Intellectual Property",
      "Product Information",
      "Production Processes",
      "Accounting and Finances",
      "Marketing and Development",
      "Computer Technology and Security",
      "Third Party Information",
    ],
    disclosingPartyName: "",
    disclosingPartyAddress: "",
    receivingPartyName: "",
    receivingPartyAddress: "",
    nonCompeteClause: "No",
    nonCompeteDuration: "",
    nonSolicitClause: "No",
    nonSolicitDuration: "",
    termDuration: "Indefinitely",
    witnessName: "",
    witnessAddress: "",
    addWitnessName: "",
    addWitnessAddress: "",
  });

  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prevState) => {
      if (type === "checkbox") {
        return {
          ...prevState,
          confidentialInformation: checked
            ? [...prevState.confidentialInformation, value]
            : prevState.confidentialInformation.filter((item) => item !== value),
        };
      }
      return { ...prevState, [name]: value };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.info("Generating NDA Preview...");
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

    pdf.save("NDA_Agreement.pdf");
    toast.success("NDA Agreement PDF downloaded!");
  };

  const renderPreviewText = () => (
    <div
      ref={previewRef}
      className="bg-white text-black p-8 rounded-lg shadow-lg max-w-3xl mx-auto leading-relaxed"
    >
      <h2 className="text-center font-bold text-2xl mb-4">
        NON-DISCLOSURE AGREEMENT (NDA)
      </h2>
      <p className="text-center mb-6 text-sm">(Sample Indian Legal Format)</p>

      <p>
        Date: <strong>{formData.dateOfDrafting}</strong>
      </p>

      <p className="mt-4">
        This Non-Disclosure Agreement (“Agreement”) is made between{" "}
        <strong>{formData.disclosingPartyName || "__________"}</strong>, residing at{" "}
        <strong>{formData.disclosingPartyAddress || "__________"}</strong> (the “Disclosing Party”), and{" "}
        <strong>{formData.receivingPartyName || "__________"}</strong>, residing at{" "}
        <strong>{formData.receivingPartyAddress || "__________"}</strong> (the “Receiving Party”).
      </p>

      <p className="mt-4">
        <strong>1. Definition of Confidential Information:</strong> Confidential
        Information includes but is not limited to:{" "}
        {formData.confidentialInformation.join(", ")}.
      </p>

      <p className="mt-4">
        <strong>2. Obligations of Receiving Party:</strong> The Receiving Party agrees
        to maintain confidentiality and not disclose, publish, or reproduce any
        Confidential Information without prior written consent of the Disclosing Party.
      </p>

      <p className="mt-4">
        <strong>3. Non-Compete and Non-Solicit:</strong>
        <br />
        Non-Compete Clause:{" "}
        {formData.nonCompeteClause === "Yes"
          ? `Yes (Duration: ${formData.nonCompeteDuration})`
          : "No"}
        <br />
        Non-Solicit Clause:{" "}
        {formData.nonSolicitClause === "Yes"
          ? `Yes (Duration: ${formData.nonSolicitDuration})`
          : "No"}
      </p>

      <p className="mt-4">
        <strong>4. Term and Duration:</strong> This Agreement shall remain in effect{" "}
        {formData.termDuration}.
      </p>

      <p className="mt-4">
        <strong>5. Witnesses:</strong>
        <br />
        Witness 1: {formData.witnessName || "__________"},{" "}
        {formData.witnessAddress || "__________"}
        <br />
        Witness 2: {formData.addWitnessName || "__________"},{" "}
        {formData.addWitnessAddress || "__________"}
      </p>

      <p className="mt-4">
        IN WITNESS WHEREOF, both parties acknowledge that they have read and understood
        this Agreement and agree to be bound by its terms.
      </p>

      <div className="mt-6">
        <p>_________________________</p>
        <p>(Disclosing Party Signature)</p>

        <p className="mt-6">_________________________</p>
        <p>(Receiving Party Signature)</p>
      </div>
    </div>
  );

  return (
    <div className="w-full mx-auto px-4 py-8 bg-transparent">
      <ToastContainer />
      <h1 className="text-center text-blue-600 text-3xl font-bold mb-12">
        Draft your Non-Disclosure Agreement
      </h1>

      {!showPreview ? (
        <form onSubmit={handleSubmit} className="space-y-8 w-full">
          <input type="checkbox" checked readOnly />
          <label className="ml-2">
            This agreement is made and entered into on {formData.dateOfDrafting}.
          </label>
          <br />
          <input type="checkbox" checked readOnly />
          <label className="ml-2">
            This agreement is between the disclosing party (client) and the receiving party (contractor).
          </label>

          <Info formData={formData} handleChange={handleChange} />
          <DisclosingParty formData={formData} handleChange={handleChange} />
          <ReceivingParty formData={formData} handleChange={handleChange} />
          <NonCompete formData={formData} handleChange={handleChange} />
          <TermDuration formData={formData} handleChange={handleChange} />
          <Witness formData={formData} handleChange={handleChange} />

          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-blue-800 transition"
          >
            Generate Preview
          </button>
        </form>
      ) : (
        <div className="text-center">
          {renderPreviewText()}
          <div className="mt-6 space-x-4">
            <button
              onClick={() => setShowPreview(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
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

export default NDA;
