"use client";
export default function TaxPage() {
  const sampleTaxData = {
    name: "John Doe",
    pan: "ABCDE1234F",
    assessmentYear: "2025-2026",
    totalIncome: "850000",
    taxPaid: "72000",
  };

  return (
    <main
      style={{
        padding: "40px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ marginBottom: "30px" }}>
        Tax Document Helper
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        {/* LEFT SIDE */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h2>Tax Document Preview</h2>

          <pre
            style={{
              marginTop: "20px",
              lineHeight: "1.8",
            }}
          >
{`Name: John Doe
PAN: ABCDE1234F
Assessment Year: 2025-2026
Total Income: 850000
Tax Paid: 72000`}
          </pre>
        </div>

        {/* RIGHT SIDE */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h2>Extracted Values</h2>

          {Object.entries(sampleTaxData).map(([key, value]) => (
            <div
              key={key}
              style={{
                marginTop: "20px",
              }}
            >
              <div
                style={{
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                {key}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                <input
                  value={value}
                  readOnly
                  style={{
                    flex: 1,
                    padding: "10px",
                  }}
                />

                <button
                  onClick={() =>
                    navigator.clipboard.writeText(value)
                  }
                  style={{
                    padding: "10px 15px",
                    cursor: "pointer",
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}