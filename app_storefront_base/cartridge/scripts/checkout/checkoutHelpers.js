'use strict';

var server = require('server');

var collections = require('*/cartridge/scripts/util/collections');

var BasketMgr = require('dw/order/BasketMgr');
var HashMap = require('dw/util/HashMap');
var HookMgr = require('dw/system/HookMgr');
var Mail = require('dw/net/Mail');
var OrderMgr = require('dw/order/OrderMgr');
var PaymentInstrument = require('dw/order/PaymentInstrument');
var PaymentMgr = require('dw/order/PaymentMgr');
var Order = require('dw/order/Order');
var Status = require('dw/system/Status');
var Resource = require('dw/web/Resource');
var Site = require('dw/system/Site');
var Template = require('dw/util/Template');
var Transaction = require('dw/system/Transaction');

var AddressModel = require('*/cartridge/models/address');
var formErrors = require('*/cartridge/scripts/formErrors');

var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
var ShippingHelper = require('*/cartridge/scripts/checkout/shippingHelpers');

var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');

// static functions needed for Checkout Controller logic

/**
 * Prepares the Shipping form
 * @returns {Object} processed Shipping form object
 */
function prepareShippingForm() {
    var shippingForm = server.forms.getForm('shipping');

    shippingForm.clear();

    return shippingForm;
}

/**
 * Prepares the Billing form
 * @returns {Object} processed Billing form object
 */
function prepareBillingForm() {
    var billingForm = server.forms.getForm('billing');
    billingForm.clear();

    return billingForm;
}

/**
 * Validate billing form
 * @param {Object} form - the form object with pre-validated form fields
 * @returns {Object} the names of the invalid form fields
 */
function validateFields(form) {
    return formErrors.getFormErrors(form);
}

/**
 * Validate shipping form fields
 * @param {Object} form - the form object with pre-validated form fields
 * @param {Array} fields - the fields to validate
 * @returns {Object} the names of the invalid form fields
 */
function validateShippingForm(form) {
    return validateFields(form);
}

/**
 * Checks to see if the shipping address is initialized
 * @param {dw.order.Shipment} [shipment] - Script API Shipment object
 * @returns {boolean} returns true if defaulShipment.shippingAddress is not null
 */
function isShippingAddressInitialized(shipment) {
    var currentBasket = BasketMgr.getCurrentBasket();
    var initialized = false;

    if (currentBasket) {
        if (shipment) {
            initialized = !!shipment.shippingAddress;
        } else {
            initialized = !!currentBasket.defaultShipment.shippingAddress;
        }
    }

    return initialized;
}

/**
 * Copies a CustomerAddress to a Shipment as its Shipping Address
 * @param {dw.customer.CustomerAddress} address - The customer address
 * @param {dw.order.Shipment} [shipmentOrNull] - The target shipment
 */
function copyCustomerAddressToShipment(address, shipmentOrNull) {
    var currentBasket = BasketMgr.getCurrentBasket();
    var shipment = shipmentOrNull || currentBasket.defaultShipment;
    var shippingAddress = shipment.shippingAddress;

    Transaction.wrap(function () {
        if (shippingAddress === null) {
            shippingAddress = shipment.createShippingAddress();
        }

        shippingAddress.setFirstName(address.firstName);
        shippingAddress.setLastName(address.lastName);
        shippingAddress.setAddress1(address.address1);
        shippingAddress.setAddress2(address.address2);
        shippingAddress.setCity(address.city);
        shippingAddress.setPostalCode(address.postalCode);
        shippingAddress.setStateCode(address.stateCode);
        var countryCode = address.countryCode;
        shippingAddress.setCountryCode(countryCode.value);
        shippingAddress.setPhone(address.phone);
    });
}

/**
 * Copies a CustomerAddress to a Basket as its Billing Address
 * @param {dw.customer.CustomerAddress} address - The customer address
 */
function copyCustomerAddressToBilling(address) {
    var currentBasket = BasketMgr.getCurrentBasket();
    var billingAddress = currentBasket.billingAddress;

    Transaction.wrap(function () {
        if (!billingAddress) {
            billingAddress = currentBasket.createBillingAddress();
        }

        billingAddress.setFirstName(address.firstName);
        billingAddress.setLastName(address.lastName);
        billingAddress.setAddress1(address.address1);
        billingAddress.setAddress2(address.address2);
        billingAddress.setCity(address.city);
        billingAddress.setPostalCode(address.postalCode);
        billingAddress.setStateCode(address.stateCode);
        var countryCode = address.countryCode;
        billingAddress.setCountryCode(countryCode.value);
        if (!billingAddress.phone) {
            billingAddress.setPhone(address.phone);
        }
    });
}

/**
 * Copies information from the shipping form to the associated shipping address
 * @param {Object} shippingData - the shipping data
 * @param {dw.order.Shipment} [shipmentOrNull] - the target Shipment
 */
function copyShippingAddressToShipment(shippingData, shipmentOrNull) {
    var currentBasket = BasketMgr.getCurrentBasket();
    var shipment = shipmentOrNull || currentBasket.defaultShipment;

    var shippingAddress = shipment.shippingAddress;

    Transaction.wrap(function () {
        if (shippingAddress === null) {
            shippingAddress = shipment.createShippingAddress();
        }

        shippingAddress.setFirstName(shippingData.address.firstName);
        shippingAddress.setLastName(shippingData.address.lastName);
        shippingAddress.setAddress1(shippingData.address.address1);
        shippingAddress.setAddress2(shippingData.address.address2);
        shippingAddress.setCity(shippingData.address.city);
        shippingAddress.setPostalCode(shippingData.address.postalCode);
        shippingAddress.setStateCode(shippingData.address.stateCode);
        shippingAddress.setCountryCode(shippingData.address.countryCode);
        shippingAddress.setPhone(shippingData.address.phone);

        ShippingHelper.selectShippingMethod(shipment, shippingData.shippingMethod);
    });
}

/**
 * Copies a raw address object to the baasket billing address
 * @param {Object} address - an address-similar Object (firstName, ...)
 */
function copyBillingAddressToBasket(address) {
    var currentBasket = BasketMgr.getCurrentBasket();
    var billingAddress = currentBasket.billingAddress;

    Transaction.wrap(function () {
        if (!billingAddress) {
            billingAddress = currentBasket.createBillingAddress();
        }

        billingAddress.setFirstName(address.firstName);
        billingAddress.setLastName(address.lastName);
        billingAddress.setAddress1(address.address1);
        billingAddress.setAddress2(address.address2);
        billingAddress.setCity(address.city);
        billingAddress.setPostalCode(address.postalCode);
        billingAddress.setStateCode(address.stateCode);
        billingAddress.setCountryCode(address.countryCode.value);
        if (!billingAddress.phone) {
            billingAddress.setPhone(address.phone);
        }
    });
}

/**
 * Returns the first non-default shipment with more than one product line item
 * @param {dw.order.Basket} currentBasket - The current Basket
 * @returns {dw.order.Shipment} - the shipment
 */
function getFirstNonDefaultShipmentWithProductLineItems(currentBasket) {
    var shipment;
    var match;

    for (var i = 0, ii = currentBasket.shipments.length; i < ii; i++) {
        shipment = currentBasket.shipments[i];
        if (!shipment.default && shipment.productLineItems.length > 0) {
            match = shipment;
            break;
        }
    }

    return match;
}

/**
 * Ensures that no shipment exists with 0 product line items
 * @param {Object} req - the request object needed to access session.privacyCache
 */
function ensureNoEmptyShipments(req) {
    Transaction.wrap(function () {
        var currentBasket = BasketMgr.getCurrentBasket();

        var iter = currentBasket.shipments.iterator();
        var shipment;
        var shipmentsToDelete = [];

        while (iter.hasNext()) {
            shipment = iter.next();
            if (shipment.productLineItems.length < 1 && shipmentsToDelete.indexOf(shipment) < 0) {
                if (shipment.default) {
                    // Cant delete the defaultShipment
                    // Copy all line items from 2nd to first
                    var altShipment = getFirstNonDefaultShipmentWithProductLineItems(currentBasket);
                    if (!altShipment) return;

                    // Move the valid marker with the shipment
                    var altValid = req.session.privacyCache.get(altShipment.UUID);
                    req.session.privacyCache.set(currentBasket.defaultShipment.UUID, altValid);

                    collections.forEach(altShipment.productLineItems,
                        function (lineItem) {
                            lineItem.setShipment(currentBasket.defaultShipment);
                        });

                    if (altShipment.shippingAddress) {
                        // Copy from other address
                        var addressModel = new AddressModel(altShipment.shippingAddress);
                        copyShippingAddressToShipment(addressModel, currentBasket.defaultShipment);
                    } else {
                        // Or clear it out
                        currentBasket.defaultShipment.createShippingAddress();
                    }

                    if (altShipment.custom && altShipment.custom.fromStoreId && altShipment.custom.shipmentType) {
                        currentBasket.defaultShipment.custom.fromStoreId = altShipment.custom.fromStoreId;
                        currentBasket.defaultShipment.custom.shipmentType = altShipment.custom.shipmentType;
                    }

                    currentBasket.defaultShipment.setShippingMethod(altShipment.shippingMethod);
                    // then delete 2nd one
                    shipmentsToDelete.push(altShipment);
                } else {
                    shipmentsToDelete.push(shipment);
                }
            }
        }

        for (var j = 0, jj = shipmentsToDelete.length; j < jj; j++) {
            currentBasket.removeShipment(shipmentsToDelete[j]);
        }
    });
}

/**
 * Recalculates the currentBasket
 * @param {dw.order.Basket} currentBasket - the target Basket
 */
function recalculateBasket(currentBasket) {
    // Calculate the basket
    Transaction.wrap(function () {
        basketCalculationHelpers.calculateTotals(currentBasket);
    });
}


/**
 * Finds and returns a ProductLineItem by UUID
 * @param {dw.order.Basket} currentBasket - the basket to search
 * @param {string} pliUUID - the target UUID
 * @returns {dw.order.ProductLineItem} the associated ProductLineItem
 */
function getProductLineItem(currentBasket, pliUUID) {
    var productLineItem;
    var pli;
    for (var i = 0, ii = currentBasket.productLineItems.length; i < ii; i++) {
        pli = currentBasket.productLineItems[i];
        if (pli.UUID === pliUUID) {
            productLineItem = pli;
            break;
        }
    }
    return productLineItem;
}

/**
 * Validate billing form fields
 * @param {Object} form - the form object with pre-validated form fields
 * @param {Array} fields - the fields to validate
 * @returns {Object} the names of the invalid form fields
 */
function validateBillingForm(form) {
    return validateFields(form);
}

/**
 * Validate credit card form fields
 * @param {Object} form - the form object with pre-validated form fields
 * @returns {Object} the names of the invalid form fields
 */
function validateCreditCard(form) {
    var result = {};
    var currentBasket = BasketMgr.getCurrentBasket();

    if (!form.paymentMethod.value) {
        if (currentBasket.totalGrossPrice.value > 0) {
            result[form.paymentMethod.htmlName] =
                Resource.msg('error.no.selected.payment.method', 'creditCard', null);
        }

        return result;
    }

    return validateFields(form);
}

/**
 * Sets the payment transaction amount
 * @param {dw.order.Basket} currentBasket - The current basket
 * @returns {Object} an error object
 */
function calculatePaymentTransaction(currentBasket) {
    var result = { error: false };

    try {
        Transaction.wrap(function () {
            // TODO: This function will need to account for gift certificates at a later date
            var orderTotal = currentBasket.totalGrossPrice;
            var paymentInstrument = currentBasket.paymentInstrument;
            paymentInstrument.paymentTransaction.setAmount(orderTotal);
        });
    } catch (e) {
        result.error = true;
    }

    return result;
}


/**
 * Validates payment
 * @param {Object} req - The local instance of the request object
 * @param {dw.order.Basket} currentBasket - The current basket
 * @returns {Object} an object that has error information
 */
function validatePayment(req, currentBasket) {
    var applicablePaymentCards;
    var applicablePaymentMethods;
    var creditCardPaymentMethod = PaymentMgr.getPaymentMethod(PaymentInstrument.METHOD_CREDIT_CARD);
    var paymentAmount = currentBasket.totalGrossPrice.value;
    var countryCode = req.geolocation.countryCode;
    var currentCustomer = req.currentCustomer.raw;
    var paymentInstruments = currentBasket.paymentInstruments;
    var result = {};

    applicablePaymentMethods = PaymentMgr.getApplicablePaymentMethods(
        currentCustomer,
        countryCode,
        paymentAmount
    );
    applicablePaymentCards = creditCardPaymentMethod.getApplicablePaymentCards(
        currentCustomer,
        countryCode,
        paymentAmount
    );

    var invalid = true;

    for (var i = 0; i < paymentInstruments.length; i++) {
        var paymentInstrument = paymentInstruments[i];

        if (PaymentInstrument.METHOD_GIFT_CERTIFICATE.equals(paymentInstrument.paymentMethod)) {
            invalid = false;
        }

        var paymentMethod = PaymentMgr.getPaymentMethod(paymentInstrument.getPaymentMethod());

        if (paymentMethod && applicablePaymentMethods.contains(paymentMethod)) {
            if (PaymentInstrument.METHOD_CREDIT_CARD.equals(paymentInstrument.paymentMethod)) {
                var card = PaymentMgr.getPaymentCard(paymentInstrument.creditCardType);

                // Checks whether payment card is still applicable.
                if (card && applicablePaymentCards.contains(card)) {
                    invalid = false;
                }
            } else {
                invalid = false;
            }
        }

        if (invalid) {
            break; // there is an invalid payment instrument
        }
    }

    result.error = invalid;
    return result;
}

/**
 * Attempts to create an order from the current basket
 * @param {dw.order.Basket} currentBasket - The current basket
 * @returns {dw.order.Order} The order object created from the current basket
 */
function createOrder(currentBasket) {
    var order;

    try {
        order = Transaction.wrap(function () {
            return OrderMgr.createOrder(currentBasket);
        });
    } catch (error) {
        return null;
    }
    return order;
}

/**
 * handles the payment authorization for each payment instrument
 * @param {dw.order.Order} order - the order object
 * @param {string} orderNumber - The order number for the order
 * @returns {Object} an error object
 */
function handlePayments(order, orderNumber) {
    var result = {};

    if (order.totalNetPrice !== 0.00) {
        var paymentInstruments = order.paymentInstruments;

        if (paymentInstruments.length === 0) {
            Transaction.wrap(function () { OrderMgr.failOrder(order); });
            result.error = true;
        }

        if (!result.error) {
            for (var i = 0; i < paymentInstruments.length; i++) {
                var paymentInstrument = paymentInstruments[i];
                var paymentProcessor = PaymentMgr
                    .getPaymentMethod(paymentInstrument.paymentMethod)
                    .paymentProcessor;
                var authorizationResult;
                if (paymentProcessor === null) {
                    Transaction.begin();
                    paymentInstrument.paymentTransaction.setTransactionID(orderNumber);
                    Transaction.commit();
                } else {
                    if (HookMgr.hasHook('app.payment.processor.' +
                            paymentProcessor.ID.toLowerCase())) {
                        authorizationResult = HookMgr.callHook(
                            'app.payment.processor.' + paymentProcessor.ID.toLowerCase(),
                            'Authorize',
                            orderNumber,
                            paymentInstrument,
                            paymentProcessor
                        );
                    } else {
                        authorizationResult = HookMgr.callHook(
                            'app.payment.processor.default',
                            'Authorize'
                        );
                    }

                    if (authorizationResult.error) {
                        Transaction.wrap(function () { OrderMgr.failOrder(order); });
                        result.error = true;
                        break;
                    }
                }
            }
        }
    }

    return result;
}

/**
 * Sends a confirmation to the current user
 * @param {dw.order.Order} order - The current user's order
 * @param {string} locale - the current request's locale id
 * @returns {void}
 */
function sendConfirmationEmail(order, locale) {
    var OrderModel = require('*/cartridge/models/order');
    var Locale = require('dw/util/Locale');

    var confirmationEmail = new Mail();
    var context = new HashMap();
    var currentLocale = Locale.getLocale(locale);

    var orderModel = new OrderModel(order, { countryCode: currentLocale.country });

    var orderObject = { order: orderModel };

    confirmationEmail.addTo(order.customerEmail);
    confirmationEmail.setSubject(Resource.msg('subject.order.confirmation.email', 'order', null));
    confirmationEmail.setFrom(Site.current.getCustomPreferenceValue('customerServiceEmail')
        || 'no-reply@salesforce.com');

    Object.keys(orderObject).forEach(function (key) {
        context.put(key, orderObject[key]);
    });

    var template = new Template('checkout/confirmation/confirmationEmail');
    var content = template.render(context).text;
    confirmationEmail.setContent(content, 'text/html', 'UTF-8');
    confirmationEmail.send();
}

/**
 * Attempts to place the order
 * @param {dw.order.Order} order - The order object to be placed
 * @returns {Object} an error object
 */
function placeOrder(order) {
    var result = { error: false };

    try {
        Transaction.begin();
        var placeOrderStatus = OrderMgr.placeOrder(order);
        if (placeOrderStatus === Status.ERROR) {
            throw new Error();
        }
        order.setConfirmationStatus(Order.CONFIRMATION_STATUS_CONFIRMED);
        order.setExportStatus(Order.EXPORT_STATUS_READY);
        Transaction.commit();
    } catch (e) {
        Transaction.wrap(function () { OrderMgr.failOrder(order); });
        result.error = true;
    }

    return result;
}

/**
 * saves payment instruemnt to customers wallet
 * @param {Object} billingData - billing information entered by the user
 * @param {dw.order.Basket} currentBasket - The current basket
 * @param {dw.customer.Customer} customer - The current customer
 * @returns {dw.customer.CustomerPaymentInstrument} newly stored payment Instrument
 */
function savePaymentInstrumentToWallet(billingData, currentBasket, customer) {
    var wallet = customer.getProfile().getWallet();

    return Transaction.wrap(function () {
        var storedPaymentInstrument = wallet.createPaymentInstrument('CREDIT_CARD');

        storedPaymentInstrument.setCreditCardHolder(
            currentBasket.billingAddress.fullName
        );
        storedPaymentInstrument.setCreditCardNumber(
            billingData.paymentInformation.cardNumber.value
        );
        storedPaymentInstrument.setCreditCardType(
            billingData.paymentInformation.cardType.value
        );
        storedPaymentInstrument.setCreditCardExpirationMonth(
            billingData.paymentInformation.expirationMonth.value
        );
        storedPaymentInstrument.setCreditCardExpirationYear(
            billingData.paymentInformation.expirationYear.value
        );

        var token = HookMgr.callHook(
            'app.payment.processor.basic_credit',
            'createMockToken'
        );

        storedPaymentInstrument.setCreditCardToken(token);

        return storedPaymentInstrument;
    });
}

/**
 * renders the user's stored payment Instruments
 * @param {Object} req - The request object
 * @param {Object} accountModel - The account model for the current customer
 * @returns {string|null} newly stored payment Instrument
 */
function getRenderedPaymentInstruments(req, accountModel) {
    var result;

    if (req.currentCustomer.raw.authenticated
        && req.currentCustomer.raw.registered
        && req.currentCustomer.raw.profile.wallet.paymentInstruments.getLength()
    ) {
        var context;
        var template = 'checkout/billing/storedPaymentInstruments';

        context = { customer: accountModel };
        result = renderTemplateHelper.getRenderedHtml(
            context,
            template
        );
    }

    return result || null;
}

module.exports = {
    getFirstNonDefaultShipmentWithProductLineItems: getFirstNonDefaultShipmentWithProductLineItems,
    ensureNoEmptyShipments: ensureNoEmptyShipments,
    getProductLineItem: getProductLineItem,
    isShippingAddressInitialized: isShippingAddressInitialized,
    prepareShippingForm: prepareShippingForm,
    prepareBillingForm: prepareBillingForm,
    copyCustomerAddressToShipment: copyCustomerAddressToShipment,
    copyCustomerAddressToBilling: copyCustomerAddressToBilling,
    copyShippingAddressToShipment: copyShippingAddressToShipment,
    copyBillingAddressToBasket: copyBillingAddressToBasket,
    validateFields: validateFields,
    validateShippingForm: validateShippingForm,
    validateBillingForm: validateBillingForm,
    validatePayment: validatePayment,
    validateCreditCard: validateCreditCard,
    calculatePaymentTransaction: calculatePaymentTransaction,
    recalculateBasket: recalculateBasket,
    handlePayments: handlePayments,
    createOrder: createOrder,
    placeOrder: placeOrder,
    savePaymentInstrumentToWallet: savePaymentInstrumentToWallet,
    getRenderedPaymentInstruments: getRenderedPaymentInstruments,
    sendConfirmationEmail: sendConfirmationEmail
};
