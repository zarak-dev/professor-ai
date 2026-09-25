import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import QuizModel from '../models/Quiz';
import FlashcardModel from '../models/Flashcard';
import VisualizationModel from '../models/Visualization';
import DocumentModel from '../models/Document';
import ChatHistoryModel from '../models/ChatHistory';

async function cleanupDuplicates(model: mongoose.Model<any>, name: string) {
    console.log(`[MIGRATION] Checking ${name} for duplicate doc_id records...`);
    const duplicates = await model.aggregate([
        { $match: { doc_id: { $ne: null } } },
        { $group: { _id: "$doc_id", ids: { $push: "$_id" }, count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicates.length === 0) {
        console.log(`[MIGRATION] No duplicates found in ${name}.`);
        return;
    }

    console.log(`[MIGRATION] Found ${duplicates.length} duplicate groups in ${name}. Preserving newest...`);
    for (const dup of duplicates) {
        // Keep the latest record, remove the older ones
        const records = await model.find({ _id: { $in: dup.ids } }).sort({ createdAt: -1 });
        const [_keep, ...remove] = records;
        const removeIds = remove.map(r => r._id);
        await model.deleteMany({ _id: { $in: removeIds } });
        console.log(`[MIGRATION] Cleaned up ${removeIds.length} older records for doc_id: ${dup._id}`);
    }
}

async function run() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/the-professor';
    console.log('[MIGRATION] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    try {
        await cleanupDuplicates(QuizModel, 'Quiz');
        await cleanupDuplicates(FlashcardModel, 'Flashcard');
        await cleanupDuplicates(VisualizationModel, 'Visualization');

        console.log('[MIGRATION] Syncing indexes for all models...');
        await DocumentModel.syncIndexes();
        await ChatHistoryModel.syncIndexes();
        await QuizModel.syncIndexes();
        await FlashcardModel.syncIndexes();
        await VisualizationModel.syncIndexes();

        console.log('[MIGRATION] All indexes successfully synchronized!');
    } catch (err) {
        console.error('[MIGRATION] Error running migration:', err);
    } finally {
        await mongoose.disconnect();
        console.log('[MIGRATION] Disconnected from MongoDB.');
    }
}

if (require.main === module) {
    run();
}

export { run as runIndexMigration };
