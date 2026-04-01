"use client";

type Option = { id: string; name: string; count: number };

export default function AdminStoreFilterSelect({
  query,
  selectValue,
  options,
}: {
  query: string;
  selectValue: string;
  options: Option[];
}) {
  return (
    <form action="/admin/products" method="get" style={{ display: "inline" }}>
      <input type="hidden" name="q" value={query} />
      <select
        key={`${query}-${selectValue}`}
        name="store"
        defaultValue={selectValue}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        aria-label="Filtrer par magasin (autres)"
        style={{
          padding: "10px 16px",
          borderRadius: "10px",
          border: "1px solid #e5e7eb",
          background: "white",
          fontSize: "14px",
          fontWeight: 500,
          color: "#6b7280",
          cursor: "pointer",
        }}
      >
        <option value="all">Autres magasins...</option>
        {options.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name} ({store.count})
          </option>
        ))}
      </select>
    </form>
  );
}
