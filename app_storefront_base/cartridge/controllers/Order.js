'use strict';

var server = require('server');

var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

server.get(
    'Confirm',
    consentTracking.consent,
    server.middleware.https,
    csrfProtection.generateToken,
    function (req, res, next) {
        var reportingUrlsHelper = require('*/cartridge/scripts/reportingUrls');
        var OrderMgr = require('dw/order/OrderMgr');
        var OrderModel = require('*/cartridge/models/order');
        var Locale = require('dw/util/Locale');

        var order = OrderMgr.getOrder(req.querystring.ID);
        var token = req.querystring.token ? req.querystring.token : null;

        if (!order
            || !token
            || token !== order.orderToken
            || order.customer.ID !== req.currentCustomer.raw.ID
        ) {
            res.render('/error', {
                message: Resource.msg('error.confirmation.error', 'confirmation', null)
            });

            return next();
        }

        var config = {
            numberOfLineItems: '*'
        };

        var currentLocale = Locale.getLocale(req.locale.id);

        var orderModel = new OrderModel(
            order,
            { config: config, countryCode: currentLocale.country, containerView: 'order' }
        );
        var passwordForm;

        var reportingURLs = reportingUrlsHelper.getOrderReportingURLs(order);

        if (!req.currentCustomer.profile) {
            passwordForm = server.forms.getForm('newPasswords');
            passwordForm.clear();
            res.render('checkout/confirmation/confirmation', {
                order: orderModel,
                returningCustomer: false,
                passwordForm: passwordForm,
                reportingURLs: reportingURLs
            });
        } else {
            res.render('checkout/confirmation/confirmation', {
                order: orderModel,
                returningCustomer: true,
                reportingURLs: reportingURLs
            });
        }

        return next();
    }
);

server.get(
    'Track',
    consentTracking.consent,
    server.middleware.https,
    csrfProtection.validateRequest,
    csrfProtection.generateToken,
    function (req, res, next) {
        var OrderMgr = require('dw/order/OrderMgr');
        var OrderModel = require('*/cartridge/models/order');
        var Locale = require('dw/util/Locale');

        var order;
        var validForm = true;

        var profileForm = server.forms.getForm('profile');
        profileForm.clear();

        if (req.querystring.trackOrderEmail
            && req.querystring.trackOrderPostal
            && req.querystring.trackOrderNumber) {
            order = OrderMgr.getOrder(req.querystring.trackOrderNumber);
        } else {
            validForm = false;
        }

        if (!order) {
            res.render('/account/login', {
                navTabValue: 'login',
                orderTrackFormError: validForm,
                profileForm: profileForm,
                userName: ''
            });
            next();
        } else {
            var config = {
                numberOfLineItems: '*'
            };

            var currentLocale = Locale.getLocale(req.locale.id);

            var orderModel = new OrderModel(
                order,
                { config: config, countryCode: currentLocale.country, containerView: 'order' }
            );

            // check the email and postal code of the form
            if (req.querystring.trackOrderEmail.toLowerCase()
                    !== orderModel.orderEmail.toLowerCase()) {
                validForm = false;
            }

            if (req.querystring.trackOrderPostal
                !== orderModel.billing.billingAddress.address.postalCode) {
                validForm = false;
            }

            if (validForm) {
                var exitLinkText;
                var exitLinkUrl;

                exitLinkText = !req.currentCustomer.profile
                    ? Resource.msg('link.continue.shop', 'order', null)
                    : Resource.msg('link.orderdetails.myaccount', 'account', null);

                exitLinkUrl = !req.currentCustomer.profile
                    ? URLUtils.url('Home-Show')
                    : URLUtils.https('Account-Show');

                res.render('account/orderDetails', {
                    order: orderModel,
                    exitLinkText: exitLinkText,
                    exitLinkUrl: exitLinkUrl
                });
            } else {
                res.render('/account/login', {
                    navTabValue: 'login',
                    profileForm: profileForm,
                    orderTrackFormError: !validForm,
                    userName: ''
                });
            }

            next();
        }
    }
);

server.get(
    'History',
    consentTracking.consent,
    server.middleware.https,
    userLoggedIn.validateLoggedIn,
    function (req, res, next) {
        var OrderHelpers = require('*/cartridge/scripts/order/orderHelpers');

        var ordersResult = OrderHelpers.getOrders(
            req.currentCustomer,
            req.querystring,
            req.locale.id
        );
        var orders = ordersResult.orders;
        var filterValues = ordersResult.filterValues;
        var breadcrumbs = [
            {
                htmlValue: Resource.msg('global.home', 'common', null),
                url: URLUtils.home().toString()
            },
            {
                htmlValue: Resource.msg('page.title.myaccount', 'account', null),
                url: URLUtils.url('Account-Show').toString()
            }
        ];

        res.render('account/order/history', {
            orders: orders,
            filterValues: filterValues,
            orderFilter: req.querystring.orderFilter,
            accountlanding: false,
            breadcrumbs: breadcrumbs
        });
        next();
    }
);

server.get(
    'Details',
    consentTracking.consent,
    server.middleware.https,
    userLoggedIn.validateLoggedIn,
    function (req, res, next) {
        var OrderMgr = require('dw/order/OrderMgr');
        var OrderModel = require('*/cartridge/models/order');
        var Locale = require('dw/util/Locale');

        var order = OrderMgr.getOrder(req.querystring.orderID);
        var orderCustomerNo = req.currentCustomer.profile.customerNo;
        var currentCustomerNo = order.customer.profile.customerNo;
        var breadcrumbs = [
            {
                htmlValue: Resource.msg('global.home', 'common', null),
                url: URLUtils.home().toString()
            },
            {
                htmlValue: Resource.msg('page.title.myaccount', 'account', null),
                url: URLUtils.url('Account-Show').toString()
            },
            {
                htmlValue: Resource.msg('label.orderhistory', 'account', null),
                url: URLUtils.url('Order-History').toString()
            }
        ];

        if (order && orderCustomerNo === currentCustomerNo) {
            var config = {
                numberOfLineItems: '*'
            };

            var currentLocale = Locale.getLocale(req.locale.id);

            var orderModel = new OrderModel(
                order,
                { config: config, countryCode: currentLocale.country, containerView: 'order' }
            );
            var exitLinkText = Resource.msg('link.orderdetails.orderhistory', 'account', null);
            var exitLinkUrl =
                URLUtils.https('Order-History', 'orderFilter', req.querystring.orderFilter);
            res.render('account/orderDetails', {
                order: orderModel,
                exitLinkText: exitLinkText,
                exitLinkUrl: exitLinkUrl,
                breadcrumbs: breadcrumbs
            });
        } else {
            res.redirect(URLUtils.url('Account-Show'));
        }
        next();
    }
);

server.get(
    'Filtered',
    server.middleware.https,
    consentTracking.consent,
    userLoggedIn.validateLoggedInAjax,
    function (req, res, next) {
        var OrderHelpers = require('*/cartridge/scripts/order/orderHelpers');

        var data = res.getViewData();
        if (data && !data.loggedin) {
            res.json();
            return next();
        }

        var ordersResult = OrderHelpers.getOrders(
            req.currentCustomer,
            req.querystring,
            req.locale.id
        );
        var orders = ordersResult.orders;
        var filterValues = ordersResult.filterValues;

        res.render('account/order/orderList', {
            orders: orders,
            filterValues: filterValues,
            orderFilter: req.querystring.orderFilter,
            accountlanding: false
        });
        return next();
    }
);

server.post(
    'CreateAccount',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var OrderMgr = require('dw/order/OrderMgr');

        var formErrors = require('*/cartridge/scripts/formErrors');

        var passwordForm = server.forms.getForm('newPasswords');
        var newPassword = passwordForm.newpassword.htmlValue;
        var confirmPassword = passwordForm.newpasswordconfirm.htmlValue;
        if (newPassword !== confirmPassword) {
            passwordForm.valid = false;
            passwordForm.newpasswordconfirm.valid = false;
            passwordForm.newpasswordconfirm.error =
                Resource.msg('error.message.mismatch.newpassword', 'forms', null);
        }

        var order = OrderMgr.getOrder(req.querystring.ID);

        var registrationObj = {
            firstName: order.billingAddress.firstName,
            lastName: order.billingAddress.lastName,
            phone: order.billingAddress.phone,
            email: order.customerEmail,
            password: newPassword
        };

        if (passwordForm.valid) {
            res.setViewData(registrationObj);

            this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
                var CustomerMgr = require('dw/customer/CustomerMgr');
                var Transaction = require('dw/system/Transaction');
                var OrderHelpers = require('*/cartridge/scripts/order/orderHelpers');

                var registrationData = res.getViewData();

                var login = registrationData.email;
                var password = registrationData.password;
                var newCustomer;
                var authenticatedCustomer;
                var newCustomerProfile;
                var registeredUser;

                delete registrationData.email;
                delete registrationData.password;

                // attempt to create a new user and log that user in.
                try {
                    Transaction.wrap(function () {
                        newCustomer = CustomerMgr.createCustomer(login, password);
                        authenticatedCustomer =
                            CustomerMgr.loginCustomer(login, password, false);
                        if (newCustomer && authenticatedCustomer.authenticated) {
                            // assign values to the profile
                            newCustomerProfile = newCustomer.getProfile();
                            newCustomerProfile.firstName = registrationData.firstName;
                            newCustomerProfile.lastName = registrationData.lastName;
                            newCustomerProfile.phoneHome = registrationData.phone;
                            newCustomerProfile.email = login;
                            order.setCustomer(newCustomer);
                            registeredUser = {
                                email: login,
                                firstName: registrationData.firstName,
                                lastName: registrationData.lastName
                            };
                            OrderHelpers.sendConfirmationEmail(registeredUser);
                            res.json({
                                success: true,
                                redirectUrl: URLUtils.url('Account-Show',
                                    'registration', 'submitted'
                                ).toString()
                            });
                        }
                    });
                } catch (e) {
                    res.json({
                        error: [Resource.msg('error.account.exists', 'checkout', null)]
                    }); // Show error if the login email already exists
                }
            });
        } else {
            res.json({
                fields: formErrors.getFormErrors(passwordForm)
            });
        }

        return next();
    }
);

module.exports = server.exports();
