/**
 * ServerFacade integration test.
 * Exercises ServerFacade → ClientCommunicator → backend routes → DAOs.
 *
 * Prerequisites:
 * - Backend running: npm run dev:server (from repo root)
 * - MongoDB running and connected
 *
 * Run from repo root:
 *   npm run test:facade
 * Or from apps/mobile:
 *   npx tsx testing.ts
 *
 * Optional: set EXPO_PUBLIC_API_BASE_URL (default: http://localhost:4000)
 */
process.env.EXPO_PUBLIC_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

async function main() {
  console.log("Using API base:", API_BASE);

  // Pre-check: server must be running before we hit ServerFacade
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check returned ${res.status}`);
    const data = await res.json();
    if (data?.ok !== true) throw new Error("Health check did not return ok: true");
    console.log("Server is reachable.\n");
  } catch (err: unknown) {
    const cause = err && typeof err === "object" && "cause" in err ? (err as { cause?: { code?: string } }).cause : null;
    if (cause && typeof cause === "object" && cause.code === "ECONNREFUSED") {
      console.error("Cannot reach the server at", API_BASE);
      console.error("");
      console.error("Start the server in a separate terminal first:");
      console.error("  cd " + process.cwd().replace(/\\/g, "/"));
      console.error("  npm run dev:server");
      console.error("");
      console.error("Wait until you see 'API listening on http://localhost:4000',");
      console.error("then run this test again in this terminal.");
    } else {
      console.error("Server health check failed:", err);
    }
    process.exit(1);
  }

  const { ServerFacade } = await import("./network/ServerFacade");

  const ts = Date.now();
  const handle = `test-${ts}`;
  const friendHandle = `test-friend-${ts}`;

  const log = (label: string, data: unknown) => {
    console.log("\n--- " + label + " ---");
    console.log(JSON.stringify(data, null, 2));
  };

  try {
    // ── Profiles ──
    console.log("\n========== PROFILES ==========");

    const createdProfile = await ServerFacade.createProfile({
      name: "Test User",
      profileHandle: handle
    });
    log("Create profile (result)", createdProfile);

    const gotProfile = await ServerFacade.getProfile(handle);
    log("Get profile (result)", gotProfile);

    const updatedProfile = await ServerFacade.updateProfile(handle, {
      name: "Test User Updated"
    });
    log("Update profile (result)", updatedProfile);

    const profileAfterUpdate = await ServerFacade.getProfile(handle);
    log("Get profile after update", profileAfterUpdate);

    const allProfiles = await ServerFacade.listProfiles(5);
    log("List profiles (first 5, count)", {
      count: allProfiles.length,
      handles: allProfiles.map((p) => p.profileHandle)
    });

    // Second profile for friend tests
    await ServerFacade.createProfile({
      name: "Test Friend",
      profileHandle: friendHandle
    });
    log("Create friend profile", { handle: friendHandle });

    await ServerFacade.setFavoriteArtists(handle, [
      { name: "Artist A" },
      { name: "Artist B" },
      { name: "Artist C" }
    ]);
    await ServerFacade.setFavoriteSongs(handle, [
      { title: "Song 1" },
      { title: "Song 2" },
      { title: "Song 3" }
    ]);
    const afterFavorites = await ServerFacade.getProfile(handle);
    log("After setFavoriteArtists + setFavoriteSongs", {
      favoriteArtists: afterFavorites?.favoriteArtists,
      favoriteSongs: afterFavorites?.favoriteSongs
    });

    // Change favorites (update to new values, then re-get to confirm)
    await ServerFacade.setFavoriteArtists(handle, [
      { name: "Artist X" },
      { name: "Artist Y" },
      { name: "Artist Z" }
    ]);
    await ServerFacade.setFavoriteSongs(handle, [
      { title: "Song A" },
      { title: "Song B" },
      { title: "Song C" }
    ]);
    const afterFavoritesChange = await ServerFacade.getProfile(handle);
    log("After changing favoriteArtists/favoriteSongs (new values)", {
      favoriteArtists: afterFavoritesChange?.favoriteArtists,
      favoriteSongs: afterFavoritesChange?.favoriteSongs
    });

    // Friends: send request → accept → unfriend, print before/after each
    const beforeFriend = await ServerFacade.getProfile(handle);
    log("Friends before request", {
      friends: beforeFriend?.friends ?? [],
      sent: beforeFriend?.friendRequestsSent ?? [],
      incoming: beforeFriend?.friendRequestsReceived ?? []
    });

    await ServerFacade.sendFriendRequest(handle, friendHandle);

    const afterSentMe = await ServerFacade.getProfile(handle);
    log("After sendFriendRequest (me)", {
      friends: afterSentMe?.friends ?? [],
      sent: afterSentMe?.friendRequestsSent ?? [],
      incoming: afterSentMe?.friendRequestsReceived ?? []
    });

    const afterSentThem = await ServerFacade.getProfile(friendHandle);
    log("After sendFriendRequest (them)", {
      friends: afterSentThem?.friends ?? [],
      sent: afterSentThem?.friendRequestsSent ?? [],
      incoming: afterSentThem?.friendRequestsReceived ?? []
    });

    console.log("  -> Pending should show in my sent and their incoming.");

    const afterAcceptMe = await ServerFacade.acceptFriendRequest(friendHandle, handle);
    log("After acceptFriendRequest (me result payload)", afterAcceptMe);

    const meAfterAccept = await ServerFacade.getProfile(handle);
    const themAfterAccept = await ServerFacade.getProfile(friendHandle);
    log("After accept (me)", {
      friends: meAfterAccept?.friends ?? [],
      sent: meAfterAccept?.friendRequestsSent ?? [],
      incoming: meAfterAccept?.friendRequestsReceived ?? []
    });
    log("After accept (them)", {
      friends: themAfterAccept?.friends ?? [],
      sent: themAfterAccept?.friendRequestsSent ?? [],
      incoming: themAfterAccept?.friendRequestsReceived ?? []
    });

    console.log("  -> Both users should list each other as friends.");

    await ServerFacade.removeFriend(handle, friendHandle);

    const meAfterUnfriend = await ServerFacade.getProfile(handle);
    const themAfterUnfriend = await ServerFacade.getProfile(friendHandle);
    log("After unfriend (me)", meAfterUnfriend?.friends ?? []);
    log("After unfriend (them)", themAfterUnfriend?.friends ?? []);
    console.log("  -> Both friends arrays should no longer include each other.");

    // loadProfileWithSuggestions
    const withSuggestions = await ServerFacade.loadProfileWithSuggestions(handle);
    log("loadProfileWithSuggestions", {
      profileHandle: withSuggestions?.profile.profileHandle,
      friendsCount: withSuggestions?.friends.length,
      suggestionsCount: withSuggestions?.suggestions.length
    });

    // ── Posts ──
    console.log("\n========== POSTS ==========");

    const viewerSpotifyUserId = "spotify-test-user";

    const createdPost = await ServerFacade.createPost({
      authorHandle: handle,
      authorSpotifyUserId: viewerSpotifyUserId,
      title: "Test Song",
      artist: "Test Artist",
      album: "Test Album",
      caption: "Test caption"
    });
    log("Create post (result)", createdPost);

    const feed = await ServerFacade.getFeed(viewerSpotifyUserId);
    const ourPost = feed.find((p) => p.id === createdPost.id);
    log("Get feed (find our post)", ourPost ?? "not found");
    const likesInitial = ourPost?.likes ?? 0;
    console.log("  -> Likes count before any like/unlike:", likesInitial);

    await ServerFacade.likePost(createdPost.id, viewerSpotifyUserId);
    const feedAfterLike = await ServerFacade.getFeed(viewerSpotifyUserId);
    const postAfterLike = feedAfterLike.find((p) => p.id === createdPost.id);
    const likesAfterLike = postAfterLike?.likes ?? 0;
    log("After likePost (increase)", { id: createdPost.id, likesBefore: likesInitial, likesAfter: likesAfterLike });
    console.log("  -> Likes should have increased by 1.");

    await ServerFacade.unlikePost(createdPost.id, viewerSpotifyUserId);
    const feedAfterUnlike = await ServerFacade.getFeed(viewerSpotifyUserId);
    const postAfterUnlike = feedAfterUnlike.find((p) => p.id === createdPost.id);
    const likesAfterUnlike = postAfterUnlike?.likes ?? 0;
    log("After unlikePost (decrease)", { id: createdPost.id, likesAfterLike, likesAfterUnlike });
    console.log("  -> Likes should have decreased by 1.");

    await ServerFacade.addComment(createdPost.id, {
      authorHandle: handle,
      authorSpotifyUserId: viewerSpotifyUserId,
      text: "Test comment"
    });
    const feedAfterComment = await ServerFacade.getFeed(viewerSpotifyUserId);
    const postWithComment = feedAfterComment.find((p) => p.id === createdPost.id);
    log("After addComment (comments)", postWithComment?.comments ?? "not found");

    // ── Comment likes ──
    await ServerFacade.likeComment(createdPost.id, 0, viewerSpotifyUserId);
    const feedAfterCommentLike = await ServerFacade.getFeed(viewerSpotifyUserId);
    const postAfterCommentLike = feedAfterCommentLike.find((p) => p.id === createdPost.id);
    log("After likeComment (increase)", {
      comments: postAfterCommentLike?.comments ?? []
    });

    // Idempotency: liking again should not increase likes.
    await ServerFacade.likeComment(createdPost.id, 0, viewerSpotifyUserId);
    const feedAfterCommentLikeAgain = await ServerFacade.getFeed(viewerSpotifyUserId);
    const postAfterCommentLikeAgain = feedAfterCommentLikeAgain.find((p) => p.id === createdPost.id);
    log("After likeComment again (no double count)", {
      comments: postAfterCommentLikeAgain?.comments ?? []
    });

    // ── Song collection ──
    console.log("\n========== SONG COLLECTION ==========");

    const collectionEmpty = await ServerFacade.getSongCollection(handle);
    log("Get song collection (findOrCreate, initial)", collectionEmpty);

    await ServerFacade.addSavedSong(handle, {
      title: "Saved Song",
      artist: "Saved Artist",
      album: "Saved Album"
    });
    const collectionWithOne = await ServerFacade.getSongCollection(handle);
    log("After addSavedSong (savedSongs)", collectionWithOne.savedSongs);

    await ServerFacade.removeSavedSong(handle, 0);
    const collectionAfterRemove = await ServerFacade.getSongCollection(handle);
    log("After removeSavedSong (index 0) – should be empty", collectionAfterRemove.savedSongs);
    if (collectionAfterRemove.savedSongs.length === 0) {
      console.log("  -> Confirmed: nothing there after delete.");
    }

    await ServerFacade.setSavedSongs(handle, [
      { title: "Set A", artist: "Artist A" },
      { title: "Set B", artist: "Artist B" }
    ]);
    const collectionAfterSet = await ServerFacade.getSongCollection(handle);
    log("After setSavedSongs (replace all)", collectionAfterSet.savedSongs);

    console.log("\n========== ALL DONE ==========\n");
  } catch (err: unknown) {
    const cause = err && typeof err === "object" && "cause" in err ? (err as { cause?: { code?: string } }).cause : null;
    if (cause && typeof cause === "object" && cause.code === "ECONNREFUSED") {
      console.error("\nConnection refused. Is the server running?");
      console.error("Start it in another terminal: npm run dev:server");
      console.error("Then run this test again.\n");
    } else {
      console.error("\nTest failed:", err);
    }
    process.exit(1);
  }
}

main();
