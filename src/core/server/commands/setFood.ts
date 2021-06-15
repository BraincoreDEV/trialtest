import * as alt from 'alt-server';
import { Permissions } from '../../shared/flags/permissions';
import { LOCALE_KEYS } from '../../shared/locale/languages/keys';
import { LocaleManager } from '../../shared/locale/locale';
import { playerFuncs } from '../extensions/Player';
import ChatManager from '../systems/chat';

ChatManager.addCommand(
    'setfood',
    LocaleManager.get(LOCALE_KEYS.COMMAND_SET_FOOD, '/setfood'),
    Permissions.Admin,
    handleCommand
);

function handleCommand(player: alt.Player, value: string): void {
    let foodLevel = parseInt(value);

    if (isNaN(foodLevel)) {
        playerFuncs.emit.message(player, ChatManager.getDescription('setfood'));
        return;
    }

    if (foodLevel > 100) {
        foodLevel = 100;
    }

    if (foodLevel < 0) {
        foodLevel = 0;
    }

    player.data.food = foodLevel;
    playerFuncs.save.field(player, 'food', player.data.food);
    playerFuncs.sync.food(player);
    playerFuncs.emit.message(player, `Set Food to: ${foodLevel}`);
}
