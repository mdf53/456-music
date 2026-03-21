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
    const result = await col.updateOne(
      { profileHandle },
      { $addToSet: { friends: friendHandle } }
    );
    return result.modifiedCount === 1;
  },

  async removeFriend(profileHandle: string, friendHandle: string): Promise<boolean> {
    const col = getDb().collection<Profile>(COLLECTION);
    const result = await col.updateOne(
      { profileHandle },
      { $pull: { friends: friendHandle } }
    );
    return result.modifiedCount === 1;
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
