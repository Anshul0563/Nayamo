jest.mock("../models/Review", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  aggregate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  calcAverageRating: jest.fn(),
}));

jest.mock("../models/Product", () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock("../config/cloudinary", () => ({
  uploader: {
    upload: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock("../config/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock("../services/notificationService", () => ({
  emitReviewNotification: jest.fn(() => Promise.resolve()),
}));

const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const { submitReview, deleteReview } = require("../controllers/reviewController");

const productId = new mongoose.Types.ObjectId().toString();

const invokeHandler = (handler, req) =>
  new Promise((resolve, reject) => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn((body) => resolve({ body, res })),
    };
    const next = jest.fn((error) => {
      if (error) return reject(error);
      return resolve({ res });
    });

    handler(req, res, next);
  });

const makeRequest = (files) => ({
  params: { productId },
  body: {
    rating: "5",
    title: "Beautiful piece",
    comment: "Exactly as described.",
  },
  user: { _id: new mongoose.Types.ObjectId() },
  ...(files ? { files } : {}),
});

const setupSubmission = () => {
  Product.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue({ _id: productId, title: "Necklace" }),
  });
  Review.findOne.mockResolvedValue(null);
  Review.aggregate.mockResolvedValue([{ avgRating: 5, count: 1 }]);
  Product.findByIdAndUpdate.mockResolvedValue({});
};

describe("review image uploads", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cloudinary.uploader.destroy.mockResolvedValue({ result: "ok" });
    setupSubmission();
  });

  it("uploads submitted review photos and stores their Cloudinary metadata", async () => {
    const files = [
      { mimetype: "image/png", buffer: Buffer.from("first") },
      { mimetype: "image/jpeg", buffer: Buffer.from("second") },
    ];
    cloudinary.uploader.upload
      .mockResolvedValueOnce({
        secure_url: "https://cdn.example/review-1.jpg",
        public_id: "nayamo-reviews/review-1",
      })
      .mockResolvedValueOnce({
        secure_url: "https://cdn.example/review-2.jpg",
        public_id: "nayamo-reviews/review-2",
      });

    const review = {
      _id: new mongoose.Types.ObjectId(),
      populate: jest.fn().mockResolvedValue(undefined),
    };
    Review.create.mockResolvedValue(review);

    await invokeHandler(submitReview, makeRequest(files));

    expect(cloudinary.uploader.upload).toHaveBeenCalledTimes(2);
    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^data:image\/png;base64,/),
      expect.objectContaining({ folder: "nayamo-reviews" }),
    );
    expect(Review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        images: [
          { url: "https://cdn.example/review-1.jpg", publicId: "nayamo-reviews/review-1" },
          { url: "https://cdn.example/review-2.jpg", publicId: "nayamo-reviews/review-2" },
        ],
      }),
    );
  });

  it("continues to accept a JSON-only review without calling Cloudinary", async () => {
    const review = {
      _id: new mongoose.Types.ObjectId(),
      populate: jest.fn().mockResolvedValue(undefined),
    };
    Review.create.mockResolvedValue(review);

    await invokeHandler(submitReview, makeRequest());

    expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
    expect(Review.create).toHaveBeenCalledWith(
      expect.objectContaining({ images: [] }),
    );
  });

  it("removes already-uploaded photos when review creation fails", async () => {
    const files = [
      { mimetype: "image/png", buffer: Buffer.from("first") },
      { mimetype: "image/jpeg", buffer: Buffer.from("second") },
    ];
    cloudinary.uploader.upload
      .mockResolvedValueOnce({
        secure_url: "https://cdn.example/review-1.jpg",
        public_id: "nayamo-reviews/review-1",
      })
      .mockResolvedValueOnce({
        secure_url: "https://cdn.example/review-2.jpg",
        public_id: "nayamo-reviews/review-2",
      });
    Review.create.mockRejectedValue(new Error("database unavailable"));

    await expect(invokeHandler(submitReview, makeRequest(files))).rejects.toThrow(
      "database unavailable",
    );

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("nayamo-reviews/review-1");
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("nayamo-reviews/review-2");
  });

  it("cleans up review photos when an admin deletes the review", async () => {
    Review.findByIdAndDelete.mockResolvedValue({
      product: productId,
      images: [
        { url: "https://cdn.example/review-1.jpg", publicId: "nayamo-reviews/review-1" },
      ],
    });
    Review.calcAverageRating.mockResolvedValue(undefined);

    await invokeHandler(deleteReview, { params: { id: productId } });

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("nayamo-reviews/review-1");
    expect(Review.calcAverageRating).toHaveBeenCalledWith(productId);
  });
});
