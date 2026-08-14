import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import DataTable from "./DataTable";

function SelectionHarness({ initialRows = [] }) {
  const [selected, setSelected] = useState([]);

  const toggleOrderSelection = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAllVisibleOrders = (visibleIds = []) => {
    if (!visibleIds.length) return;

    setSelected((prev) => {
      const selectedSet = new Set(prev);
      const allSelected = visibleIds.every((id) => selectedSet.has(id));

      if (allSelected) {
        visibleIds.forEach((id) => selectedSet.delete(id));
      } else {
        visibleIds.forEach((id) => selectedSet.add(id));
      }

      return Array.from(selectedSet);
    });
  };

  return (
    <DataTable
      columns={[
        { key: "_id", label: "Order ID" },
        { key: "name", label: "Name" },
      ]}
      data={initialRows}
      loading={false}
      total={initialRows.length}
      hasMore={false}
      enableSelection
      selected={selected}
      onSelectAll={toggleSelectAllVisibleOrders}
      onSelectRow={toggleOrderSelection}
    />
  );
}

describe("DataTable selection behavior", () => {
  const rows = [
    { _id: "orderId1", name: "Order 1" },
    { _id: "orderId2", name: "Order 2" },
    { _id: "orderId3", name: "Order 3" },
    { _id: "orderId4", name: "Order 4" },
  ];

  test("header select-all selects all visible rows and deselects them on second click", () => {
    render(<SelectionHarness initialRows={rows} />);

    const headerCheckbox = screen.getAllByRole("checkbox")[0];
    const rowCheckboxes = screen.getAllByRole("checkbox").slice(1);

    fireEvent.click(headerCheckbox);

    rowCheckboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });
    expect(headerCheckbox).toBeChecked();

    fireEvent.click(headerCheckbox);

    rowCheckboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });
    expect(headerCheckbox).not.toBeChecked();
  });

  test("partial selection sets indeterminate state and header click selects all visible rows", () => {
    render(<SelectionHarness initialRows={rows} />);

    const headerCheckbox = screen.getAllByRole("checkbox")[0];
    const order2Checkbox = screen.getAllByRole("checkbox")[2];

    fireEvent.click(order2Checkbox);

    expect(headerCheckbox).not.toBeChecked();
    expect(headerCheckbox.indeterminate).toBe(true);

    fireEvent.click(headerCheckbox);

    const allCheckboxes = screen.getAllByRole("checkbox").slice(1);
    allCheckboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });
    expect(headerCheckbox).toBeChecked();
  });
});
