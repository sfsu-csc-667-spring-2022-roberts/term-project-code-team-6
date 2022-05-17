'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.addColumn('game_cards', 'rotate', {
			type: Sequelize.INTEGER,
		});
	},

	async down(queryInterface, Sequelize) {
		return queryInterface.removeColumn('game_cards', 'rotate');
	},
};
