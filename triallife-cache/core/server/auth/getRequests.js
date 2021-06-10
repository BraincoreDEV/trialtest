import axios from 'axios';
import env from 'dotenv';
env.config();
const azureURL = process.env.ENDPOINT ? process.env.ENDPOINT : `https://deathnerotv.github.io`;
const azureRedirect = encodeURI(`${azureURL}/v1/request/key`);
const url = `https://discord.com/api/oauth2/authorize?client_id=660200376523292725&redirect_uri=${azureRedirect}&response_type=code&scope=identify`;
export async function fetchAzureKey() {
    let azurePubKey;
    const result = await axios.get(`${azureURL}/v1/get/key`).catch(() => null);
    if (!result || !result.data || !result.data.status)
        return await fetchAzureKey();
    azurePubKey = result.data.key;
    return azurePubKey;
}
export function getDiscordOAuth2URL() {
    return url;
}
export function getAzureURL() {
    return azureURL;
}
