import { autoinject } from "aurelia-framework";
import * as Web3 from "web3";
import { HttpProvider, Eth, version, BigNumber } from "web3";

@autoinject()
export class Web3Service {

    private _isCorrectChain: boolean = false;
    private _web3: Web3;

    constructor(
        // private contractService: TruffleContractService
    ) {
    }

    public get web3(): Web3 { return this._web3; }
    
    public get accounts(): Array<string> { return this.web3 ? this.web3.eth.accounts : []; }
    
    // TODO:  always same as this.web3.eth.accounts[0]? -dkent
    public get defaultAccount(): string { return this.web3 ? this.web3.eth.defaultAccount : null; }

    public get currentProvider(): HttpProvider { return this.web3 ? this.web3.currentProvider : null; }
    
    public get isConnected(): boolean { return this.web3 && this.web3.isConnected(); }

    public get eth(): Eth { return this.web3 ? this.web3.eth : null; }

    public get version(): version { return this.web3 ? this.web3.version : null; }

    public bytes32ToUtf8(bytes32: string) : string {
        return this.web3.toUtf8(bytes32);
    }

    public get isCorrectChain(): boolean { return this._isCorrectChain; }

    public fromWei(res: Number|String, unit?: string): String|Object {
        return this.web3.fromWei(res, unit);
    }

    public toWei(res: Number|String|BigNumber, unit?: string): String|Object {
        return this.web3.toWei(res, unit);
    }

    public getBalance(ethAddress: string): Promise<number> {
      return new Promise((resolve, reject) => {
        this.web3.eth.getBalance(ethAddress, (error, balance) => {
          if (error) {
            reject(new Error(error));
          }
          resolve(Number(this.web3.fromWei(balance)));
        });
      });
    }

    public static Network = process.env.ETH_ENV;
    // not going to worry about the exact id for testrpc, which is dynamic, unless we absolutely have to

    public initialize(web3) : Promise<Web3> {

      const testrpcNetworkId = '0';
      
      let getIdFromNetwork = (network) => {
        
        switch (network) {
          case 'ropsten':
          return '3';
          case 'kovan':
          return '42';
          case 'livenet':
          return '1';
          case 'testrpc':
          default:
            // for testrpc, would be something like: Object.keys(GenesisScheme.networks).pop();
            return testrpcNetworkId;
      }
    };

      let getNetworkFromID = (id) => {
        switch (id) {
          case '3': return 'ropsten';
          case '42' : return 'kovan';
          case '1': return 'livenet';
          case null:
          case undefined:
          case '0': 
          return 'unknown';
          default:  return 'probably testrpc'
        }
      };

      return new Promise<void>((resolve, reject) => {
        try {
          web3.version.getNetwork((err, chainId) => {
            if (!err) 
            {
              console.log(`Targetted network: ${Web3Service.Network}`)
              let targetedNetworkId = getIdFromNetwork(Web3Service.Network);

              console.log(`Found chainId ${chainId}, targetedNetworkId: ${targetedNetworkId})`);
              this._isCorrectChain = (targetedNetworkId === chainId) || (targetedNetworkId === testrpcNetworkId);
              if (!this._isCorrectChain) {
                reject(new Error(`Web3Service.initialize failed: connected to the wrong network, expected: ${Web3Service.Network}, actual: ${getNetworkFromID(chainId)}`));
              } else {
                console.log(`Connected to Ethereum (${Web3Service.Network})`);
                this._web3 = web3;
                resolve(this._web3);
              }
            } else {
                reject(new Error(`Web3Service.initialize failed: isConnected: ${this._isCorrectChain} isCorrectChain: ${this._isCorrectChain}`));
            }
          });
          } catch(ex) {
            reject(new Error(`Web3Service.initialize failed: ${ex}`));
          }
      });
  }
}
