import Array "mo:base/Array";
import Int "mo:base/Int";
import Random "mo:base/Random";

actor FlappyBird {
  type LeaderboardEntry = {
    name : Text;
    score : Nat;
  };

  private var leaderboard : [LeaderboardEntry] = [];

  public query func isHighScore(score : Nat) : async Bool {
    if (leaderboard.size() < 10) {
      return true;
    };
    return score > leaderboard[leaderboard.size() - 1].score;
  };

  public func addLeaderboardEntry(name : Text, score : Nat) : async [LeaderboardEntry] {
    let newEntry : LeaderboardEntry = { name = name; score = score };

    // Add the new entry and sort the leaderboard
    leaderboard := Array.sort<LeaderboardEntry>(
      Array.append<LeaderboardEntry>(leaderboard, [newEntry]),
      func(a : LeaderboardEntry, b : LeaderboardEntry) {
        Int.compare(b.score, a.score);
      },
    );

    // Keep only the top 10 scores
    if (leaderboard.size() > 10) {
      leaderboard := Array.subArray(leaderboard, 0, 10);
    };

    return leaderboard;
  };

  public query func getLeaderboard() : async [LeaderboardEntry] {
    return leaderboard;
  };

  public func getRandomness() : async Blob {
    await Random.blob();
  };
};
