import { getDb } from "../db/connection";
import type { ProfilePhotoDoc } from "../types";

const COLLECTION = "profilePhotos";

/** ~1.5MB raw base64 is plenty for a square profile image. */
const MAX_BASE64_CHARS = 2_200_000;

export const ProfilePhotoDao = {
  async ensureIndexes(): Promise<void> {
    const col = getDb().collection<ProfilePhotoDoc>(COLLECTION);
    await col.createIndex({ spotifyUserId: 1 }, { unique: true });
  },

  async findBySpotifyUserId(spotifyUserId: string): Promise<ProfilePhotoDoc | null> {
    const col = getDb().collection<ProfilePhotoDoc>(COLLECTION);
    return col.findOne({ spotifyUserId });
  },

  /** One doc per id — for batch lookups. */
  async findBySpotifyUserIds(spotifyUserIds: string[]): Promise<Map<string, ProfilePhotoDoc>> {
    if (spotifyUserIds.length === 0) return new Map();
    const unique = [...new Set(spotifyUserIds.filter(Boolean))];
    const col = getDb().collection<ProfilePhotoDoc>(COLLECTION);
    const docs = await col.find({ spotifyUserId: { $in: unique } }).toArray();
    const m = new Map<string, ProfilePhotoDoc>();
    for (const d of docs) {
      m.set(d.spotifyUserId, d);
    }
    return m;
  },

  async upsert(spotifyUserId: string, imageBase64: string, mimeType: string): Promise<ProfilePhotoDoc> {
    if (imageBase64.length > MAX_BASE64_CHARS) {
      throw new Error("Image too large");
    }
    const col = getDb().collection<ProfilePhotoDoc>(COLLECTION);
    const now = new Date();
    await col.updateOne(
      { spotifyUserId },
      {
        $set: {
          spotifyUserId,
          imageBase64,
          mimeType,
          updatedAt: now
        }
      },
      { upsert: true }
    );
    const doc = await col.findOne({ spotifyUserId });
    if (!doc) throw new Error("Failed to save profile photo");
    return doc;
  }
};
