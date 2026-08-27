import React, { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, Flag, User } from "lucide-react";
import { toast } from "react-hot-toast";

const ReviewSystem = ({ itemId, itemType, reviews = [], onSubmitReview }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: "",
    content: "",
    visitDate: "",
    recommend: true,
  });

  const handleStarClick = (rating) => {
    setNewReview({ ...newReview, rating });
  };

  const submitReview = async (e) => {
    e.preventDefault();

    if (newReview.rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (newReview.content.length < 10) {
      toast.error("Review must be at least 10 characters long");
      return;
    }

    const reviewData = {
      ...newReview,
      id: Date.now(),
      itemId,
      itemType,
      author: "Anonymous User", // Replace with actual user data
      date: new Date().toISOString(),
      helpful: 0,
    };

    onSubmitReview && onSubmitReview(reviewData);

    // Reset form
    setNewReview({
      rating: 0,
      title: "",
      content: "",
      visitDate: "",
      recommend: true,
    });
    setShowReviewForm(false);
    toast.success("Review submitted successfully!");
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((review) => review.rating === rating).length;
    return {
      rating,
      count,
      percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0,
    };
  });

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-heritage font-bold text-gray-900">
            Reviews & Ratings
          </h3>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="btn-heritage px-6 py-3"
          >
            Write Review
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>

            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={24}
                  className={`${
                    star <= averageRating
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>

            <p className="text-gray-600">
              Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star size={16} className="text-yellow-400 fill-current" />
                </div>

                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h4 className="text-xl font-semibold mb-6">Write Your Review</h4>

          <form onSubmit={submitReview} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating *
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      size={32}
                      className={`${
                        star <= newReview.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 hover:text-yellow-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="form-label">Review Title</label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) =>
                  setNewReview({ ...newReview, title: e.target.value })
                }
                className="form-input"
                placeholder="Summarize your experience..."
              />
            </div>

            {/* Content */}
            <div>
              <label className="form-label">Your Review *</label>
              <textarea
                value={newReview.content}
                onChange={(e) =>
                  setNewReview({ ...newReview, content: e.target.value })
                }
                className="form-input"
                rows="4"
                placeholder="Share your experience, tips for other visitors..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {newReview.content.length}/500 characters
              </p>
            </div>

            {/* Visit Date */}
            <div>
              <label className="form-label">When did you visit?</label>
              <input
                type="month"
                value={newReview.visitDate}
                onChange={(e) =>
                  setNewReview({ ...newReview, visitDate: e.target.value })
                }
                className="form-input"
              />
            </div>

            {/* Recommendation */}
            <div>
              <label className="form-label">
                Would you recommend this to others?
              </label>
              <div className="flex space-x-4 mt-2">
                <button
                  type="button"
                  onClick={() =>
                    setNewReview({ ...newReview, recommend: true })
                  }
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    newReview.recommend
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-300 text-gray-600 hover:border-green-500"
                  }`}
                >
                  <ThumbsUp size={18} />
                  <span>Yes</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setNewReview({ ...newReview, recommend: false })
                  }
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    !newReview.recommend
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-300 text-gray-600 hover:border-red-500"
                  }`}
                >
                  <ThumbsDown size={18} />
                  <span>No</span>
                </button>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <button type="submit" className="btn-heritage px-8 py-3">
                Submit Review
              </button>

              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User size={20} className="text-gray-600" />
                </div>

                <div>
                  <div className="font-semibold text-gray-900">
                    {review.author}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={`${
                      star <= review.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {review.title && (
              <h5 className="font-semibold text-gray-900 mb-2">
                {review.title}
              </h5>
            )}

            <p className="text-gray-700 mb-4 leading-relaxed">
              {review.content}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                {review.visitDate && (
                  <span>
                    Visited: {new Date(review.visitDate).toLocaleDateString()}
                  </span>
                )}

                {review.recommend && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <ThumbsUp size={14} />
                    <span>Recommends</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button className="hover:text-gray-700 transition-colors">
                  Helpful ({review.helpful || 0})
                </button>

                <button className="hover:text-red-600 transition-colors">
                  <Flag size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <User size={48} className="mx-auto mb-4 opacity-50" />
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSystem;
