const { Client, Events, ModalSubmitInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

const ticketsSchema = require('../../../schemas/tickets.js');

// Event
module.exports = {
  name: Events.InteractionCreate,

  /**
   * @param { Client } _
   * @param { ModalSubmitInteraction } interaction
   */

  async execute(_, interaction) {
    if (!interaction.isModalSubmit() || interaction.customId !== 'gethertickets-order-log-question-modal') return;

    await interaction.deferUpdate();

    const result = await ticketsSchema.findOne({
      logMessageId: interaction.message.id,
    });

    if (!result) {
      await interaction.followUp({
        content: 'To zamówienie zostało zamknięte!',
        ephemeral: true
      });

      return interaction.message.delete();
    }

    const ticketChannel = await interaction.guild.channels.fetch(result.channelId);

    if (!ticketChannel) {
      await interaction.followUp({
        content: 'To zamówienie zostało zamknięte!',
        ephemeral: true
      });
    
      return interaction.message.delete();
    }

    const question = interaction.fields.getTextInputValue('gethertickets-order-log-question-modal-input1');

    if (!result.questions) {
        result.questions = [];
    }

    result.questions.push({ userId: interaction.user.id, question });

    const orderLogEmbed = EmbedBuilder.from(interaction.message.embeds[0])

    orderLogEmbed.setFields([]);

    result.questions.forEach(({ userId, question }, index) => {
        orderLogEmbed.addFields({
            name: 'Pytanie',
            value: question,
            inline: true
        }, {
            name: 'Odpowiedź',
            value: result.answers ? result.answers.length >= index + 1 ? result.answers[index] : 'Brak odpowiedzi' : 'Brak odpowiedzi',
            inline: true
        }, {
            name: 'Zadane przez',
            value: `<@${userId}>`,
            inline: true
        })
    })

    await interaction.message.edit({
        embeds: [orderLogEmbed],
        components: [new ActionRowBuilder().setComponents(
            interaction.message.components[0].components[0],
            ButtonBuilder.from(interaction.message.components[0].components[1]).setDisabled(true),
        )]
    })

    await ticketsSchema.updateOne({
        logMessageId: interaction.message.id,
      }, {
        questions: result.questions,
        awaitingAnswer: true,
    });

    await interaction.followUp({
      content: 'Pytanie zostało wysłane!',
      ephemeral: true
    });

    const questionEmbed = new EmbedBuilder()
      .setTitle('Pytanie do zamówienia')
      .setDescription(question)
      .setColor('#FF0000')
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })

    await ticketChannel.send({
        embeds: [questionEmbed]
    })

    ticketChannel.permissionOverwrites.edit(result.userId, {
        SendMessages: true
    })
  },
};