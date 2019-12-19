import axios from 'axios';

export class RpcCallHTTP{
    private RPCConfigurationFactory = (endpoint, method, params) => {
        return {
            method: 'POST',
            data: {
                jsonrpc: '2.0',
                method: method,
                params: params,
                id: '_' + Math.random().toString(36).substr(2, 9)
            },
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }

    public RPCCall=async (endpoint: string, method: string, params: any) => {
        const config = this.RPCConfigurationFactory(endpoint, method, params);

        const RPCRes = await this.fetch(endpoint, config);

        if (RPCRes.error) {
            throw new Error();
        }

        return (typeof (RPCRes.result) === 'string') ? JSON.parse(RPCRes.result) : RPCRes.result;
    }

    private fetch (
        url: string,
        config
    ) {
        if (config.body) {
            config.data = config.body;
        }

        return axios(url, config).then(result => result.data);
    }
}
