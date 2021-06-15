import * as alt from 'alt-server';
import { Permissions } from '../../shared/flags/permissions';
import { LOCALE_KEYS } from '../../shared/locale/languages/keys';
import { LocaleManager } from '../../shared/locale/locale';

import { playerFuncs } from '../extensions/Player';
import ChatManager from '../systems/chat';

ChatManager.addCommand(
    'sethealth',
    LocaleManager.get(LOCALE_KEYS.COMMAND_SET_HEALTH, '/sethealth'),
    Permissions.Admin,
    handleCommand
);

function handleCommand(player: alt.Player, value: number = 100, targetPlayerID: string | null = null): void {
    if (isNaN(value)) {
        playerFuncs.emit.message(player, ChatManager.getDescription('sethealth'));
        return;
    }

    if (value < 99) {
        value = 99;
    }

    if (value > 200) {
        value = 200;
    }

    if (targetPlayerID === null) {
        finishSetArmour(player, value);
        return;
    }

    const target: alt.Player = [...alt.Player.all].find((x) => x.id.toString() === targetPlayerID);
    if (!target) {
        playerFuncs.emit.message(player, LocaleManager.get(LOCALE_KEYS.CANNOT_FIND_PLAYER));
        return;
    }

    finishSetArmour(target, value);
}

function finishSetArmour(target: alt.Player, value: number) {
    playerFuncs.safe.addHealth(target, value, true);
    playerFuncs.emit.message(target, LocaleManager.get(LOCALE_KEYS.PLAYER_HEALTH_SET_TO, value));
}