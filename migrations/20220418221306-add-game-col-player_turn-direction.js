'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return Promise.all([
			queryInterface.addColumn('games', 'player_turn', {
				type: Sequelize.INTEGER,
				defaultValue: 0,
			}),
			queryInterface.addColumn('games', 'clockwise', {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			}),
		]);
	},

	async down(queryInterface, Sequelize) {
		return Promise.all([
			queryInterface.removeColumn('games', 'player_turn'),
			queryInterface.removeColumn('games', 'clockwise'),
		]);
	},
};
