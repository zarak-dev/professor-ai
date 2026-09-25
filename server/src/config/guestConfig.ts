/**
 * Centralized Guest Mode Configuration
 * Defines resource limits and session lifetimes for unauthenticated guest explorers.
 */
export const GUEST_CONFIG = {
    // Maximum number of documents a guest can upload concurrently in one session
    MAX_DOCUMENTS: 1,

    // Maximum combined AI generations (quiz, flashcards, concept map) allowed for a guest
    MAX_AI_GENERATIONS: 3,

    // Maximum chat questions a guest can ask per document
    MAX_CHAT_MESSAGES: 5,

    // Maximum file upload size for guests (5 MB)
    MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,

    // Guest session and document TTL in seconds (2 hours)
    SESSION_EXPIRY_SECONDS: 2 * 60 * 60,
};
