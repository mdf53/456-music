import { ObjectId } from "mongodb";
import { getDb } from "../db/connection";
import type {
  FavoriteArtistEntry,
  FavoriteSongEntry,
  Profile
} from "../types";
import { PostDao } from "./PostDao";
import { SongCollectionDao } from "./SongCollectionDao";

const COLLECTION = "profiles";

const HANDLE_REGEX = /^[a-z0-9_]{3,30}$/;

export function normalizeProfileHandle(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidProfileHandle(normalized: string): boolean {
  if (/\s/.test(normalized)) return false;
  return HANDLE_REGEX.test(normalized);
}

/** Internal "account id" for relationships (stable across handle renames). */
function profileAccountKey(p: Profile): string {
  // spotifyUserId is the preferred stable key; fall back to handle for legacy docs.
  return p.spotifyUserId ?? p.profileHandle;
}

const emptySongFavorites = (): [
  FavoriteSongEntry,
  FavoriteSongEntry,
  FavoriteSongEntry
] => [{ title: "" }, { title: "" }, { title: "" }];

const emptyArtistFavorites = (): [
  FavoriteArtistEntry,
  FavoriteArtistEntry,
  FavoriteArtistEntry
] => [{ name: "" }, { name: "" }, { name: "" }];

export const ProfileDao = {
  async findAll(limit = 100): Promise<Profile[]> {
    const col = getDb().collection<Profile>(COLLECTION);
    return col.find({}).limit(limit).toArray();
  },

  async findByHandle(profileHandle: string): Promise<Profile | null> {
    const col = getDb().collection<Profile>(COLLECTION);
    return col.findOne({ profileHandle });
  },

  async findByProfileHandles(handles: string[]): Promise<Profile[]> {
    if (handles.length === 0) return [];
    const normalized = [
      ...new Set(handles.map((h) => normalizeProfileHandle(h)).filter((h) => h.length > 0))
    ];
    if (normalized.length === 0) return [];
    const col = getDb().collection<Profile>(COLLECTION);
    return col.find({ profileHandle: { $in: normalized } }).toArray();
  },

  async findBySpotifyUserId(spotifyUserId: string): Promise<Profile | null> {
    const col = getDb().collection<Profile>(COLLECTION);
    return col.findOne({ spotifyUserId });
  },

  /**
   * Profile linked to this Spotify account (by spotifyUserId, or legacy row where profileHandle === Spotify id).
   */
  async findBySpotifyAccount(spotifyUserId: string): Promise<Profile | null> {
    const col = getDb().collection<Profile>(COLLECTION);
    const byId = await col.findOne({ spotifyUserId });
    if (byId) return byId;
    return col.findOne({ profileHandle: spotifyUserId });
  },

  /** Batch resolve Spotify OAuth user ids (and legacy handle === id rows) to profiles. */
  async findBySpotifyAccountIds(spotifyUserIds: string[]): Promise<Profile[]> {
    if (spotifyUserIds.length === 0) return [];
    const unique = [
      ...new Set(spotifyUserIds.map((s) => String(s).trim()).filter((s) => s.length > 0))
    ];
    if (unique.length === 0) return [];
    const col = getDb().collection<Profile>(COLLECTION);
    return col
      .find({
        $or: [{ spotifyUserId: { $in: unique } }, { profileHandle: { $in: unique } }]
      })
      .toArray();
  },

  async findById(id: string): Promise<Profile | null> {
    if (!ObjectId.isValid(id)) return null;
    const col = getDb().collection<Profile>(COLLECTION);
    return col.findOne({ _id: new ObjectId(id) });
  },

  async create(
    profile: Omit<Profile, "_id" | "friends" | "favoriteArtists" | "favoriteSongs" | "createdAt">
  ): Promise<Profile> {
    const doc: Profile = {
      ...profile,
      friends: [],
      friendRequestsReceived: [],
      friendRequestsSent: [],
      favoriteArtists: emptyArtistFavorites(),
      favoriteSongs: emptySongFavorites(),
      createdAt: new Date(),
    };
    const col = getDb().collection<Profile>(COLLECTION);
    const result = await col.insertOne(doc as Profile);
    return { ...doc, _id: result.insertedId };
  },

  async update(
    profileHandle: string,
    updates: Partial<Pick<Profile, "name" | "favoriteArtists" | "favoriteSongs">>
  ): Promise<boolean> {
    const col = getDb().collection<Profile>(COLLECTION);
    const result = await col.updateOne(
      { profileHandle },
      { $set: updates }
    );
    return result.modifiedCount === 1;
  },

  async addFriend(profileHandle: string, friendHandle: string): Promise<boolean> {
    if (profileHandle === friendHandle) return false;
    const col = getDb().collection<Profile>(COLLECTION);
    const friend = await this.findByHandle(normalizeProfileHandle(friendHandle));
    if (!friend) return false;
    const friendKey = profileAccountKey(friend);

    const result = await col.updateOne({ profileHandle }, { $addToSet: { friends: friendKey } });
    return result.modifiedCount === 1;
  },

  async removeFriend(profileHandle: string, friendHandle: string): Promise<boolean> {
    const col = getDb().collection<Profile>(COLLECTION);
    const fromH = normalizeProfileHandle(profileHandle);
    const toH = normalizeProfileHandle(friendHandle);

    const from = await this.findByHandle(fromH);
    const to = await this.findByHandle(toH);

    const fromKey = from ? profileAccountKey(from) : fromH;
    const toKey = to ? profileAccountKey(to) : toH;

    // Best-effort cleanup: pull both directions for both possible representations
    // (legacy handle vs new spotify-key).
    const valuesFrom = Array.from(new Set([toKey, toH]));
    const valuesTo = Array.from(new Set([fromKey, fromH]));

    let modified = 0;

    for (const v of valuesFrom) {
      const r = await col.updateOne(
        { profileHandle: fromH },
        {
          $pull: {
            friends: v,
            friendRequestsReceived: v,
            friendRequestsSent: v
          }
        } as any
      );
      modified += r.modifiedCount;
    }

    for (const v of valuesTo) {
      const r = await col.updateOne(
        { profileHandle: toH },
        {
          $pull: {
            friends: v,
            friendRequestsReceived: v,
            friendRequestsSent: v
          }
        } as any
      );
      modified += r.modifiedCount;
    }

    return modified > 0;
  },

  /** Substring match on profileHandle (case-insensitive), for friend search. */
  async searchByHandleQuery(query: string, limit = 20): Promise<Profile[]> {
    const col = getDb().collection<Profile>(COLLECTION);
    const q = normalizeProfileHandle(query);
    if (q.length < 1) return [];
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return col
      .find({ profileHandle: { $regex: escaped, $options: "i" } })
      .limit(Math.min(limit, 50))
      .toArray();
  },

  async sendFriendRequest(
    fromHandle: string,
    toHandle: string
  ): Promise<
    | { ok: true }
    | {
        ok: false;
        code:
          | "SELF"
          | "NOT_FOUND"
          | "ALREADY_FRIENDS"
          | "ALREADY_PENDING"
          | "ALREADY_INCOMING";
      }
  > {
    const fromH = normalizeProfileHandle(fromHandle);
    const toH = normalizeProfileHandle(toHandle);
    if (fromH === toH) return { ok: false, code: "SELF" };
    const from = await this.findByHandle(fromH);
    const to = await this.findByHandle(toH);
    if (!from || !to) return { ok: false, code: "NOT_FOUND" };

    const fromKey = profileAccountKey(from);
    const toKey = profileAccountKey(to);

    const fFriends = from.friends ?? [];
    const tFriends = to.friends ?? [];
    // Support both legacy (handles) and new (spotify keys) docs.
    const alreadyFriends =
      fFriends.includes(toKey) ||
      fFriends.includes(toH) ||
      tFriends.includes(fromKey) ||
      tFriends.includes(fromH);
    if (alreadyFriends) {
      return { ok: false, code: "ALREADY_FRIENDS" };
    }

    const fRecv = from.friendRequestsReceived ?? [];
    const fSent = from.friendRequestsSent ?? [];
    const tRecv = to.friendRequestsReceived ?? [];

    const alreadyIncoming = fRecv.includes(toKey) || fRecv.includes(toH);
    const alreadyPendingOutgoing =
      fSent.includes(toKey) || fSent.includes(toH) || tRecv.includes(fromKey) || tRecv.includes(fromH);

    // Incoming means: I have already received a request from the other person.
    if (alreadyPendingOutgoing) return { ok: false, code: "ALREADY_PENDING" };
    if (alreadyIncoming) return { ok: false, code: "ALREADY_INCOMING" };

    const col = getDb().collection<Profile>(COLLECTION);
    await col.updateOne(
      { profileHandle: toH },
      { $addToSet: { friendRequestsReceived: fromKey } }
    );
    await col.updateOne(
      { profileHandle: fromH },
      { $addToSet: { friendRequestsSent: toKey } }
    );
    return { ok: true };
  },

  async acceptFriendRequest(
    accepterHandle: string,
    requesterHandle: string
  ): Promise<{ ok: true } | { ok: false; code: "NOT_FOUND" | "NO_REQUEST" }> {
    const acH = normalizeProfileHandle(accepterHandle);
    const reqH = normalizeProfileHandle(requesterHandle);
    const accepter = await this.findByHandle(acH);
    const requester = await this.findByHandle(reqH);
    if (!accepter || !requester) return { ok: false, code: "NOT_FOUND" };
    const acKey = profileAccountKey(accepter);
    const reqKey = profileAccountKey(requester);
    const recv = accepter.friendRequestsReceived ?? [];
    const hasRequest = recv.includes(reqKey) || recv.includes(reqH);
    if (!hasRequest) return { ok: false, code: "NO_REQUEST" };

    const col = getDb().collection<Profile>(COLLECTION);
    /** Clear pending in both directions (handles mutual requests) and add friendship. */
    await col.updateOne(
      { profileHandle: acH },
      {
        $pull: {
          friendRequestsReceived: { $in: [reqKey, reqH] },
          friendRequestsSent: { $in: [reqKey, reqH] }
        },
        $addToSet: { friends: reqKey }
      }
    );
    await col.updateOne(
      { profileHandle: reqH },
      {
        $pull: {
          friendRequestsReceived: { $in: [acKey, acH] },
          friendRequestsSent: { $in: [acKey, acH] }
        },
        $addToSet: { friends: acKey }
      }
    );
    return { ok: true };
  },

  async declineFriendRequest(
    declinerHandle: string,
    requesterHandle: string
  ): Promise<{ ok: true } | { ok: false; code: "NOT_FOUND" | "NO_REQUEST" }> {
    const dH = normalizeProfileHandle(declinerHandle);
    const reqH = normalizeProfileHandle(requesterHandle);
    const decliner = await this.findByHandle(dH);
    if (!decliner) return { ok: false, code: "NOT_FOUND" };
    const req = await this.findByHandle(reqH);
    const reqKey = req ? profileAccountKey(req) : reqH;

    const recv = decliner.friendRequestsReceived ?? [];
    if (!recv.includes(reqKey) && !recv.includes(reqH)) return { ok: false, code: "NO_REQUEST" };

    const col = getDb().collection<Profile>(COLLECTION);
    await col.updateOne(
      { profileHandle: dH },
      { $pull: { friendRequestsReceived: { $in: [reqKey, reqH] } } }
    );
    await col.updateOne(
      { profileHandle: reqH },
      { $pull: { friendRequestsSent: { $in: [dH, profileAccountKey(decliner)] } } }
    );
    return { ok: true };
  },

  async setFavoriteArtists(
    profileHandle: string,
    artists: [FavoriteArtistEntry, FavoriteArtistEntry, FavoriteArtistEntry]
  ): Promise<boolean> {
    const col = getDb().collection<Profile>(COLLECTION);
    const result = await col.updateOne(
      { profileHandle },
      { $set: { favoriteArtists: artists } }
    );
    // matchedCount: doc exists; modifiedCount can be 0 if BSON matches existing (still success)
    return result.matchedCount === 1;
  },

  async setFavoriteSongs(
    profileHandle: string,
    songs: [FavoriteSongEntry, FavoriteSongEntry, FavoriteSongEntry]
  ): Promise<boolean> {
    const col = getDb().collection<Profile>(COLLECTION);
    const result = await col.updateOne(
      { profileHandle },
      { $set: { favoriteSongs: songs } }
    );
    return result.matchedCount === 1;
  },

  async deleteByHandle(profileHandle: string): Promise<boolean> {
    const col = getDb().collection<Profile>(COLLECTION);
    const result = await col.deleteOne({ profileHandle });
    return result.deletedCount === 1;
  },

  /**
   * Change primary profileHandle and fix references (friends, posts, song collections).
   */
  async renameProfileHandle(
    oldHandle: string,
    newHandleRaw: string
  ): Promise<
    | { ok: true; profile: Profile }
    | { ok: false; code: "NOT_FOUND" | "TAKEN" | "INVALID" }
  > {
    const normalized = normalizeProfileHandle(newHandleRaw);
    if (!isValidProfileHandle(normalized)) {
      return { ok: false, code: "INVALID" };
    }
    const col = getDb().collection<Profile>(COLLECTION);
    const doc = await col.findOne({ profileHandle: oldHandle });
    if (!doc) return { ok: false, code: "NOT_FOUND" };
    if (normalizeProfileHandle(doc.profileHandle) === normalized) {
      return { ok: true, profile: doc };
    }
    const taken = await col.findOne({ profileHandle: normalized });
    if (taken) return { ok: false, code: "TAKEN" };

    await col.updateOne(
      { profileHandle: oldHandle },
      { $set: { profileHandle: normalized } }
    );
    await col.updateMany(
      { friends: oldHandle },
      { $set: { "friends.$[f]": normalized } },
      { arrayFilters: [{ f: oldHandle }] }
    );
    await col.updateMany(
      { friendRequestsReceived: oldHandle },
      { $set: { "friendRequestsReceived.$[f]": normalized } },
      { arrayFilters: [{ f: oldHandle }] }
    );
    await col.updateMany(
      { friendRequestsSent: oldHandle },
      { $set: { "friendRequestsSent.$[f]": normalized } },
      { arrayFilters: [{ f: oldHandle }] }
    );
    await PostDao.rewriteAuthorHandle(oldHandle, normalized);
    await SongCollectionDao.renameProfileHandleKey(oldHandle, normalized);

    const updated = await col.findOne({ profileHandle: normalized });
    return { ok: true, profile: updated! };
  },

  /**
   * Onboarding / Let's Go: ensure Spotify user is linked, set or rename public profileHandle, create profile if missing.
   */
  async applyOnboardingHandle(
    spotifyUserId: string,
    displayName: string,
    requestedHandleRaw: string
  ): Promise<
    | { ok: true; profile: Profile }
    | { ok: false; code: "INVALID" | "TAKEN" }
  > {
    const normalized = normalizeProfileHandle(requestedHandleRaw);
    const col = getDb().collection<Profile>(COLLECTION);

    let doc = await this.findBySpotifyAccount(spotifyUserId);

    const sameAsExisting =
      doc !== null &&
      normalizeProfileHandle(doc.profileHandle) === normalized;

    if (!sameAsExisting && !isValidProfileHandle(normalized)) {
      return { ok: false, code: "INVALID" };
    }

    if (doc) {
      if (!doc.spotifyUserId) {
        await col.updateOne(
          { _id: doc._id! },
          { $set: { spotifyUserId } }
        );
        doc = (await col.findOne({ _id: doc._id! })) ?? doc;
      }

      if (normalizeProfileHandle(doc.profileHandle) === normalized) {
        if (displayName && doc.name !== displayName) {
          await col.updateOne(
            { profileHandle: doc.profileHandle },
            { $set: { name: displayName } }
          );
        }
        const fresh = await col.findOne({ profileHandle: doc.profileHandle });
        return { ok: true, profile: fresh! };
      }

      const renamed = await this.renameProfileHandle(doc.profileHandle, normalized);
      if (!renamed.ok) {
        if (renamed.code === "TAKEN") return { ok: false, code: "TAKEN" };
        return { ok: false, code: "INVALID" };
      }
      if (displayName && renamed.profile.name !== displayName) {
        await col.updateOne(
          { profileHandle: normalized },
          { $set: { name: displayName } }
        );
      }
      const fresh = await col.findOne({ profileHandle: normalized });
      return { ok: true, profile: fresh! };
    }

    const taken = await col.findOne({ profileHandle: normalized });
    if (taken) return { ok: false, code: "TAKEN" };

    const name = displayName.trim() || normalized;
    const profile = await this.create({
      name,
      profileHandle: normalized,
      spotifyUserId
    });
    return { ok: true, profile };
  },
};
