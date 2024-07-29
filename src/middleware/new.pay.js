class Data {
  constructor(authorizationUrl, accessCode, reference) {
    this.authorization_url = authorizationUrl;
    this.access_code = accessCode;
    this.reference = reference;
  }
}

class PaystackResponseDto {
  constructor(status, message, paymentReference = '', data) {
    this.status = status;
    this.message = message;
    this.paymentReference = paymentReference;
    this.data = data;
  }
}
