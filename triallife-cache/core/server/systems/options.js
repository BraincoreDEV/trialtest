import { getDatabase } from 'simplymongo';
import { DEFAULT_CONFIG } from '../tlrp/config';
import { Collections } from '../interface/collections';
import { defaultOptions } from '../interface/options';
import Logger from '../utility/tlrpLogger';
export class OptionsController {
    static db = getDatabase();
    static data = {};
    static async propagateOptions() {
        const databaseData = await OptionsController.db.fetchAllData(Collections.Options);
        const currentOptions = !databaseData[0] ? defaultOptions : databaseData[0];
        Object.keys(currentOptions).forEach((key) => (OptionsController.data[key] = currentOptions[key]));
        if (!databaseData[0])
            OptionsController.data = await OptionsController.db.insertData(OptionsController.data, Collections.Options, true);
        if (DEFAULT_CONFIG.WHITELIST)
            Logger.info(`Whitelisted Users: ${OptionsController.data.whitelist.length}`);
    }
    static async addToWhitelist(id) {
        const isWhitelisted = await OptionsController.isWhitelisted(id);
        if (isWhitelisted)
            return true;
        OptionsController.data.whitelist.push(id);
        OptionsController.db.updatePartialData(OptionsController.data._id, { whitelist: OptionsController.data.whitelist }, Collections.Options);
        return true;
    }
    static isWhitelisted(id) {
        const index = OptionsController.data.whitelist.findIndex((dID) => dID === id);
        if (index >= 0)
            return true;
        return false;
    }
    static removeFromWhitelist(id) {
        const index = OptionsController.data.whitelist.findIndex((dID) => dID === id);
        if (index <= -1)
            return false;
        OptionsController.data.whitelist.splice(index, 1);
        OptionsController.db.updatePartialData(OptionsController.data._id, { whitelist: OptionsController.data.whitelist }, Collections.Options);
        return true;
    }
}
export default function loader() {
    OptionsController.propagateOptions();
}
