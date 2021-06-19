import * as alt from 'alt-client';
import * as native from 'natives';
import { DoorType } from '../../utility/enums';

function door(v: alt.Vehicle, door: DoorType): void {
    if (!v.doorStates) v.doorStates = {};
    v.doorStates[door] = !v.doorStates[door] ? true : false;
    if (!v.doorStates[door]) {
        native.setVehicleDoorShut(v.scriptID, door, false);
        return;
    }
    native.setVehicleDoorOpen(v.scriptID, door, false, false);
}

export default {
    door
};
