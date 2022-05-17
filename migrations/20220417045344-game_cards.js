'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.createTable('game_cards', {
			game_id: {
				type: Sequelize.INTEGER,
				references: {
					model: 'games',
					key: 'id',
				},
			},
			user_id: {
				type: Sequelize.INTEGER,
				references: {
					model: 'users',
					key: 'id',
				},
			},
      card_id: {
				type: Sequelize.INTEGER,
				references: {
					model: 'cards',
					key: 'id',
				},
			},
			discarded: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			order: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
		});
	},

	async down(queryInterface, Sequelize) {
		return queryInterface.dropTable('game_cards');
	},
};
