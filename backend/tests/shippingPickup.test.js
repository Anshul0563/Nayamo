const shippingController = require('../controllers/shippingController');

describe('shipping controller pickup workflow', () => {
  it('exposes an explicit request pickup handler for admin-initiated Delhivery pickup requests', () => {
    expect(typeof shippingController.requestPickup).toBe('function');
  });

  it('exposes a shipment label retrieval handler once a waybill exists', () => {
    expect(typeof shippingController.getShipmentLabel).toBe('function');
  });
});
