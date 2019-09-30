"use strict";
class CertificateSummaryBuilder {
    constructor(wallet) {
        this.wallet = wallet;
    }
    setContent(content) {
        this._content = content;
        return this;
    }
    setOwner(owner) {
        this._owner = owner;
        return this;
    }
    setIsCertificateValid(isCertificateValid) {
        this._isCertificateValid = isCertificateValid;
        return this;
    }
    build() {
        const arianeCertificate = {
            content: this._content,
            isCertificateValid: this._isCertificateValid,
            isOwner: this._owner === this.wallet.publicKey,
            owner: this._owner
        };
        return arianeCertificate;
    }
}
exports.CertificateSummaryBuilder = CertificateSummaryBuilder;
//# sourceMappingURL=certificate-summary.js.map