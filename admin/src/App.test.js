import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the admin login screen", () => {
  window.history.pushState({}, "", "/login");
  render(<App />);
  expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
});
