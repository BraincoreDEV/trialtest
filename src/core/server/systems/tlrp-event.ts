import * as alt from 'alt-server';
import { TLRP_EVENTS_PLAYER, TLRP_EVENTS_VEHICLE } from '../enums/tlrp';

const events: { [key: string]: Array<any> } = {};

type playerCallback = (result: alt.Player, ...args: any) => void;
type vehicleCallback = (result: alt.Vehicle, ...args: any) => void;

function on(eventName: TLRP_EVENTS_PLAYER | TLRP_EVENTS_VEHICLE, callback: playerCallback | vehicleCallback) {
    if (!events[eventName]) {
        events[eventName] = [];
    }

    events[eventName].push(callback);
}

/**
 * Used to bind events to callbacks.
 * @export
 * @class EventManager
 */
export class EventManager {
    /**
     * Subscribe to an triallife Player event.
     * @static
     * @param {TLRP_EVENTS_PLAYER} eventName
     * @param {playerCallback} callback
     * @memberof EventManager
     */
    static onPlayer(eventName: TLRP_EVENTS_PLAYER, callback: playerCallback) {
        on(eventName, callback);
    }

    /**
     * Subscribe to an triallife Vehicle event.
     * @static
     * @param {TLRP_EVENTS_VEHICLE} eventName
     * @param {vehicleCallback} callback
     * @memberof EventManager
     */
    static onVehicle(eventName: TLRP_EVENTS_VEHICLE, callback: vehicleCallback) {
        on(eventName, callback);
    }
}

function processCallbacks(eventName: string, args: any[]) {
    if (!events[eventName]) {
        return;
    }

    events[eventName].forEach((callback: Function) => {
        callback(...args);
    });
}

Object.values(TLRP_EVENTS_PLAYER).forEach((eventName) => {
    alt.on(eventName, (...args: any[]) => {
        processCallbacks(eventName.toString(), args);
    });
});

Object.values(TLRP_EVENTS_VEHICLE).forEach((eventName) => {
    alt.on(eventName, (...args: any[]) => {
        processCallbacks(eventName.toString(), args);
    });
});
