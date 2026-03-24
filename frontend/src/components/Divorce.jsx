import React, { useState, useRef } from "react";
import PlaceOfVerification from "./divorce/PlaceOfVerification";
import Petitioner1Details from "./divorce/Petitioner1Details";
import Petitioner2Details from "./divorce/Petitioner2Details";
import Separation from "./divorce/Separation";
import MarriageDetails from "./divorce/MarriageDetails";
import ChildrenAndCustody from "./divorce/ChildrenAndCustody";
import FinancialAndProperty from "./divorce/FinancialAndProperty";
import AdditionalTerms from "./divorce/AdditionalTerms";
import Advocates from "./divorce/Advocates";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Divorce = ({ setSystemInstruction, sendToGemini }) => {
  const [formData, setFormData] = useState({
    dateOfVerification: new Date().toISOString().split("T")[0],
    verificationPlace: "",
    petitioner1Name: "",
    petitioner1Age: "",
    petitioner1Occupation: "",
    petitioner1Address: "",
    petitioner1MobileNo: "",
    petitioner1EmailID: "",
    petitioner1PreMaritalStatus: "",
    petitioner1Religion: "",
    petitioner1PermanentResidence: "",
    petitioner2Name: "",
    petitioner2MaidenName: "",
    petitioner2Age: "",
    petitioner2Occupation: "",
    petitioner2Address: "",
    petitioner2MobileNo: "",
    petitioner2EmailID: "",
    petitioner2PreMaritalStatus: "",
    petitioner2Religion: "",
    petitioner2PermanentResidence: "",
    reasonForSeparation: "Mutual Consent",
    separationDate: "",
    marriageDate: "",
    marriageLocation: "",
    marriageRites: "",
    marriageRegistrationDetails: "",
    childrenDetails: "",
    custodyAgreement: "",
    spousalSupportDetails: "",
    propertyDivision: "",
    exchangeOfArticles: "",
    pendingLitigations: "",
    withdrawalOfLitigations: "",
    additionalTerms: "",
    advocate1Name: "",
    advocate2Name: "",
    courtFeePaid: true,
  });

  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.info("Generating Divorce Agreement Preview...");
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

    pdf.save("Divorce_Petition.pdf");
  };

  const renderPreviewText = () => (
    <div ref={previewRef} className="bg-white p-8 rounded-lg shadow-lg text-black max-w-3xl mx-auto">
      <h2 className="text-center font-bold text-xl mb-2">
        MUTUAL DIVORCE PETITION
      </h2>
      <p className="text-sm mb-2 text-center">
        BEFORE THE DISTRICT JUDGE, HMA PETITION No._______ OF _______
      </p>
      <p className="mt-6 leading-relaxed">
        <strong>IN THE MATTER OF:</strong> <br />
        {formData.petitioner1Name} …Petitioner No.1 <br />
        (AND) <br />
        {formData.petitioner2Name} …Petitioner No.2 <br />
      </p>

      <p className="mt-4 leading-relaxed">
        PETITION UNDER SECTION 13 (1) (i-b) OF THE HMA FOR DISSOLUTION OF
        MARRIAGE BY MUTUAL CONSENT.
      </p>

      <p className="mt-4 leading-relaxed">
        1. That the marriage between the parties was solemnized on{" "}
        <strong>{formData.marriageDate || "__________"}</strong> at{" "}
        <strong>{formData.marriageLocation || "__________"}</strong> by{" "}
        <strong>{formData.marriageRites || "__________"}</strong> rites and
        ceremonies. The said marriage was consummated thereafter, and the
        parties cohabited as husband and wife at the matrimonial home i.e.{" "}
        <strong>{formData.petitioner1Address || "__________"}</strong>.
      </p>

      <p className="mt-4 leading-relaxed">
        2. That the parties have been living separately since{" "}
        <strong>{formData.separationDate || "__________"}</strong> due to{" "}
        <strong>{formData.reasonForSeparation}</strong>.
      </p>

      <p className="mt-4 leading-relaxed">
        3. That both the petitioners have mutually agreed to dissolve their
        marriage and have settled all their respective claims regarding
        maintenance, property, and custody of children.
      </p>

      {formData.childrenDetails && (
        <p className="mt-4 leading-relaxed">
          4. Details of children and custody arrangement:{" "}
          {formData.childrenDetails}. {formData.custodyAgreement}
        </p>
      )}

      <p className="mt-4 leading-relaxed">
        This agreement is made and verified on{" "}
        <strong>{formData.dateOfVerification}</strong> at{" "}
        <strong>{formData.verificationPlace || "__________"}</strong>.
      </p>

      <div className="mt-8">
        <p>
          <strong>Petitioner 1:</strong> {formData.petitioner1Name} <br />
          <strong>Petitioner 2:</strong> {formData.petitioner2Name}
        </p>
        <p className="mt-4">
          <strong>Advocate 1:</strong> {formData.advocate1Name || "__________"} <br />
          <strong>Advocate 2:</strong> {formData.advocate2Name || "__________"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full mx-auto px-4 py-8">
      <ToastContainer />
      <h1 className="text-center text-blue-600 text-3xl font-bold mb-12">
        Draft your Divorce Agreement
      </h1>

      {!showPreview ? (
        <form onSubmit={handleSubmit} className="space-y-8 w-full">
          <PlaceOfVerification formData={formData} handleChange={handleChange} />
          <Petitioner1Details formData={formData} handleChange={handleChange} />
          <Petitioner2Details formData={formData} handleChange={handleChange} />
          <Separation formData={formData} handleChange={handleChange} />
          <MarriageDetails formData={formData} handleChange={handleChange} />
          <ChildrenAndCustody formData={formData} handleChange={handleChange} />
          <FinancialAndProperty formData={formData} handleChange={handleChange} />
          <AdditionalTerms formData={formData} handleChange={handleChange} />
          <Advocates formData={formData} handleChange={handleChange} />

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

export default Divorce;
