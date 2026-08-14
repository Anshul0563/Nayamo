import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import DataTable from "./DataTable";

describe("DataTable selection behavior", () => {
  const columns = [{ key: "_id", label: "Order ID" }];
  const rows = [
    { _id: "order-1001", customer: "Alice" },
    { _id: "order-1002", customer: "Bob" },
    { _id: "order-1003", customer: "Charlie" },
  ];

  const SelectionHarness = () => {
    const [selected, setSelected] = useState(["order-1001"]);

    const toggleSelection = (id) => {
      if (id === "__SELECT_ALL__") {
        const visibleIds = rows.map((row) => row._id);
        const allSelected =
          visibleIds.length > 0 &&
          visibleIds.every((rowId) => selected.includes(rowId));

        if (allSelected) {
          setSelected((prev) =>
            prev.filter((rowId) => !visibleIds.includes(rowId)),
          );
          return;
        }

        setSelected((prev) => {
          const merged = new Set(prev);
          visibleIds.forEach((rowId) => merged.add(rowId));
          return [...merged];
        });
        return;
      }

      setSelected((prev) =>
        prev.includes(id)
          ? prev.filter((rowId) => rowId !== id)
          : [...prev, id],
      );
    };

    return (
      <DataTable
        columns={columns}
        data={rows}
        loadMore={() => {}}
        hasMore={false}
        loading={false}
        total={rows.length}
        enableSelection
        selected={selected}
        onSelect={toggleSelection}
      />
    );
  };

  it("selects individual rows by ID, supports header select-all, and reflects partial selection", () => {
    render(<SelectionHarness />);

    const checkboxes = screen.getAllByRole("checkbox");
    const headerCheckbox = checkboxes[0];
    const row1001 = checkboxes[1];
    const row1002 = checkboxes[2];
    const row1003 = checkboxes[3];

    expect(row1001).toBeChecked();
    expect(row1002).not.toBeChecked();
    expect(row1003).not.toBeChecked();
    expect(headerCheckbox.indeterminate).toBe(true);

    fireEvent.click(row1002);
    expect(row1001).toBeChecked();
    expect(row1002).toBeChecked();
    expect(row1003).not.toBeChecked();

    fireEvent.click(headerCheckbox);
    expect(row1001).toBeChecked();
    expect(row1002).toBeChecked();
    expect(row1003).toBeChecked();

    fireEvent.click(headerCheckbox);
    expect(row1001).not.toBeChecked();
    expect(row1002).not.toBeChecked();
    expect(row1003).not.toBeChecked();
  });
});
