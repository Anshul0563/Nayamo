const shippingController = require('../controllers/shippingController');

describe('shipping controller pickup workflow', () => {
  it('exposes a bulk shipment creation handler for selected orders', () => {
    expect(typeof shippingController.createBulkShipment).toBe('function');
  });

  it('exposes an explicit request pickup handler for admin-initiated Delhivery pickup requests', () => {
    expect(typeof shippingController.requestPickup).toBe('function');
  });

  it('exposes a shipment label retrieval handler once a waybill exists', () => {
    expect(typeof shippingController.getShipmentLabel).toBe('function');
  });

  it('exposes an explicit return pickup handler for return shipments', () => {
    expect(typeof shippingController.requestReturnPickup).toBe('function');
  });

  it('exposes a return shipment label retrieval handler once a return waybill exists', () => {
    expect(typeof shippingController.getReturnLabel).toBe('function');
  });
});
