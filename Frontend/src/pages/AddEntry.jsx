import AddEntryForm from "../components/AddEntryForm";

export default function AddEntry({
  headingColor,
  subColor,
  addTransaction,
  setActive,
}) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: headingColor,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Add Entry
        </h1>
        <p style={{ fontSize: 13, color: subColor, margin: "5px 0 0" }}>
          Record an income or expense
        </p>
      </div>
      <AddEntryForm
        onAdd={(t) => {
          addTransaction(t);
          setActive("transactions");
        }}
      />
    </div>
  );
}
