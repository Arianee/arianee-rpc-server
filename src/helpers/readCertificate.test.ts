import { readCertificate } from './readCertificate';
import { ArianeeApiClient } from '@arianee/arianee-api-client';
import { ArianeeAccessToken } from '@arianee/arianee-access-token';
import { ErrorEnum, getError } from '../rpc/errors/error';


jest.mock('@arianee/arianee-api-client', () => {
  return {
    ArianeeApiClient: jest.fn().mockImplementation(() => {
      return {
        network: {
          getNft: jest.fn().mockReturnValue({
            issuer: 'someIssuer',
            owner: 'someOwner',
            requestKey: 'someRequestKey',
            viewKey: 'someViewKey',
            proofKey: 'someProofKey',
          }),
        },
      };
    }),
  };
});
jest.mock('@arianee/arianee-access-token');
jest.mock('ethers', ()=>{
  return{
    ethers:{
        verifyMessage:(message:string, signature:string)=>{
          if(signature === "0x0de47a78ee3e683fdfa57c654e80e9d51aea1d6192c5dcd00d548d28e9383d3f42685c9a383549fdca36e89cc05bf4a4ff82ad4d18c1bc8094daa0f2f80ce5c61b"){
            return "someOwner"
          }
          return "notOwner";
        }
    }
  }
});
describe('readCertificate', () => {
  let configuration: any;
  let data: any;

  beforeEach(() => {
    configuration = {
      fetchItem: jest.fn(),
      arianeeWallet: Promise.resolve({
        configuration: {
          networkName: 'someNetwork',
        },
        web3: {
          eth: {
            accounts: {
              recover: jest.fn(),
            },
          },
        },
      }),
    };

    (ArianeeAccessToken.decodeJwt as jest.Mock).mockReturnValue({
      payload: {},
    });
  });

  describe('bearer', () => {
    beforeEach(() => {
      data = {
        certificateId: '123',
        authentification: {
          bearer: 'someBearer',
        },
      };
    });

    // Scenario 1: payload.iss === owner + payload.subId === +certificateId
    test('should successfully fetch item with valid bearer when payload issuer is owner and subId matches', async () => {
      (ArianeeAccessToken.decodeJwt as jest.Mock).mockReturnValueOnce({
        payload: {
          subId: 123,
          iss: 'someOwner',
        },
      });
      configuration.fetchItem.mockResolvedValueOnce({ content: 'sample-content' });

      const callback = jest.fn();
      await readCertificate(data, callback, configuration);

      expect(callback).toHaveBeenCalledWith(null, { content: 'sample-content' });
    });

    // Scenario 2: payload.iss === issuer + payload.subId === +certificateId
    test('should successfully fetch item with valid bearer when payload issuer is issuer and subId matches', async () => {
      (ArianeeAccessToken.decodeJwt as jest.Mock).mockReturnValueOnce({
        payload: {
          subId: 123,
          iss: 'someIssuer',
        },
      });
      configuration.fetchItem.mockResolvedValueOnce({ content: 'sample-content' });

      const callback = jest.fn();
      await readCertificate(data, callback, configuration);

      expect(callback).toHaveBeenCalledWith(null, { content: 'sample-content' });
    });

    // Scenario 3: payload.iss === owner + payload.sub === 'wallet'
    test('should successfully fetch item with valid bearer when payload issuer is owner and sub is "wallet"', async () => {
      (ArianeeAccessToken.decodeJwt as jest.Mock).mockReturnValueOnce({
        payload: {
          sub: 'wallet',
          iss: 'someOwner',
        },
      });
      configuration.fetchItem.mockResolvedValueOnce({ content: 'sample-content' });

      const callback = jest.fn();
      await readCertificate(data, callback, configuration);

      expect(callback).toHaveBeenCalledWith(null, { content: 'sample-content' });
    });

    // Scenario 4: payload.iss === issuer + payload.sub === 'wallet'
    test('should successfully fetch item with valid bearer when payload issuer is issuer and sub is "wallet"', async () => {
      (ArianeeAccessToken.decodeJwt as jest.Mock).mockReturnValueOnce({
        payload: {
          sub: 'wallet',
          iss: 'someIssuer',
        },
      });
      configuration.fetchItem.mockResolvedValueOnce({ content: 'sample-content' });

      const callback = jest.fn();
      await readCertificate(data, callback, configuration);

      expect(callback).toHaveBeenCalledWith(null, { content: 'sample-content' });
    });

    test('should return an error with valid bearer when payload issuer is neither owner nor issuer but subId matches', async () => {
      (ArianeeAccessToken.decodeJwt as jest.Mock).mockReturnValueOnce({
        payload: {
          subId: 123,
          iss: 'someRandomEntity',
        },
      });

      const callback = jest.fn();
      await readCertificate(data, callback, configuration);

      // Expect the callback to be called with the NOTOWNERORISSUER error since the issuer doesn't match owner or issuer
      expect(callback).toHaveBeenCalledWith(getError(ErrorEnum.NOTOWNERORISSUER));
    });

    test('should return an error with valid bearer when payload issuer is issuer but subId does not match certificateId', async () => {
      (ArianeeAccessToken.decodeJwt as jest.Mock).mockReturnValueOnce({
        payload: {
          subId: 456, // This subId doesn't match the expected certificateId of 123
          iss: 'someIssuer',
        },
      });

      const callback = jest.fn();
      await readCertificate(data, callback, configuration);

      // Expect the callback to be called with the WRONGJWT error since the subId doesn't match the certificateId
      expect(callback).toHaveBeenCalledWith(getError(ErrorEnum.WRONGJWT));
    });

    test('should return an error with valid bearer when payload issuer is owner but subId does not match certificateId', async () => {
      (ArianeeAccessToken.decodeJwt as jest.Mock).mockReturnValueOnce({
        payload: {
          subId: 456, // This subId doesn't match the expected certificateId of 123
          iss: 'someOwner',
        },
      });

      const callback = jest.fn();
      await readCertificate(data, callback, configuration);

      // Expect the callback to be called with the WRONGJWT error since the subId doesn't match the certificateId
      expect(callback).toHaveBeenCalledWith(getError(ErrorEnum.WRONGJWT));
    });

    test('should return an error when bearer is invalid', async () => {
      // Mock the ArianeeAccessToken.decodeJwt to throw an error, simulating an invalid JWT
      (ArianeeAccessToken.decodeJwt as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid JWT');
      });

      const callback = jest.fn();
      await readCertificate(data, callback, configuration);

      // Expect the callback to have been called with the WRONGJWT error
      expect(callback).toHaveBeenCalledWith(getError(ErrorEnum.WRONGJWT));
    });
  });

  describe('signature', () => {
    let validSignatureData;
    let wallet;
    let callback = jest.fn();
    beforeEach(async () => {
      data = {
        certificateId: '123',
        authentification: {
          message: 'someMessage',
          signature: '0x262d6e00093044c5b3326372bdde4dddd39c91b4094fd253ecbbe4f593f7ecac66fe9fb95c37dee4722019d99f9d2dddbf328e838f5c65c7713cb9111f431ae31b',
        },
      };
      configuration.fetchItem.mockResolvedValueOnce({ content: 'sample-content' });
      validSignatureData = {
        ...data,
        authentification: {
          ...data.authentification,
          message: JSON.stringify({
            certificateId: 123,
            timestamp: new Date().toISOString(), // Current timestamp
          }),
          signature: '0x0de47a78ee3e683fdfa57c654e80e9d51aea1d6192c5dcd00d548d28e9383d3f42685c9a383549fdca36e89cc05bf4a4ff82ad4d18c1bc8094daa0f2f80ce5c61b',
        },
      };

      wallet = await configuration.arianeeWallet;
    });
    test('should return an error when signature is too old', async () => {
      const oldTimestamp = new Date(Date.now() - 301 * 1000).toISOString(); // 301 seconds ago
      data.authentification.message = JSON.stringify({
        timestamp: oldTimestamp,
        certificateId: '123',
      });

      const callback = jest.fn();
      await readCertificate(data, callback, configuration);

      // Expect the callback to have been called with the SIGNATURETOOOLD error
      expect(callback).toHaveBeenCalledWith(getError(ErrorEnum.SIGNATURETOOOLD));
    });

    test('should succeed when the signature is valid and matches the issuer', async () => {
      wallet.web3.eth.accounts.recover = jest.fn(() => 'someIssuer');
      await readCertificate(validSignatureData, callback, configuration);
      expect(callback).toHaveBeenCalledWith(null, { content: 'sample-content' });
    });

    test('should succeed when the signature is valid and matches the request key', async () => {
      wallet.web3.eth.accounts.recover = jest.fn(() => 'someRequestKey');
      await readCertificate(validSignatureData, callback, configuration);
      expect(callback).toHaveBeenCalledWith(null, { content: 'sample-content' });
    });

    test('should succeed when the signature is valid and matches the proof key', async () => {
      wallet.web3.eth.accounts.recover = jest.fn(() => 'someProofKey');
      await readCertificate(validSignatureData, callback, configuration);
      expect(callback).toHaveBeenCalledWith(null, { content: 'sample-content' });
    });

    test('should succeed when the signature is valid and matches the view key', async () => {
      wallet.web3.eth.accounts.recover = jest.fn(() => 'someViewKey');
      await readCertificate(validSignatureData, callback, configuration);
      expect(callback).toHaveBeenCalledWith(null, { content: 'sample-content' });
    });

    test('should succeed when the signature is valid and matches the owner', async () => {
      wallet.web3.eth.accounts.recover = jest.fn(() => 'someOwner');
      await readCertificate(validSignatureData, callback, configuration);
      expect(callback).toHaveBeenCalledWith(null, { content: 'sample-content' });
    });

    it('should work with a message/signature and correctly lowercase the needed data', async () => {
      wallet.web3.eth.accounts.recover = jest.fn(() => 'someOwner');

      const timestamp = new Date().toISOString();

      const data = {
        certificateId: '84801077',
        authentification: {
          message: '{"certificateId":"84801077","timestamp":"'+timestamp+'"}',
          signature:
            '0x0de47a78ee3e683fdfa57c654e80e9d51aea1d6192c5dcd00d548d28e9383d3f42685c9a383549fdca36e89cc05bf4a4ff82ad4d18c1bc8094daa0f2f80ce5c61b',
          messageHash: '0x0738b04b872fe8d68fa24c0ec3cd69a0ba15a78021c4e38ed4028c4ac80e0e72',
        },
      };

      const callback = jest.fn();

      await readCertificate(data, callback, configuration);

      expect(callback).toHaveBeenCalledWith(null, expect.any(Object));
    });
  });

  // Add more test cases:
  // - when bearer is invalid
  // - when signature is too old
  // - when signature is from owner/issuer/key
  // - when neither bearer nor signature is present
  // and so on...
});
