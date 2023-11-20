const {
  Client,
  Events,
  GuildTextBasedChannel,
  ChannelType,
} = require('discord.js');

const ticketsSchema = require('../../schemas/tickets.js');

// Event
module.exports = {
  name: Events.ChannelDelete,

  /**
   * @param { Client } _
   * @param { GuildTextBasedChannel } channel
   */

  async execute(_, channel) {
    if (channel.type !== ChannelType.GuildText) return;

    await ticketsSchema.deleteOne({ channelId: channel.id });
  },
};
