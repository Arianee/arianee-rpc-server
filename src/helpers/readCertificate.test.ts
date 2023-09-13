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

      // Expect the callback to be called with the WRONGJWT error since the issuer doesn't match owner or issuer
      expect(callback).toHaveBeenCalledWith(getError(ErrorEnum.WRONGJWT));
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
          signature: 'someSignature',
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
          signature: 'someValidSignature',
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

      const data = {
        certificateId: '84801077',
        authentification: {
          message: '{"certificateId":"84801077","timestamp":"2023-09-13T12:14:18.711Z"}',
          signature:
            '0x667c2b9eddaca95e57861027a98d6bf4c2b92daff6746be36bdc4f39a5fd2915075dbedd304d6121fbaa3e472f93869260f1c003e05f0557519823a32a3fcf381b',
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
