const mongoose = require("mongoose");
const Review = require("../models/Review");

const createReview = (overrides = {}) =>
  new Review({
    user: new mongoose.Types.ObjectId(),
    product: new mongoose.Types.ObjectId(),
    rating: 5,
    comment: "Exactly as described.",
    ...overrides,
  });

describe("Review image schema", () => {
  it("defaults to no images so existing JSON-only reviews remain valid", async () => {
    const review = createReview();

    await expect(review.validate()).resolves.toBeUndefined();
    expect(review.images).toHaveLength(0);
  });

  it("limits a review to three uploaded images", async () => {
    const image = (index) => ({
      url: `https://res.cloudinary.com/demo/image/upload/review-${index}.jpg`,
      publicId: `nayamo-reviews/review-${index}`,
    });
    const review = createReview({ images: [image(1), image(2), image(3), image(4)] });

    await expect(review.validate()).rejects.toMatchObject({
      name: "ValidationError",
      errors: {
        images: expect.objectContaining({ message: "A review can have at most 3 images" }),
      },
    });
  });
});
