import { ObjectId } from "mongodb";
import { getDb } from "../db/connection";
import type { Profile } from "../types";

const COLLECTION = "profiles";

const emptyFavorites = (): [string, string, string] => ["", "", ""];

export const ProfileDao = {
  async findAll(limit = 100): Promise<Profile[]> {
    const col = getDb().collection<Profile>(COLLECTION);
    return col.find({}).limit(limit).toArray();
  },

  async findByHandle(profileHandle: string): Promise<Profile | null> {
    const col = getDb().collection<Profile>(COLLECTION);
    return col.findOne({ profileHandle });
  },

  async findById(id: string): Promise<Profile | null> {
    if (!ObjectId.isValid(id)) return null;
    const col = getDb().collection<Profile>(COLLECTION);
    return col.findOne({ _id: new ObjectId(id) });
  },

  async create(profile: Omit<Profile, "_id" | "friends" | "favoriteArtists" | "favoriteSongs" | "createdAt">): Promise<Profile> {
    const doc: Profile = {
      ...profile,
      friends: [],
      favoriteArtists: emptyFavorites(),
      favoriteSongs: emptyFavorites(),
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

  async setFavoriteArtists(profileHandle: string, artists: [string, string, string]): Promise<boolean> {
    const col = getDb().collection<Profile>(COLLECTION);
    const result = await col.updateOne(
      { profileHandle },
      { $set: { favoriteArtists: artists } }
    );
    return result.modifiedCount === 1;
  },

  async setFavoriteSongs(profileHandle: string, songs: [string, string, string]): Promise<boolean> {
    const col = getDb().collection<Profile>(COLLECTION);
    const result = await col.updateOne(
      { profileHandle },
      { $set: { favoriteSongs: songs } }
    );
    return result.modifiedCount === 1;
  },

  async deleteByHandle(profileHandle: string): Promise<boolean> {
    const col = getDb().collection<Profile>(COLLECTION);
    const result = await col.deleteOne({ profileHandle });
    return result.deletedCount === 1;
  },
};
