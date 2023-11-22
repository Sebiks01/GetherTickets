const {
  Client,
  Events,
  ModalSubmitInteraction,
  EmbedBuilder,
} = require('discord.js');

const offersSchema = require('../../../schemas/offers.js');

// Event
module.exports = {
  name: Events.InteractionCreate,

  /**
   * @param { Client } _
   * @param { ModalSubmitInteraction } interaction
   */

  async execute(_, interaction) {
    if (
      !interaction.isModalSubmit() ||
      !interaction.customId.startsWith(
        'gethertickets-order-offer-decline-modal-'
      )
    )
      return;

    await interaction.deferUpdate();

    const userId = interaction.customId.split('-').pop();
    const reason = interaction.fields.getTextInputValue(
      'gethertickets-order-offer-decline-input1'
    );

    const result = await offersSchema.findOne({
      userId,
      channelId: interaction.channel.id,
    });

    if (!result.rejectedReasons) result.rejectedReasons = [];

    result.rejectedReasons.push(reason);

    await result.save();

    await interaction.followUp({
      content: 'Oferta została odrzucona!',
      ephemeral: true,
    });

    interaction.message.edit({
      embeds: [
        EmbedBuilder.from(interaction.message.embeds[0])
          .setColor('#FF0000')
          .setTitle('Oferta odrzucona!'),
      ],
      components: [],
    });
  },
};
