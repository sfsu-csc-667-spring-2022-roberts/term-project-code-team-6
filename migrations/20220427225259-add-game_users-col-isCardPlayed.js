'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
		return queryInterface.addColumn('game_users', 'isCardPlayed', {
			type: Sequelize.BOOLEAN,
			defaultValue: true,
		});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn('game_users', 'isCardPlayed');
  }
};
