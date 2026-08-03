const Settings = require("../models/Settings");

describe("Settings model", () => {
  it("does not allow an indeterminate COD availability value", async () => {
    const settings = new Settings({ codEnabled: null });

    await expect(settings.validate()).rejects.toMatchObject({
      name: "ValidationError",
    });
  });
});
