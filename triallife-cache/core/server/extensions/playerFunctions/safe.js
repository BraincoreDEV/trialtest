import * as alt from 'alt-server';
import { TLRP } from '../../utility/tlrpLoader';
import emit from './emit';
import save from './save';
const tlrp = TLRP.getFunctions('tlrp');
function setPosition(player, x, y, z) {
    if (!player.hasModel) {
        player.hasModel = true;
        player.spawn(x, y, z, 0);
        player.model = `mp_m_freemode_01`;
    }
    player.acPosition = new alt.Vector3(x, y, z);
    player.pos = new alt.Vector3(x, y, z);
}
function addArmour(p, value, exactValue = false) {
    if (exactValue) {
        p.acArmour = value;
        p.armour = value;
        return;
    }
    if (tlrp.Math.add(p.armour, value) > 100) {
        p.acArmour = 100;
        p.armour = 100;
        return;
    }
    p.acArmour = tlrp.Math.add(p.armour, value);
    p.armour = p.acArmour;
}
function addBlood(player, value) {
    adjustAttribute(player, value, 'blood');
}
function addFood(player, value) {
    adjustAttribute(player, value, 'hunger');
}
function addWater(player, value) {
    adjustAttribute(player, value, 'thirst');
}
function addMood(player, value) {
    adjustAttribute(player, value, 'mood');
}
function adjustAttribute(player, value, key) {
    const minValue = key === 'blood' ? 2500 : 0;
    const maxValue = key === 'blood' ? 7500 : 100;
    if (player.data[key] === undefined || player.data[key] === null)
        player.data[key] = maxValue;
    player.data[key] += value;
    if (tlrp.Math.isLesser(player.data[key], minValue))
        player.data[key] = minValue;
    if (tlrp.Math.isGreater(player.data[key], maxValue))
        player.data[key] = maxValue;
    emit.meta(player, key, player.data[key]);
    save.field(player, key, player.data[key]);
}
export default {
    setPosition,
    addArmour,
    addBlood,
    addFood,
    addWater,
    addMood
};
