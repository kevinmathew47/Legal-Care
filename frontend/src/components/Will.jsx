import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Will = ({ setSystemInstruction, sendToGemini }) => {
  const [formData, setFormData] = useState({
    dateOfDrafting: new Date().toISOString().split("T")[0],
    testatorName: "",
    testatorAddress: "",
    dateOfBirth: "",
    aadhaarNumber: "",
    maritalStatus: "single",
    spouseName: "",
    hasChildren: "no",
    children: [],
    parents: { father: "", mother: "" },
    hasSiblings: "no",
    siblings: [],
    executorName: "",
    executorAddress: "",
    alternateExecutorName: "",
    alternateExecutorAddress: "",
    beneficiaries: [{ name: "", relation: "", share: "" }],
    specificBequests: [{ item: "", recipient: "" }],
    debts: [{ institution: "", amount: "", instructions: "" }],
    guardianshipDetails: "",
    witnesses: [{ name: "", address: "" }],
    funeralPreferences: "",
    charitableDonations: [{ organization: "", amount: "" }],
  });

  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef();

  useEffect(() => {
    if (formData.hasChildren === "yes" && formData.children.length === 0) {
      addArrayItem("children", { name: "", dateOfBirth: "" });
    } else if (formData.hasChildren === "no" && formData.children.length > 0) {
      setFormData((prev) => ({ ...prev, children: [] }));
    }
  }, [formData.hasChildren]);

  useEffect(() => {
    if (formData.hasSiblings === "yes" && formData.siblings.length === 0) {
      addArrayItem("siblings", { name: "", relation: "" });
    } else if (formData.hasSiblings === "no" && formData.siblings.length > 0) {
      setFormData((prev) => ({ ...prev, siblings: [] }));
    }
  }, [formData.hasSiblings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "hasChildren" && value === "no") {
      setFormData((prev) => ({ ...prev, children: [] }));
    }
    if (name === "hasSiblings" && value === "no") {
      setFormData((prev) => ({ ...prev, siblings: [] }));
    }
  };

  const handleArrayChange = (category, index, field, value) => {
    const updatedArray = [...formData[category]];
    updatedArray[index][field] = value;
    setFormData({ ...formData, [category]: updatedArray });
  };

  const addArrayItem = (category, template) => {
    setFormData({
      ...formData,
      [category]: [...formData[category], template],
    });
  };

  const deleteArrayItem = (category, index) => {
    const updatedArray = formData[category].filter((_, i) => i !== index);
    setFormData({ ...formData, [category]: updatedArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.info("Generating Will Preview...");
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

    pdf.save(`Will_${formData.testatorName.replace(/\s+/g, '_')}_${formData.dateOfDrafting}.pdf`);
    toast.success("Will downloaded successfully!");
  };

  const renderPreviewText = () => (
    <div ref={previewRef} className="bg-white p-10 rounded-lg shadow-lg text-white max-w-4xl mx-auto">
      <h1 className="text-center font-bold text-2xl mb-6 uppercase">Last Will and Testament</h1>
      
      <div className="mb-8">
        <p className="leading-relaxed mb-2">
          This Last Will and Testament is executed on <strong>{formData.dateOfDrafting}</strong> by me, <strong>{formData.testatorName}</strong>, residing at <strong>{formData.testatorAddress}</strong>, born on <strong>{formData.dateOfBirth}</strong>, bearing Aadhaar Number <strong>{formData.aadhaarNumber}</strong>.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="font-bold text-lg mb-3 border-b-2 border-gray-300 pb-1">1. DECLARATION</h2>
        <p className="leading-relaxed">
          I, <strong>{formData.testatorName}</strong>, being of sound mind and disposing memory, do hereby make this my Last Will and Testament, revoking all previous wills and codicils made by me.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="font-bold text-lg mb-3 border-b-2 border-gray-300 pb-1">2. PERSONAL DETAILS</h2>
        <p className="leading-relaxed">
          <strong>Marital Status:</strong> {formData.maritalStatus.charAt(0).toUpperCase() + formData.maritalStatus.slice(1)}
          {formData.maritalStatus === "married" && formData.spouseName && (
            <><br /><strong>Spouse Name:</strong> {formData.spouseName}</>
          )}
        </p>
        <p className="leading-relaxed mt-2">
          <strong>Father's Name:</strong> {formData.parents.father || "Not specified"}<br />
          <strong>Mother's Name:</strong> {formData.parents.mother || "Not specified"}
        </p>
        {formData.hasChildren === "yes" && formData.children.length > 0 && (
          <div className="mt-2">
            <strong>Children:</strong>
            <ul className="list-disc ml-6">
              {formData.children.map((child, idx) => (
                <li key={idx}>{child.name} (DOB: {child.dateOfBirth})</li>
              ))}
            </ul>
          </div>
        )}
        {formData.hasSiblings === "yes" && formData.siblings.length > 0 && (
          <div className="mt-2">
            <strong>Siblings:</strong>
            <ul className="list-disc ml-6">
              {formData.siblings.map((sibling, idx) => (
                <li key={idx}>{sibling.name} ({sibling.relation})</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="font-bold text-lg mb-3 border-b-2 border-gray-300 pb-1">3. APPOINTMENT OF EXECUTOR</h2>
        <p className="leading-relaxed">
          I hereby appoint <strong>{formData.executorName}</strong>, residing at <strong>{formData.executorAddress}</strong>, as the Executor of this Will to administer my estate according to the terms herein.
        </p>
        {formData.alternateExecutorName && (
          <p className="leading-relaxed mt-2">
            In the event that the primary executor is unable or unwilling to serve, I appoint <strong>{formData.alternateExecutorName}</strong>, residing at <strong>{formData.alternateExecutorAddress}</strong>, as the Alternate Executor.
          </p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="font-bold text-lg mb-3 border-b-2 border-gray-300 pb-1">4. DISTRIBUTION OF ESTATE</h2>
        
        {formData.beneficiaries.length > 0 && formData.beneficiaries[0].name && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">A. Beneficiaries:</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Name</th>
                  <th className="border border-gray-300 p-2 text-left">Relation</th>
                  <th className="border border-gray-300 p-2 text-left">Share (%)</th>
                </tr>
              </thead>
              <tbody>
                {formData.beneficiaries.map((beneficiary, idx) => (
                  beneficiary.name && (
                    <tr key={idx}>
                      <td className="border border-gray-300 p-2">{beneficiary.name}</td>
                      <td className="border border-gray-300 p-2">{beneficiary.relation}</td>
                      <td className="border border-gray-300 p-2">{beneficiary.share}%</td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}

        {formData.specificBequests.length > 0 && formData.specificBequests[0].item && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">B. Specific Bequests:</h3>
            <ul className="list-disc ml-6">
              {formData.specificBequests.map((bequest, idx) => (
                bequest.item && (
                  <li key={idx}>
                    <strong>{bequest.item}</strong> to be given to <strong>{bequest.recipient}</strong>
                  </li>
                )
              ))}
            </ul>
          </div>
        )}
      </div>

      {formData.debts.length > 0 && formData.debts[0].institution && (
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-3 border-b-2 border-gray-300 pb-1">5. DEBTS AND LIABILITIES</h2>
          <p className="leading-relaxed mb-2">I direct my Executor to settle the following debts from my estate:</p>
          <ul className="list-disc ml-6">
            {formData.debts.map((debt, idx) => (
              debt.institution && (
                <li key={idx}>
                  <strong>{debt.institution}</strong> - Amount: ₹{debt.amount}
                  {debt.instructions && <> ({debt.instructions})</>}
                </li>
              )
            ))}
          </ul>
        </div>
      )}

      {formData.guardianshipDetails && (
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-3 border-b-2 border-gray-300 pb-1">6. GUARDIANSHIP</h2>
          <p className="leading-relaxed">{formData.guardianshipDetails}</p>
        </div>
      )}

      {formData.charitableDonations.length > 0 && formData.charitableDonations[0].organization && (
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-3 border-b-2 border-gray-300 pb-1">7. CHARITABLE DONATIONS</h2>
          <ul className="list-disc ml-6">
            {formData.charitableDonations.map((donation, idx) => (
              donation.organization && (
                <li key={idx}>
                  <strong>{donation.organization}</strong> - ₹{donation.amount}
                </li>
              )
            ))}
          </ul>
        </div>
      )}

      {formData.funeralPreferences && (
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-3 border-b-2 border-gray-300 pb-1">8. FUNERAL PREFERENCES</h2>
          <p className="leading-relaxed">{formData.funeralPreferences}</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="font-bold text-lg mb-3 border-b-2 border-gray-300 pb-1">9. ATTESTATION</h2>
        <p className="leading-relaxed mb-4">
          IN WITNESS WHEREOF, I have hereunto set my hand and seal on this <strong>{formData.dateOfDrafting}</strong>.
        </p>
        
        <div className="mb-8">
          <p className="mb-16">_______________________________</p>
          <p><strong>{formData.testatorName}</strong></p>
          <p>(Testator)</p>
        </div>

        <p className="leading-relaxed mb-4 font-semibold">
          Signed by the above-named Testator as their Last Will and Testament in the presence of us, present at the same time, who have hereunto subscribed our names as witnesses:
        </p>

        {formData.witnesses.map((witness, idx) => (
          witness.name && (
            <div key={idx} className="mb-6">
              <p className="mb-12">_______________________________</p>
              <p><strong>Witness {idx + 1}:</strong> {witness.name}</p>
              <p><strong>Address:</strong> {witness.address}</p>
            </div>
          )
        ))}
      </div>

      <div className="mt-8 pt-4 border-t-2 border-gray-300 text-sm text-gray-600">
        <p className="italic">
          Note: This is a sample will drafted based on the information provided. It is recommended to consult with a qualified legal professional to ensure compliance with all applicable laws and to address any specific circumstances.
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full mx-auto px-4 py-8">
      <ToastContainer />
      <h1 className="text-center text-blue-600 text-3xl font-bold mb-12">
        Draft Your Will
      </h1>

      {!showPreview ? (
        <>
          <div className="mb-8 p-4 bg-gray-50 rounded">
            <div className="flex items-center mb-2">
              <input type="checkbox" checked={true} readOnly className="mr-2" />
              <label className="text-sm text-gray-700">
                I declare that I am of sound mind and fully competent to make this will.
              </label>
            </div>
            <div className="flex items-center mb-2">
              <input type="checkbox" checked={true} readOnly className="mr-2" />
              <label className="text-sm text-gray-700">
                I declare that this document is my last will and testament, and it revokes all previous wills or codicils made by me.
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" checked={true} readOnly className="mr-2" />
              <label className="text-sm text-gray-700">
                {`This Will shall be dated ${new Date().toISOString().split("T")[0]} (YYYY/MM/DD).`}
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="mb-8">
              <h2 className="text-blue-600 text-xl font-medium mb-4">1. Testator Details</h2>
              <input
                type="text"
                name="testatorName"
                placeholder="Full Name"
                value={formData.testatorName}
                onChange={handleChange}
                required
                className="border p-2 rounded mb-4 w-full"
              />
              <input
                type="text"
                name="testatorAddress"
                placeholder="Address"
                value={formData.testatorAddress}
                onChange={handleChange}
                required
                className="border p-2 rounded mb-4 w-full"
              />
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="border p-2 rounded mb-4 w-full"
              />
              <input
                type="text"
                name="aadhaarNumber"
                placeholder="Aadhaar Number"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                required
                className="border p-2 rounded mb-4 w-full"
              />
            </div>

            <div className="mb-8">
              <h2 className="text-blue-600 text-xl font-medium mb-4">2. Marital Status</h2>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                required
                className="border p-2 rounded mb-4 w-full"
              >
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
              {formData.maritalStatus === "married" && (
                <input
                  type="text"
                  name="spouseName"
                  placeholder="Spouse's Name"
                  value={formData.spouseName}
                  onChange={handleChange}
                  className="border p-2 rounded mb-4 w-full"
                />
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-blue-600 text-xl font-medium mb-4">3. Children</h2>
              <select
                name="hasChildren"
                value={formData.hasChildren}
                onChange={handleChange}
                required
                className="border p-2 rounded mb-4 w-full"
              >
                <option value="no">No Children</option>
                <option value="yes">Has Children</option>
              </select>
              {formData.hasChildren === "yes" && (
                <>
                  {formData.children.map((child, index) => (
                    <div key={index} className="flex items-center gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Child's Name"
                        value={child.name}
                        onChange={(e) => handleArrayChange("children", index, "name", e.target.value)}
                        className="border p-2 rounded flex-1"
                        required
                      />
                      <input
                        type="date"
                        value={child.dateOfBirth}
                        onChange={(e) => handleArrayChange("children", index, "dateOfBirth", e.target.value)}
                        className="border p-2 rounded flex-1"
                        required
                      />
                      {formData.children.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteArrayItem("children", index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem("children", { name: "", dateOfBirth: "" })}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
                  >
                    Add Child
                  </button>
                </>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-blue-600 text-xl font-medium mb-4">4. Family Details</h2>
              <h3 className="font-medium mb-2 text-white">Parents</h3>
              <input
                type="text"
                placeholder="Father's Name"
                value={formData.parents.father}
                onChange={(e) => setFormData({ ...formData, parents: { ...formData.parents, father: e.target.value } })}
                className="border p-2 rounded mb-4 w-full"
                required
              />
              <input
                type="text"
                placeholder="Mother's Name"
                value={formData.parents.mother}
                onChange={(e) => setFormData({ ...formData, parents: { ...formData.parents, mother: e.target.value } })}
                className="border p-2 rounded mb-4 w-full"
                required
              />

              <h3 className="font-medium mb-2 text-white">Siblings</h3>
              <select
                name="hasSiblings"
                value={formData.hasSiblings}
                onChange={handleChange}
                required
                className="border p-2 rounded mb-4 w-full"
              >
                <option value="no">No Siblings</option>
                <option value="yes">Has Siblings</option>
              </select>
              {formData.hasSiblings === "yes" && (
                <>
                  {formData.siblings.map((sibling, index) => (
                    <div key={index} className="flex items-center gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Sibling's Name"
                        value={sibling.name}
                        onChange={(e) => handleArrayChange("siblings", index, "name", e.target.value)}
                        className="border p-2 rounded flex-1"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Relation"
                        value={sibling.relation}
                        onChange={(e) => handleArrayChange("siblings", index, "relation", e.target.value)}
                        className="border p-2 rounded flex-1"
                        required
                      />
                      {formData.siblings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteArrayItem("siblings", index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem("siblings", { name: "", relation: "" })}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
                  >
                    Add Sibling
                  </button>
                </>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-blue-600 text-xl font-medium mb-4">5. Executor Details</h2>
              <div className="mb-4">
                <h3 className="font-medium mb-2 text-white">Primary Executor</h3>
                <input
                  type="text"
                  name="executorName"
                  placeholder="Executor's Name"
                  value={formData.executorName}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded mb-4 w-full"
                />
                <input
                  type="text"
                  name="executorAddress"
                  placeholder="Executor's Address"
                  value={formData.executorAddress}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded mb-4 w-full"
                />
              </div>

              <div>
                <h3 className="font-medium mb-2 text-white  ">Alternate Executor</h3>
                <input
                  type="text"
                  name="alternateExecutorName"
                  placeholder="Alternate Executor's Name"
                  value={formData.alternateExecutorName}
                  onChange={handleChange}
                  className="border p-2 rounded mb-4 w-full"
                />
                <input
                  type="text"
                  name="alternateExecutorAddress"
                  placeholder="Alternate Executor's Address"
                  value={formData.alternateExecutorAddress}
                  onChange={handleChange}
                  className="border p-2 rounded mb-4 w-full"
                />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-blue-600 text-xl font-medium mb-4">6. Beneficiaries and Bequests</h2>
              <h3 className="font-medium mb-2 text-white">Beneficiaries</h3>
              {formData.beneficiaries.map((beneficiary, index) => (
                <div key={index} className="flex items-center gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Beneficiary Name"
                    value={beneficiary.name}
                    onChange={(e) => handleArrayChange("beneficiaries", index, "name", e.target.value)}
                    className="border p-2 rounded flex-1"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Relation"
                    value={beneficiary.relation}
                    onChange={(e) => handleArrayChange("beneficiaries", index, "relation", e.target.value)}
                    className="border p-2 rounded flex-1"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Share (%)"
                    value={beneficiary.share}
                    onChange={(e) => handleArrayChange("beneficiaries", index, "share", e.target.value)}
                    className="border p-2 rounded w-24"
                    required
                  />
                  {formData.beneficiaries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteArrayItem("beneficiaries", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("beneficiaries", { name: "", relation: "", share: "" })}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 transition mb-4"
              >
                Add Beneficiary
              </button>

              <h3 className="font-medium mb-2 text-white">Specific Bequests</h3>
              {formData.specificBequests.map((bequest, index) => (
                <div key={index} className="flex items-center gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Item"
                    value={bequest.item}
                    onChange={(e) => handleArrayChange("specificBequests", index, "item", e.target.value)}
                    className="border p-2 rounded flex-1"
                  />
                  <input
                    type="text"
                    placeholder="Recipient"
                    value={bequest.recipient}
                    onChange={(e) => handleArrayChange("specificBequests", index, "recipient", e.target.value)}
                    className="border p-2 rounded flex-1"
                  />
                  {formData.specificBequests.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteArrayItem("specificBequests", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("specificBequests", { item: "", recipient: "" })}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
              >
                Add Specific Bequest
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-blue-600 text-xl font-medium mb-4">7. Debts</h2>
              {formData.debts.map((debt, index) => (
                <div key={index} className="flex items-center gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Institution"
                    value={debt.institution}
                    onChange={(e) => handleArrayChange("debts", index, "institution", e.target.value)}
                    className="border p-2 rounded flex-1"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={debt.amount}
                    onChange={(e) => handleArrayChange("debts", index, "amount", e.target.value)}
                    className="border p-2 rounded flex-1"
                  />
                  <input
                    type="text"
                    placeholder="Instructions"
                    value={debt.instructions}
                    onChange={(e) => handleArrayChange("debts", index, "instructions", e.target.value)}
                    className="border p-2 rounded flex-1"
                  />
                  {formData.debts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteArrayItem("debts", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("debts", { institution: "", amount: "", instructions: "" })}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
              >
                Add Debt
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-blue-600 text-xl font-medium mb-4">8. Guardianship</h2>
              <textarea
                name="guardianshipDetails"
                placeholder="Specify guardianship arrangements for minor children or dependents"
                value={formData.guardianshipDetails}
                onChange={handleChange}
                className="border p-2 rounded w-full h-32"
              />
            </div>

            <div className="mb-8">
              <h2 className="text-blue-600 text-xl font-medium mb-4">9. Witnesses</h2>
              {formData.witnesses.map((witness, index) => (
                <div key={index} className="flex items-center gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Witness Name"
                    value={witness.name}
                    onChange={(e) => handleArrayChange("witnesses", index, "name", e.target.value)}
                    className="border p-2 rounded flex-1"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={witness.address}
                    onChange={(e) => handleArrayChange("witnesses", index, "address", e.target.value)}
                    className="border p-2 rounded flex-1"
                    required
                  />
                  {formData.witnesses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteArrayItem("witnesses", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("witnesses", { name: "", address: "" })}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
              >
                Add Witness
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-blue-600 text-xl font-medium mb-4">10. Other Instructions</h2>

              <h3 className="font-medium mb-2 text-white">Funeral Preferences</h3>
              <textarea
                name="funeralPreferences"
                placeholder="Specify any funeral or memorial service preferences"
                value={formData.funeralPreferences}
                onChange={handleChange}
                className="border p-2 rounded w-full h-32 mb-4"
              />

              <h3 className="font-medium mb-2 text-white">Charitable Donations</h3>
              {formData.charitableDonations.map((donation, index) => (
                <div key={index} className="flex items-center gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Organization Name"
                    value={donation.organization}
                    onChange={(e) => handleArrayChange("charitableDonations", index, "organization", e.target.value)}
                    className="border p-2 rounded flex-1"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={donation.amount}
                    onChange={(e) => handleArrayChange("charitableDonations", index, "amount", e.target.value)}
                    className="border p-2 rounded w-32"
                  />
                  {formData.charitableDonations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteArrayItem("charitableDonations", index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem("charitableDonations", { organization: "", amount: "" })}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
              >
                Add Charitable Donation
              </button>
            </div>

            <div className="mt-12 text-center">
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-800 transition"
              >
                Generate Will Preview
              </button>
            </div>
          </form>
        </>
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

export default Will;