/// <reference types="@altv/types-server" />
import * as alt from 'alt-server';
import * as sm from 'simplymongo';
import { SYSTEM_EVENTS, View_Events_Discord } from '../../shared/utility/enums';
import { Permissions } from '../../shared/flags/permissions';
import { DEFAULT_CONFIG } from '../tlrp/config';
import { playerFuncs } from '../extensions/player';
import { Account, DiscordUser } from '../interface/entities';
import { getUniquePlayerHash } from '../utility/encryption';
import { goToCharacterSelect } from '../views/characters';
import { OptionsController } from './options';
import { vehicleFuncs } from '../extensions/vehicle';
import { Collections } from '../interface/collections';
import '../views/login';
import './tick';
import './voice';
import './job';
import './marker';
import './textlabel';

const db: sm.Database = sm.getDatabase();

export class LoginController {
    static async tryLogin(player: alt.Player, data: Partial<DiscordUser>, account: Partial<Account>): Promise<void> {
        delete player.pendingLogin;
        delete player.discordToken;
        if (DEFAULT_CONFIG.WHITELIST) {
            if (!OptionsController.isWhitelisted(data.id)) {
                player.kick(`You are not currently whitelisted.`);
                return;
            }
        }
        player.setMeta('tlrp:Discord:Info', data);
        if (data.username) alt.log(`[3L:RP] (${player.id}) ${data.username} has authenticated.`);
        if (account && account.discord) alt.log(`[3L:RP] (${player.id}) Discord ${account.discord} has logged in with a Quick Token `);
        const currentPlayers = [...alt.Player.all];
        const index = currentPlayers.findIndex((p) => p.discord && p.discord.id === data.id && p.id !== player.id);
        if (index >= 1) {
            player.kick('That ID is already logged in.');
            return;
        }
        player.discord = data as DiscordUser;
        alt.emitClient(player, View_Events_Discord.Close);
        if (!account) {
            let accountData: Partial<Account> | null = await db.fetchData<Account>('discord', data.id, Collections.Accounts);
            if (!accountData) {
                const newDocument: Partial<Account> = {
                    discord: player.discord.id,
                    ips: [player.ip],
                    hardware: [player.hwidHash, player.hwidExHash],
                    lastLogin: Date.now(),
                    permissionLevel: Permissions.None
                };
                account = await db.insertData<Partial<Account>>(newDocument, Collections.Accounts, true);
            } else account = accountData;
        }
        if (account.banned) {
            player.kick(account.reason);
            return;
        }
        await playerFuncs.set.account(player, account);
        goToCharacterSelect(player);
    }

    static tryDisconnect(player: alt.Player, reason: string): void {
        if (!player || !player.valid || !player.data) return;
        if (player.lastVehicleID !== null && player.lastVehicleID !== undefined) vehicleFuncs.new.despawn(player.lastVehicleID);
        alt.log(`${player.data.name} has logged out.`);
        playerFuncs.save.onTick(player);
    }

    static async tryDiscordQuickToken(player: alt.Player, discord: string): Promise<void> {
        if (!discord) return;
        const hashToken: string = getUniquePlayerHash(player, discord);
        const account: Partial<Account> | null = await db.fetchData<Account>('quickToken', hashToken, Collections.Accounts);
        if (!account) {
            player.needsQT = true;
            return;
        }
        if (!account.quickTokenExpiration || Date.now() > account.quickTokenExpiration) {
            player.needsQT = true;
            db.updatePartialData(account._id, { quickToken: null, quickTokenExpiration: null }, Collections.Accounts);
            return;
        }
        LoginController.tryLogin(player, { id: discord }, account);
    }

    static async handleNoQuickToken(player: alt.Player): Promise<void> {
        player.needsQT = true;
    }
}

alt.onClient(SYSTEM_EVENTS.QUICK_TOKEN_NONE, LoginController.handleNoQuickToken);
alt.onClient(SYSTEM_EVENTS.QUICK_TOKEN_EMIT, LoginController.tryDiscordQuickToken);
alt.on('playerDisconnect', LoginController.tryDisconnect);
alt.on('Discord:Login', LoginController.tryLogin);