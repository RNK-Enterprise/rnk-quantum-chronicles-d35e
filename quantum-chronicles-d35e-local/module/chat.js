// RNK-Quantum D35E Chat - Entangled Messages
// Innovative: Chat messages with quantum entanglement for multi-user sync

export const createCustomChatMessage = function(content, options = {}) {
  // Quantum entangled message creation
  const messageData = {
    content,
    speaker: options.speaker || ChatMessage.getSpeaker(),
    type: options.type || CONST.CHAT_MESSAGE_TYPES.OTHER,
    timestamp: Date.now()
  };

  // Add quantum entanglement ID
  messageData.entanglementId = uuidv4();

  return ChatMessage.create(messageData);
};

export const uuidv4 = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};