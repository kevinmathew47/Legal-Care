import React, { useState, useRef } from "react";
import PropertyDetails from "./lease/PropertyDetails";
import LeaseDetails from "./lease/LeaseDetails";
import PartiesDetails from "./lease/PartiesDetails";
import UtilitiesAndMaintenance from "./lease/UtilitiesAndMaintenance";
import AdditionalTerms from "./lease/AdditionalTerms";
import Witness from "./lease/Witness";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Lease = ({ setSystemInstruction, sendToGemini }) => {
  const [formData, setFormData] = useState({
    dateOfAgreement: new Date().toISOString().split("T")[0],
    propertyAddress: "",
    propertyType: "",
    leaseStartDate: "",
    leaseEndDate: "",
    monthlyRent: "",
    rentDueDay: "",
    lateFeeGracePeriod: "",
    lateFeeAmount: "",
    additionalDailyLateFee: "",
    securityDepositAmount: "",
    landlordName: "",
    landlordAddress: "",
    tenantName: "",
    tenantAddress: "",
    landlordUtilitiesResponsibility: [],
    tenantUtilitiesResponsibility: [],
    arePetsAllowed: false,
    petRestrictions: "",
    alterationsAllowed: false,
    leaseDeedStart: "",
    leaseDeedSigning: "",
    additionalTerms: "",
    witnessName: "",
    witnessAddress: "",
    addWitnessName: "",
    addWitnessAddress: "",
    landlordSignature: "",
    tenantSignature: "",
  });

  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUtilitiesChange = (name, values) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: values,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    pdf.save("Lease_Agreement.pdf");
  };

  const renderPreviewText = () => (
    <div
      ref={previewRef}
      className="bg-white text-black p-8 rounded-lg shadow-lg max-w-3xl mx-auto leading-relaxed"
    >
      <h2 className="text-center font-bold text-2xl mb-4">
        LEASE AGREEMENT
      </h2>
      <p className="text-center mb-6 text-sm">
        (Sample Indian Legal Format)
      </p>

      <p>
        This Lease Agreement is made on{" "}
        <strong>{formData.dateOfAgreement}</strong> between{" "}
        <strong>{formData.landlordName || "__________"}</strong>, residing at{" "}
        <strong>{formData.landlordAddress || "__________"}</strong>, hereinafter
        referred to as the <strong>“LESSOR”</strong> (Landlord), and{" "}
        <strong>{formData.tenantName || "__________"}</strong>, residing at{" "}
        <strong>{formData.tenantAddress || "__________"}</strong>, hereinafter
        referred to as the <strong>“LESSEE”</strong> (Tenant).
      </p>

      <p className="mt-4">
        WHEREAS the Lessor is the lawful owner of the property situated at{" "}
        <strong>{formData.propertyAddress || "__________"}</strong> (
        {formData.propertyType || "Residential/Commercial"}) and has agreed to
        let out the said property to the Lessee for rent on the terms and
        conditions hereinafter contained.
      </p>

      <p className="mt-4">
        NOW THIS DEED WITNESSETH AS FOLLOWS:
      </p>

      <p className="mt-3">
        1. The tenancy shall commence on{" "}
        <strong>{formData.leaseStartDate || "__________"}</strong> and remain in
        force until{" "}
        <strong>{formData.leaseEndDate || "__________"}</strong>.
      </p>

      <p className="mt-3">
        2. The monthly rent shall be ₹{" "}
        <strong>{formData.monthlyRent || "__________"}</strong>, payable on or
        before the <strong>{formData.rentDueDay || "__________"}</strong> of
        each month.
      </p>

      <p className="mt-3">
        3. The Lessee shall pay a security deposit of ₹{" "}
        <strong>{formData.securityDepositAmount || "__________"}</strong>,
        refundable at the end of the lease term subject to conditions.
      </p>

      <p className="mt-3">
        4. In case of delay in payment of rent beyond{" "}
        <strong>{formData.lateFeeGracePeriod || "__________"}</strong> days, a
        late fee of ₹{" "}
        <strong>{formData.lateFeeAmount || "__________"}</strong> and an
        additional ₹{" "}
        <strong>{formData.additionalDailyLateFee || "__________"}</strong> per
        day thereafter shall apply.
      </p>

      <p className="mt-3">
        5. Utilities responsibility:
        <br />
        <strong>Landlord:</strong>{" "}
        {formData.landlordUtilitiesResponsibility.join(", ") || "__________"}
        <br />
        <strong>Tenant:</strong>{" "}
        {formData.tenantUtilitiesResponsibility.join(", ") || "__________"}
      </p>

      <p className="mt-3">
        6. Pets are{" "}
        {formData.arePetsAllowed ? (
          <strong>allowed</strong>
        ) : (
          <strong>not allowed</strong>
        )}
        . {formData.petRestrictions && (
          <>Restrictions: {formData.petRestrictions}</>
        )}
      </p>

      <p className="mt-3">
        7. Alterations to the premises are{" "}
        {formData.alterationsAllowed ? "allowed" : "not allowed"} without
        written consent of the Lessor.
      </p>

      {formData.additionalTerms && (
        <p className="mt-3">
          8. Additional Terms: {formData.additionalTerms}
        </p>
      )}

      <p className="mt-3">
        IN WITNESS WHEREOF, the parties have executed this Lease Agreement on{" "}
        <strong>{formData.dateOfAgreement}</strong> at{" "}
        <strong>{formData.leaseDeedSigning || "__________"}</strong>.
      </p>

      <div className="mt-6">
        <p>
          <strong>Landlord:</strong> {formData.landlordName || "__________"} <br />
          <strong>Tenant:</strong> {formData.tenantName || "__________"}
        </p>

        <div className="mt-4">
          <p>
            <strong>Witness 1:</strong> {formData.witnessName || "__________"},{" "}
            {formData.witnessAddress || "__________"}
          </p>
          <p>
            <strong>Witness 2:</strong> {formData.addWitnessName || "__________"},{" "}
            {formData.addWitnessAddress || "__________"}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full px-4 py-8">
      <h1 className="text-center text-blue-600 text-3xl font-bold mb-12">
        Draft Lease Agreement
      </h1>

      {!showPreview ? (
        <form onSubmit={handleSubmit} className="space-y-8 w-full">
          <PropertyDetails formData={formData} handleChange={handleChange} />
          <LeaseDetails formData={formData} handleChange={handleChange} />
          <PartiesDetails formData={formData} handleChange={handleChange} />
          <UtilitiesAndMaintenance
            formData={formData}
            handleChange={handleChange}
            handleUtilitiesChange={handleUtilitiesChange}
          />
          <AdditionalTerms formData={formData} handleChange={handleChange} />
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

export default Lease;
