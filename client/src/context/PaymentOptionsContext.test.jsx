import { act, render, screen } from "@testing-library/react";
import {
  PaymentOptionsProvider,
  usePaymentOptions,
} from "./PaymentOptionsContext";
import { settingsAPI } from "../services/api";

jest.mock("../services/api", () => ({
  settingsAPI: {
    getPaymentOptions: jest.fn(),
  },
}));

function PaymentOptionsStatus() {
  const { codEnabled, loading } = usePaymentOptions();

  return <span>{loading ? "loading" : String(codEnabled)}</span>;
}

describe("PaymentOptionsProvider", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("refreshes a live storefront when COD is disabled by an admin", async () => {
    settingsAPI.getPaymentOptions
      .mockResolvedValueOnce({ data: { data: { codEnabled: true } } })
      .mockResolvedValueOnce({ data: { data: { codEnabled: false } } });

    render(
      <PaymentOptionsProvider>
        <PaymentOptionsStatus />
      </PaymentOptionsProvider>,
    );

    expect(await screen.findByText("true")).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(30_000);
    });

    expect(await screen.findByText("false")).toBeInTheDocument();
  });
});
