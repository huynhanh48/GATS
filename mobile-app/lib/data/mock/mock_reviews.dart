enum ReviewSentiment { excellent, good, average, belowAverage }

class MockReview {
  const MockReview({
    required this.id,
    required this.authorName,
    required this.body,
    required this.rating,
    required this.likes,
    required this.timeAgo,
    required this.sentiment,
  });

  final String id;
  final String authorName;
  final String body;
  final double rating;
  final int likes;
  final String timeAgo;
  final ReviewSentiment sentiment;
}

abstract final class MockReviews {
  static const filterLabels = ['Tuyệt vời', 'Tốt', 'Trung bình', 'Cần cải thiện'];

  static const all = [
    MockReview(
      id: 'r1',
      authorName: 'Minh T.',
      body: 'Lộ trình AI rõ ràng, học xong áp dụng được ngay vào công việc văn phòng.',
      rating: 4.9,
      likes: 760,
      timeAgo: '2 tuần trước',
      sentiment: ReviewSentiment.excellent,
    ),
    MockReview(
      id: 'r2',
      authorName: 'Lan P.',
      body: 'Flashcard và quiz giúp mình nhớ prompt nhanh hơn. AI Coach gợi ý bài học rất hợp.',
      rating: 4.7,
      likes: 412,
      timeAgo: '1 tháng trước',
      sentiment: ReviewSentiment.excellent,
    ),
    MockReview(
      id: 'r3',
      authorName: 'Hoàng N.',
      body: 'Khóa Prompt Engineering dễ theo, mentor phản hồi nhanh trong nhóm chat.',
      rating: 4.5,
      likes: 289,
      timeAgo: '3 tuần trước',
      sentiment: ReviewSentiment.good,
    ),
    MockReview(
      id: 'r4',
      authorName: 'Thu H.',
      body: 'App ổn, mong thêm nhiều bài thực hành Excel + AI hơn nữa.',
      rating: 4.2,
      likes: 156,
      timeAgo: '1 tuần trước',
      sentiment: ReviewSentiment.average,
    ),
  ];

  static List<MockReview> filtered(int filterIndex) {
    if (filterIndex <= 0) {
      return all.where((r) => r.sentiment == ReviewSentiment.excellent).toList();
    }
    if (filterIndex == 1) {
      return all.where((r) => r.sentiment == ReviewSentiment.good).toList();
    }
    if (filterIndex == 2) {
      return all.where((r) => r.sentiment == ReviewSentiment.average).toList();
    }
    return all.where((r) => r.sentiment == ReviewSentiment.belowAverage).toList();
  }
}
