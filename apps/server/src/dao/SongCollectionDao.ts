import { ObjectId } from "mongodb";
import { getDb } from "../db/connection";
import type { SongCollectionDoc, SavedSong } from "../types";

const COLLECTION = "songCollections";

export const SongCollectionDao = {
  async findByProfileHandle(profileHandle: string): Promise<SongCollectionDoc | null> {
    const col = getDb().collection<SongCollectionDoc>(COLLECTION);
    return col.findOne({ profileHandle });
  },

  async create(profileHandle: string): Promise<SongCollectionDoc> {
    const doc: SongCollectionDoc = {
      profileHandle,
      savedSongs: [],
      updatedAt: new Date(),
    };
    const col = getDb().collection<SongCollectionDoc>(COLLECTION);
    const result = await col.insertOne(doc as SongCollectionDoc);
    return { ...doc, _id: result.insertedId };
  },

  async findOrCreate(profileHandle: string): Promise<SongCollectionDoc> {
    const existing = await this.findByProfileHandle(profileHandle);
    if (existing) return existing;
    return this.create(profileHandle);
  },

  async addSavedSong(profileHandle: string, song: SavedSong): Promise<boolean> {
    const col = getDb().collection<SongCollectionDoc>(COLLECTION);
    const result = await col.updateOne(
      { profileHandle },
      {
        $push: { savedSongs: song },
        $set: { updatedAt: new Date() },
      },
      { upsert: true }
    );
    return result.acknowledged;
  },

  async removeSavedSong(profileHandle: string, index: number): Promise<boolean> {
    const col = getDb().collection<SongCollectionDoc>(COLLECTION);
    const doc = await col.findOne({ profileHandle });
    if (!doc || index < 0 || index >= doc.savedSongs.length) return false;
    const updated = [...doc.savedSongs];
    updated.splice(index, 1);
    const result = await col.updateOne(
      { profileHandle },
      { $set: { savedSongs: updated, updatedAt: new Date() } }
    );
    return result.modifiedCount === 1;
  },

  async setSavedSongs(profileHandle: string, savedSongs: SavedSong[]): Promise<boolean> {
    const col = getDb().collection<SongCollectionDoc>(COLLECTION);
    const result = await col.updateOne(
      { profileHandle },
      { $set: { savedSongs, updatedAt: new Date() } },
      { upsert: true }
    );
    return result.acknowledged;
  },

  async deleteByProfileHandle(profileHandle: string): Promise<boolean> {
    const col = getDb().collection<SongCollectionDoc>(COLLECTION);
    const result = await col.deleteOne({ profileHandle });
    return result.deletedCount === 1;
  },

  async renameProfileHandleKey(oldHandle: string, newHandle: string): Promise<void> {
    const col = getDb().collection<SongCollectionDoc>(COLLECTION);
    await col.updateOne(
      { profileHandle: oldHandle },
      { $set: { profileHandle: newHandle, updatedAt: new Date() } }
    );
  },
};
