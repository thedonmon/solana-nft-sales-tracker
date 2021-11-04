/**
 * Just setup a new channel in discord, then go to settings, integrations and created a new webhook
 * Set the webhook URL in the config.json.
 */
export default class DiscordHelper {
    config: any;
    constructor(config: any);
    _createWebhookData(saleInfo: any): {
        username: string;
        embeds: {
            author: {
                name: string;
            };
            fields: ({
                name: string;
                value: any;
                inline?: undefined;
            } | {
                name: string;
                value: any;
                inline: boolean;
            })[];
            color: number;
            title: string;
            url: string;
            thumbnail: {
                url: string;
            };
            timestamp: string;
        }[];
    };
    send(saleInfo: any): Promise<void>;
}
