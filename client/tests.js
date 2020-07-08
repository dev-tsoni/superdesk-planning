import 'angular';
import 'angular-mocks';
import moment from 'moment';
import './';

import {appConfig} from 'appConfig';
import {updateConfigAfterLoad} from './config';

Object.assign(appConfig, {
    server: {url: 'http://server.com'},
    view: {
        timeformat: 'HH:mm',
        dateformat: 'DD/MM/YYYY',
    },
    model: {dateformat: 'DD/MM/YYYY'},
    shortTimeFormat: 'HH:mm',
    defaultTimezone: 'Australia/Sydney',
});

moment.tz.setDefault('Australia/Sydney');
updateConfigAfterLoad();

var testsContext = require.context('.', true, /_test.[j|t]sx?$/);

testsContext.keys().forEach(testsContext);
