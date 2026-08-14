jest.mock('axios', () => ({
  create: jest.fn(),
}));

jest.mock('../config/env', () => ({
  getDelhiveryBaseUrl: jest.fn(() => 'https://track.delhivery.com'),
  getDelhiveryToken: jest.fn(() => 'test-token'),
  isConfigured: jest.fn(() => true),
}));

const axios = require('axios');
const shippingController = require('../controllers/shippingController');
const delhiveryService = require('../services/delhiveryService');
const qs = require('querystring');

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

  it('sends a valid COD amount to Delhivery and rejects zero-value COD orders', async () => {
    const post = jest.fn().mockResolvedValue({
      data: {
        packages: [{ waybill: 'WB123', label_url: 'https://example.com/label' }],
      },
    });

    axios.create.mockReturnValue({ post });

    const codOrder = {
      _id: '507f1f77bcf86cd799439011',
      user: { name: 'Test Buyer' },
      address: '12 Main Street, Delhi',
      phone: '9876543210',
      paymentMethod: 'cod',
      totalPrice: 2540,
      items: [{ product: 'prod-1' }],
    };

    await delhiveryService.createShipment(codOrder);

    expect(post).toHaveBeenCalledTimes(1);
    const [, formBody] = post.mock.calls[0];
    const parsed = qs.parse(formBody);
    const payload = JSON.parse(parsed.data);
    const shipment = payload.shipments[0];

    expect(shipment.payment).toBe('COD');
    expect(shipment.payment_mode).toBe('COD');
    expect(shipment.cod_amount).toBe(2540);
    expect(shipment.total_amount).toBe(2540);

    await expect(
      delhiveryService.createShipment({
        ...codOrder,
        totalPrice: 0,
      }),
    ).rejects.toThrow('positive total amount');
  });

  it('sends zero COD amount for prepaid orders', async () => {
    const post = jest.fn().mockResolvedValue({
      data: {
        packages: [{ waybill: 'WB456', label_url: 'https://example.com/prepaid' }],
      },
    });

    axios.create.mockReturnValue({ post });

    const prepaidOrder = {
      _id: '507f1f77bcf86cd799439012',
      user: { name: 'Test Buyer' },
      address: '12 Main Street, Delhi',
      phone: '9876543210',
      paymentMethod: 'online',
      totalPrice: 1899,
      items: [{ product: 'prod-2' }],
    };

    await delhiveryService.createShipment(prepaidOrder);

    const [, formBody] = post.mock.calls[0];
    const parsed = qs.parse(formBody);
    const payload = JSON.parse(parsed.data);
    const shipment = payload.shipments[0];

    expect(shipment.payment).toBe('Prepaid');
    expect(shipment.payment_mode).toBe('Prepaid');
    expect(shipment.cod_amount).toBe(0);
    expect(shipment.total_amount).toBe(1899);
  });
});
